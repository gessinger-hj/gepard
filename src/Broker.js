#!/usr/bin/env node

/**
 * [net description]
 * @type {[type]}
 */
var net           = require ( 'net' ) ;
var util          = require ( 'util' ) ;
var EventEmitter  = require ( "events" ).EventEmitter ;
var Event         = require ( "./Event" ) ;
var T             = require ( "./Tango" ) ;
var MultiHash     = require ( "./MultiHash" ) ;
var Log           = require ( "./LogFile" ) ;
var os            = require ( "os" ) ;
var fs            = require ( "fs" ) ;
var dns           = require ( "dns" ) ;
var Path          = require ( "path" ) ;
var FileContainer = require ( "./FileContainer" ) ;
var Gepard        = require ( "./Gepard" ) ;
var TracePoints   = require ( "./TracePoints" ) ;
var JSAcc         = require ( "./JSAcc" ) ;
var BTaskHandler  = require ( "./BTaskHandler" ) ;

if ( typeof Promise === 'undefined' ) // since node 0.12+
{
  Promise = require ( "promise" ) ;
}

/**
 * Description
 * @constructor Connection
 * @param {} broker
 * @param {} socket
 * @return 
 */
var Connection = function ( broker, socket )
{
  this.broker      = broker ;
  this.socket      = socket ;
  this.client_info = undefined ;
  if ( ! this.socket.sid )
  {
    this.sid        = broker.hostname + "_" + process.pid + "_" + socket.remoteAddress + "_" + socket.remotePort + "_" + new Date().getTime() ;
    this.socket.sid = this.sid ;
  }
  else
  {
    this.sid = socket.sid ;
  }
  this.channels = undefined ;
  this._lockedResourcesIdList                 = [] ;
  this._patternList                           = [] ;
  this._regexpList                            = [] ;
  this._ownedSemaphoresRecourceIdList         = [] ;
  this._pendingAcquireSemaphoreRecourceIdList = [] ;
  this._numberOfPendingRequests               = 0 ;
  this._messageUidsToBeProcessed              = [] ;
  this._isLocalHost = undefined ;
  this._timeStamp                             = 0 ;
  this.fullQualifiedEventNames                = {} ;
  this.eventNameList                          = [] ;
  this.channelNameList                        = [] ;
};
/**
 * Description
 * @method toString
 * @return Literal
 */
Connection.prototype.toString = function()
{
  return "(Connection)[client_info=" + util.inspect ( this.client_info, { showHidden: false, depth: null } ) + "]" ;
};
Connection.prototype.getClientInfo = function()
{
  return this.client_info ;
};
Connection.prototype.setTimestamp = function()
{
  this._timeStamp = new Date().getTime() ;
};
Connection.prototype.flush = function()
{
  this.broker                                        = null ;
  this.socket                                        = null ;
  this._lockedResourcesIdList.length                 = 0 ;
  this._patternList.length                           = 0 ;
  this._regexpList.length                            = 0 ;
  this._ownedSemaphoresRecourceIdList.length         = 0 ;
  this._pendingAcquireSemaphoreRecourceIdList.length = 0 ;
  this._messageUidsToBeProcessed.length              = 0 ;
};
/**
 * Description
 * @method removeEventListener
 * @param {} e
 * @return 
 */
Connection.prototype.removeEventListener = function ( e )
{
  var i, index ;
  var eventNameList = e.body.eventNameList ;
  if ( ! eventNameList || ! eventNameList.length )
  {
    eventNameList = this.eventNameList ;
  }
  if ( ! eventNameList || ! eventNameList.length )
  {
    e.control.status = { code:1, name:"error", reason:"Missing eventNameList" } ;
    Log.error ( e.toString() ) ;
    return ;
  }
  var toBeRemoved = [] ;
  for  ( i = 0 ; i < eventNameList.length ; i++ )
  {
    this.broker._eventNameToSockets.remove ( eventNameList[i], this.socket ) ;
    index  = this.eventNameList.indexOf ( eventNameList[i] ) ;
    if ( index >= 0 )
    {
      toBeRemoved.push ( eventNameList[i] ) ;
    }
    index = this._patternList.indexOf ( eventNameList[i] ) ;
    if ( index >= 0 )
    {
      this._patternList.remove ( index ) ;
      this._regexpList.remove ( index ) ;
    }
    // var pos = eventNameList[i].indexOf ( "::" ) ;
    // if ( pos > 0 )
    // {
    //   delete this.fullQualifiedEventNames[eventNameList[i]] ;
    // }
  }
  for  ( i = 0 ; i < toBeRemoved.length ; i++ )
  {
    this.eventNameList.remove ( toBeRemoved[i] ) ;
  }
  this.broker.republishService() ;
  toBeRemoved.length = 0 ;
};
/**
 * Description
 * @method write
 * @param {} data
 * @return 
 */
Connection.prototype.write = function ( data )
{
  try
  {
    if ( data instanceof Event )
    {
      var t = this.client_info ? this.client_info.application : "" ;

      var tp = TPStore.getTracePoint ( "EVENT_OUT" ) ;
      if ( tp.isActive() && tp.includeSystem ) TPStore.log ( "EVENT_OUT", data.getName() + "/" + data.getType() + "-->" + t + "(" + this.sid + ")" ) ;
      if ( data.isResult() )
      {
        TPStore.log ( "EVENT_OUT", data ) ;
      }
      this.setTimestamp() ;
      data.setTargetIsLocalHost ( this.isLocalHost() ) ;
      this.socket.write ( data.serialize() ) ;
    }
    if ( typeof data === 'string' )
    {
      this.setTimestamp() ;
      this.socket.write ( data ) ;
    }
  }
  catch ( exc )
  {
    Log.log ( exc ) ;
  }
};
/**
 * Description
 * @method _sendInfoResult
 * @param {} e
 * @return 
 */
Connection.prototype._sendInfoResult = function ( e )
{
  var i, j, first, str, key, conn, key2 ;
  e.setType ( "getInfoResult" ) ;
  e.control.status                     = { code:0, name:"ack" } ;
  e.body.gepardVersion                 = Gepard.getVersion() ;
  e.body.brokerVersion                 = this.broker.brokerVersion ;
  if ( this.broker.zeroconf )
  {
    e.body.zeroconf = this.broker.zeroconf ;
  }
  e.body.port                          = this.broker.port ;
  e.body.startupTime                   = this.broker.startupTime   ;
  e.body.heartbeatIntervalMillis       = this.broker.heartbeatMillis ;
  e.body.maxMessageSize                = this.broker._maxMessageSize ;
  e.body.log                           = { levelName: Log.getLevelName(), level:Log.getLevel(), file: Log.getCurrentLogFileName() } ;
  e.body.numberOfPendingMessages       = this.broker._numberOfPendingMessages ;
  e.body.currentEventNames             = this.broker._eventNameToSockets.getKeys() ;
  for ( i = 0 ; i < this.broker._connectionList.length ; i++ )
  {
    list = this.broker._connectionList[i]._regexpList ;
    if ( list )
    {
      if ( ! e.body.currentEventPattern ) e.body.currentEventPattern = [] ;
      for ( j = 0 ; j < list.length ; j++ )
      {
        e.body.currentEventPattern.push ( list[j].toString() ) ;
      }
    }
  }     
  var mhclone = new MultiHash() ;
  for ( key in this.broker._eventNameToSockets._hash )
  {
    var afrom = this.broker._eventNameToSockets.get ( key ) ;
    if ( typeof ( afrom ) === 'function' ) continue ;
    for ( i = 0 ; i < afrom.length ; i++ )
    {
      mhclone.put ( key, afrom[i].sid ) ;
    }
  }
  e.body.mapping = mhclone._hash ;
  e.body.connectionList = [] ;
  for ( key in this.broker._connections )
  {
    conn = this.broker._connections[key] ;
    var client_info = conn.client_info ;
    if ( ! client_info ) continue ;
    var client_info2 = {} ;
    for ( key2 in client_info )
    {
      client_info2[key2] = client_info[key2] ;
    }
    client_info2.lastActionTime = new Date ( conn._timeStamp ).toISOString() ;
    e.body.connectionList.push ( client_info2 ) ;
    if ( conn._ownedSemaphoresRecourceIdList.length )
    {
      client_info2.ownedSemaphores = conn._ownedSemaphoresRecourceIdList ;
    }
    if ( conn._pendingAcquireSemaphoreRecourceIdList.length )
    {
      client_info2.pendingSemaphores = conn._pendingAcquireSemaphoreRecourceIdList ;
    }
    client_info2.channels = conn.channels ;
  }
  for ( key in this.broker._lockOwner )
  {
    if ( ! e.body.lockList )
    {
      e.body.lockList = [] ;
    }
    e.body.lockList.push ( { resourceId: key, owner: this.broker._lockOwner[key].client_info } ) ;
  }
  for ( key in this.broker._semaphoreOwner )
  {
    if ( ! e.body.semaphoreList )
    {
      e.body.semaphoreList = [] ;
    }
    e.body.semaphoreList.push ( { resourceId: key, owner: this.broker._semaphoreOwner[key].client_info } ) ;
  }
  this.write ( e ) ;
};
/**
 * Description
 * @method addEventListener
 * @param {} e
 * @return 
 */
Connection.prototype._addEventListener = function ( e )
{
  var eventNameList = e.body.eventNameList ;
  var str, regexp, eventName ;
  if ( ! eventNameList || ! eventNameList.length )
  {
    e.control.status = { code:1, name:"error", reason:"Missing eventNameList" } ;
    Log.error ( e.toString() ) ;
    this.write ( e ) ;
    return ;
  }
  for  ( i = 0 ; i < eventNameList.length ; i++ )
  {
    eventName = eventNameList[i] ;
    regexp = null ;
    if ( eventName.charAt ( 0 ) === '/' && eventName.charAt ( eventName.length - 1 ) === '/' )
    {
      regexp = new RegExp ( eventName.substring ( 1, eventName.length - 1 ) ) ;
    }
    else
    if ( eventName.indexOf ( '.*' ) >= 0 )
    {
      regexp = new RegExp ( eventName ) ;
    }
    else
    if ( eventName.indexOf ( '*' ) >= 0 || eventName.indexOf ( '?' ) >= 0 )
    {
      regexp = new RegExp ( eventName.replace ( /\./, "\\." ).replace ( /\*/, ".*" ).replace ( '?', '.' ) ) ;
    }

    if ( ! regexp )
    {
      var pos = eventName.indexOf ( "::" ) ;
      if ( pos > 0 )
      {
        if ( ! this.channels ) this.channels = {} ;
        this.fullQualifiedEventNames[eventName] = true ;
      }
      this.eventNameList.push ( eventName ) ;
      this.broker._eventNameToSockets.put ( eventName, this.socket ) ;
    }
    else
    {
      this._patternList.push ( eventName ) ;
      this._regexpList.push ( regexp ) ;
    }
  }
  e.control.status = { code:0, name:"ack" } ;
  this.write ( e ) ;
  this.broker.republishService() ;
};
Connection.prototype._setCurrentlyProcessedMessageUid = function ( uid )
{
  this._currentlyProcessedMessageUid = uid ;
};
Connection.prototype._getCurrentlyProcessedMessageUid = function()
{
  return this._currentlyProcessedMessageUid ;
};
Connection.prototype._getNextMessageUidToBeProcessed = function()
{
  return this._messageUidsToBeProcessed.shift() ;
};
Connection.prototype.isLocalHost = function()
{
  if ( typeof this._isLocalHost === 'boolean' )
  {
    return this._isLocalHost ;
  }
  for ( i = 0 ; i < this.broker._networkAddresses.length ; i++ )
  {
    var ra = this.socket.remoteAddress ;
    if ( ! ra )
    {
      continue ;
    }
    var index = ra.indexOf ( this.broker._networkAddresses[i] ) ;
    if ( index < 0 )
    {
      continue ;
    }
    if ( this.socket.remoteAddress.indexOf ( this.broker._networkAddresses[i] ) === this.socket.remoteAddress.length - this.broker._networkAddresses[i].length )
    {
      this._isLocalHost = true ;
      return this._isLocalHost ;
    }
  }
  this._isLocalHost = false ;
  return this._isLocalHost ;
};
Connection.prototype.getRemoteAddress = function()
{
  return this.socket ? this.socket.remoteAddress : "" ;
};
Connection.prototype.getHostName = function() { if ( ! this.client_info ) return "" ; return this.client_info.hostname ; } ;
Connection.prototype.getLanguage = function() { if ( ! this.client_info ) return "" ; return this.client_info.language ; } ;
Connection.prototype.getApplicationName = function() { if ( ! this.client_info ) return "" ; return this.client_info.applicationName ; } ;
Connection.prototype.getApplication = function() { if ( ! this.client_info ) return "" ; return this.client_info.application ; } ;
Connection.prototype.getId = function() { if ( ! this.client_info ) return "" ; return this.client_info.sid ; } ;
Connection.prototype.getUSERNAME = function() { if ( ! this.client_info.USERNAME ) return "" ; return this.client_info.USERNAME ; } ;

var TPStore = TracePoints.getStore ( "broker" ) ;

TPStore.add ( "EVENT_IN" ).setTitle ( "--------------------------- EVENT_IN ---------------------------" ) ;
TPStore.add ( "EVENT_OUT" ).setTitle ( "--------------------------- EVENT_OUT ---------------------------" ) ;

/**
 * @constructor
 * @extends {EventEmitter}
 * @method Broker
 * @param {} port
 * @param {} ip
 * @return 
 */
var Broker = function ( port, ip )
{
  EventEmitter.call ( this ) ;
  this._configIsSet = false ;
  this._connections                        = {} ;
  this._eventNameToSockets                 = new MultiHash() ;
  this._channelNameToSockets               = new MultiHash() ;
  this._connectionList                     = [] ;
  this.port                                = port ;
  this.ip                                  = ip ;
  this.closing                             = false ;
  var thiz                                 = this ;
  var conn ;
  var allowed ;
  this._lockOwner                          = {} ;
  this._semaphoreOwner                     = {} ;
  this._pendingAcquireSemaphoreConnections = new MultiHash() ;
  
  this.hostname                            = os.hostname() ;
  this._networkAddresses                   = [] ;
  var networkInterfaces                    = os.networkInterfaces() ;
  this._messagesToBeProcessed              = {} ;
  this.server                              = net.createServer() ;
  for ( var kk in networkInterfaces )
  {
    var ll = networkInterfaces[kk] ;
    for ( var ii = 0 ; ii < ll.length ; ii++ )
    {
      var oo = ll[ii] ;
      this._networkAddresses.push ( oo["address"] ) ;
    }
  }
  this.server.on ( "error", function onerror ( p )
  {
    Log.error ( p ) ;
    thiz.emit ( "error" ) ;
  });
  this.server.on ( "close", function onclose ( p )
  {
    Log.info ( p ) ;
    thiz.emit ( "close" ) ;
  });
  this.server.on ( "connection", function server_on_connection ( socket )
  {
    var i = 0 ;
    if ( thiz.closing )
    {
      socket.end() ;
      return ;
    }
    conn = new Connection ( thiz, socket ) ;
    thiz.validateAction ( thiz._connectionHook.connect, [ conn ], thiz, thiz._checkInConnection, [ conn ] ) ;
  });
  var ee = new Event() ;
  ee.addClassNameToConstructor ( "FileContainer", FileContainer ) ;
  this.heartbeatMillis = 30000 ;
  this.heartbeatMillis = T.getInt ( "gepard.heartbeat.millis", this.heartbeatMillis ) ;
  
  this.brokerVersion            = 1 ;
  this._maxMessageSize          = 20 * 1024 * 1024 ;
  this.startupTime              = new Date() ;
  this._taskHandler             = new BTaskHandler ( this ) ;
  this._numberOfPendingMessages = 0 ;
  this._republishServiceTimeoutMillis = 5000 ;
};

util.inherits ( Broker, EventEmitter ) ;

Broker.prototype.validateAction = function ( hookFunctionToBeCalled, parray, this_of_actionFunction, actionFunction, parray_for_actionFunction )
{
  var conn = parray[0] ;
  var answer ;
  try
  {
    answer = hookFunctionToBeCalled.apply ( this._connectionHook, parray ) ;
  }
  catch ( exc )
  {
    Log.log ( exc ) ;
  }
  if ( ! answer )
  {
    conn.socket.end() ;
    conn.flush() ;
    return ;
  }
  ///////////////////////
  // this is a Promise //
  ///////////////////////
  var thiz = this ;
  if ( typeof answer === 'object' && typeof answer.then === 'function' )
  {
    answer.then ( function success()
    {
      actionFunction.apply ( this_of_actionFunction, parray_for_actionFunction ) ;
    }
    , function fail ( err )
    {
      Log.error ( "" + err ) ;
      conn.socket.end() ;
      conn.flush() ;
    }).catch ( function fcatch ( err )
    {
      Log.error ( err ) ;
      conn.socket.end() ;
      conn.flush() ;
    });
  }
  else
  {
    actionFunction.apply ( this_of_actionFunction, parray_for_actionFunction ) ;
  }
};
Broker.prototype._checkInConnection = function ( conn )
{
  this._connections[conn.sid] = conn ;
  this._connectionList.push ( conn ) ;
  Log.info ( 'Socket connected, sid=' + conn.sid ) ;
  conn.socket.on ( "error", this._ejectSocket.bind ( this, conn.socket ) ) ;
  conn.socket.on ( 'close', this._ejectSocket.bind ( this, conn.socket ) ) ;
  conn.socket.on ( 'end', this._ejectSocket.bind ( this, conn.socket ) ) ;
  conn.socket.on ( "data", this._ondata.bind ( this, conn.socket ) ) ;
};
Broker.prototype._ondata = function ( socket, chunk )
{
  if ( this.closing )
  {
    return ;
  }
  var mm = chunk.toString() ;
  var conn = this._connections[socket.sid] ;
  if ( ! conn )
  {
    return ;
  }
  conn.setTimestamp() ;
  var i, j, found ;
  var eventNameList ;
  var eOut ;
  var str ;
  var key ;
  var sid ;
  var index ;
  var regexp ;
  var name ;
  var list ;
  var originatorConnection ;
  var responderConnection ;
  var uid, history, jsacc, eventName ;
  if ( ! conn.partialMessage ) conn.partialMessage = "" ;
  mm = conn.partialMessage + mm ;
  conn.partialMessage = "" ;
  var result = T.splitJSONObjects ( mm, this._maxMessageSize ) ;
  if ( result.invalid )
  {
    if ( result.size )
    {
      str = "Message size exceeds maximum.\nsid=" + conn.sid + "\nmax=" + this._maxMessageSize + "\nactual size=" + result.actual ;
      Log.log ( str ) ;
      e = new Event ( "ERROR" ) ;
      e.setStatus ( 1, "error", str ) ;
      conn.write ( e ) ;
      socket.end() ;
      return ;
    }
  }
  if ( result )
  {
  }
  var messageList = result.list ;
  var e = null ;
  if ( result.lastLineIsPartial )
  {
    conn.partialMessage = messageList[messageList.length-1] ;
    messageList[messageList.length-1] = "" ;
    if ( conn.partialMessage > this._maxMessageSize )
    {
      str = "Message size exceeds maximum.\nsid=" + conn.sid + "\nmax=" + this._maxMessageSize + "\nactual size=" + conn.partialMessage.length ;
      Log.log ( str ) ;
      e = new Event ( "ERROR" ) ;
      e.setStatus ( 1, "error", str ) ;
      conn.write ( e ) ;
      socket.end() ;
      return ;
    }
  }

  for ( j = 0 ; j < messageList.length ; j++ )
  {
    var m = messageList[j] ;
    if ( !m || m.length === 0 )
    {
      continue ;
    }
    if ( m.length > this._maxMessageSize )
    {
      str = "Message size exceeds maximum.\nsid=" + conn.sid + "\nmax=" + this._maxMessageSize + "\nactual size=" + m.length ;
      Log.log ( str ) ;
      e = new Event ( "ERROR" ) ;
      e.setStatus ( 1, "error", str ) ;
      conn.write ( e ) ;
      socket.end() ;
      return ;
    }
    if ( m.charAt ( 0 ) === '{' )
    {
      try
      {
        e = Event.prototype.deserialize ( m ) ;
      }
      catch ( exc )
      {
        Log.log ( exc ) ;
        Log.log ( m ) ;
        socket.end() ;
        return ;
      }
      TPStore.log ( "EVENT_IN", e ) ;

      try
      {
        if ( ! e.body )
        {
          this._ejectSocket ( socket ) ;
          continue ;
        }
        if ( e.isResult() )
        {
          responderConnection  = conn ;
          responderConnection._numberOfPendingRequests-- ;
          sid                  = e.getSourceIdentifier() ;
          uid                  = e.getUniqueId() ;
          originatorConnection = this._connections[sid] ;
          delete this._messagesToBeProcessed[uid] ;
          this._numberOfPendingMessages-- ;
          if ( this._numberOfPendingMessages < 0 ) this._numberOfPendingMessages = 0 ;
          responderConnection._setCurrentlyProcessedMessageUid ( "" ) ;
          var alreadySent = false ;
          if ( e.getName() !== "system" )
          {
            try
            {
              if ( e.control.task )
              {
                this._taskHandler.stepReturned ( e, responderConnection, originatorConnection ) ;
                if ( e.control.task.nextStep )
                {
                  alreadySent = true ;
                  this._sendEventToClients ( originatorConnection, e ) ;
                }
              }
            }
            catch ( exc )
            {
              Log.log ( exc ) ;
              e.setStatus ( 1, "error", "internal, see log-file" ) ;
              e.setIsResult() ;
            }
          }
          if ( ! alreadySent )
          {
            if ( e.isResult() && originatorConnection )
            {
              if ( e.getName() === "system" && e.getType().startsWith ( "client/" ) )
              {
                if ( ! e.body.info ) e.body.info = {} ;
                try
                {
                  e.body.info.sid = responderConnection.sid ;
                  e.body.info.applicationName = responderConnection.client_info.applicationName ;
                }
                catch ( exc )
                {
                  Log.log ( exc ) ;
                  socket.end() ;
                }
              }
              try
              {
                originatorConnection.write ( e ) ;
              }
              catch ( exc )
              {
                originatorConnection.end() ;
                Log.log ( exc ) ;
              }
              if ( e.control.task )
              {
                this._taskHandler.epilog ( e, conn ) ;
              }
            }
            else
            {
              Log.log ( "Requester not found for result:\n" ) ;
              Log.log ( e ) ;
            }
          }
          uid = responderConnection._getNextMessageUidToBeProcessed() ;
          if ( uid )
          {
            for ( i = 0 ; i < this._connectionList.length  ; i++ )
            {
              this._connectionList[i]._messageUidsToBeProcessed.remove ( uid ) ;
            }
            e  = this._messagesToBeProcessed[uid] ;
            responderConnection.write ( e ) ;
            responderConnection._numberOfPendingRequests++ ;
            responderConnection._setCurrentlyProcessedMessageUid ( uid ) ;
          }
          continue ;
        }
        if ( e.getName() === 'system' )
        {
          if ( e.getType().indexOf ( "client/" ) === 0 )
          {
            this.validateAction ( this._connectionHook.clientAction, [ conn, e ], this, this._handleSystemClientMessages, [ conn, e ] ) ;
            continue ;
          }
          this._handleSystemMessages ( conn, e ) ;
          continue ;
        }
        try
        {
          this._taskHandler.prolog ( e, conn ) ;
          this.validateAction ( this._connectionHook.sendEvent, [ conn, e ], this, this._sendEventToClients, [ conn, e ] ) ;
        }
        catch ( exc )
        {
          if ( e.isResultRequested() )
          {
            e.setStatus ( 1, "error", "internal, see log-file" ) ;
            e.setIsResult() ;
            conn.write ( e ) ;
          }
          Log.log ( exc ) ;
        }
      }
      catch ( exc )
      {
        Log.log ( exc ) ;
        socket.end() ;
      }
    }
  }
};

/**
 * Description
 * @method toString
 * @return Literal
 */
Broker.prototype.toString = function()
{
  return "(Broker)[]" ;
};
Broker.prototype._setSystemParameter = function ( conn, e )
{
  var sp = e.body.systemParameter ;
  if ( sp._heartbeatIntervalMillis >= 3000 )
  {
  if ( this.heartbeatMillis !== sp._heartbeatIntervalMillis )
    {
      this.heartbeatMillis = sp._heartbeatIntervalMillis ;
      if ( this.intervallId )
      {
        clearInterval ( this.intervallId ) ;
      }
      this.intervallId = setInterval ( this._checkHeartbeat_bind, this.heartbeatMillis ) ;
      this._send_PING_to_all() ;
    }
  }
  e.removeValue ( "systemParameter" ) ;
  conn._sendInfoResult ( e ) ;
};
Broker.prototype._tracePoint = function ( conn, e )
{
  var tracePointResult = TPStore.action ( e.body.tracePointActionList ) ;
  e.control.status = { code:0, name:"ack" } ;
  if ( tracePointResult )
  {
    e.body.tracePointStatus = tracePointResult ;
  }
  e.removeValue ( "tracePointActionList" ) ;
  conn.write ( e ) ;
};
Broker.prototype.logMessageTemplate = "[%date-rfc3339% %HOSTNAME% %app-name% %sid%] %msg%" ;
Broker.prototype._logMessage = function ( conn, e )
{
  var map = { "HOSTNAME": conn.getHostName()
            , "app-name": conn.getApplicationName()
            , "sid": conn.sid
            } ;
  var message = e.getValue ( "message" ) ;
  if ( message )
  {
    map.msg = message.text ;
    if ( message.date )
    {
      var date = new Date ( e.body.message.date ) ;
      map["date-rfc3339"] = date.toRFC3339String() ;
    }
  }
  var line = T.resolve ( this.logMessageTemplate, map ) ;
  Log.info ( line ) ;
};
/**
 * Description
 * @method _sendMessageToClient
 * @param {} socket
 * @param {} e
 * @return 
 */
Broker.prototype._sendMessageToClient = function ( e, socketList )
{
  var socket, found = false, i ;
  var uid           = e.getUniqueId() ;
  var channel       = e.getChannel() ;
  var fullName      = channel + "::" + e.getName() ;
  for ( i = 0 ; i < socketList.length ; i++ )
  {
    socket = socketList[i] ;
    conn   = this._connections[socket.sid] ;
    if (  ( ! channel && conn.channels )
       || ( channel && ( ! conn.channels || ! conn.channels[channel] ) )
       )
    {
      if ( ! channel ) continue ;
      if ( ! conn.fullQualifiedEventNames[fullName] ) continue ;
    }
    this._messagesToBeProcessed[uid] = e ; // hotfix-1.5.0_1
    this._numberOfPendingMessages++ ;
    if ( conn._numberOfPendingRequests === 0 )
    {
      conn.write ( e ) ;
      conn._numberOfPendingRequests++ ;
      conn._setCurrentlyProcessedMessageUid ( uid ) ;
      return true ;
    }
  }
  for ( i = 0 ; i < socketList.length ; i++ )
  {
    socket = socketList[i] ;
    conn   = this._connections[socket.sid] ;
    if (  ( ! channel && conn.channels )
       || ( channel && ( ! conn.channels || ! conn.channels[channel] ) )
       )
    {
      continue ;
    }
    found = true ;
    conn._messageUidsToBeProcessed.push ( uid ) ;
  }
  return found ;
};
/**
 * Description
 * @method _sendEventToClients
 * @param {} socket
 * @param {} e
 * @return 
 */
Broker.prototype._sendEventToClients = function ( conn, e )
{
  var i, j, found = false, done = false, str, list, target_conn ;
  var name = e.getName() ;
  if ( conn )
  {
    e.setSourceIdentifier ( conn.sid ) ;
  }
  var isStatusInfoRequested        = e.isStatusInfoRequested() ;
  e.control._isStatusInfoRequested = undefined ;
  var socketList                   = this._eventNameToSockets.get ( name ) ;
  if ( e.getChannel() )
  {
    var socketList2 = this._eventNameToSockets.get ( e.getChannel() + "::" + name ) ;
    if ( socketList2 )
    {
      if ( socketList )
      {
        socketList = socketList2.concat ( socketList ) ;
      }
      else
      {
        socketList = socketList2.concat ( [] ) ;
      }
    }
  }
  var channel  = e.getChannel() ;
  var fullName = channel + "::" + e.getName() ;
  var s ;
  if ( socketList )
  {
    found = true ;
    if ( e.isResultRequested() && ! e.isBroadcast() )
    {
      found = this._sendMessageToClient ( e, socketList ) ;
    }
    else
    {
      var number = 1 ;
      if ( e.isBroadcast() )
      {
        e.control.clone = {} ;
      }
      for ( i = 0 ; i < socketList.length ; i++ )
      {
        target_conn = this._connections[socketList[i].sid] ;
        if (  ( ! channel && target_conn.channels )
           || ( channel && ( ! target_conn.channels || ! target_conn.channels[channel] ) )
           )
        {
          if ( ! channel ) continue ;
          if ( ! conn.fullQualifiedEventNames[fullName] ) continue ;
        }

        if ( e.control.clone )
        {
          e.control.clone.number = number++ ;
          e.control.clone.of = socketList.length ;
        }
        found = true ;
        target_conn.write ( e ) ;
      }
    }
    if ( found && conn && isStatusInfoRequested )
    {
      e.control._isStatusInfoRequested = isStatusInfoRequested ;
      e.setIsStatusInfo() ;
      e.control.status = { code:0, name:"success", reason:"Listener found for event: " + e.getName() } ;
      e.control.requestedName = e.getName() ;
      conn.write ( e ) ;
    }
    if ( found && e.isResultRequested() && ! e.isBroadcast() )
    {
      return ;
    }
  }
  for ( i = 0 ; i < this._connectionList.length ; i++ )
  {
    list = this._connectionList[i]._regexpList ;
    if ( ! list ) continue ;
    for ( j = 0 ; j < list.length ; j++ )
    {
      if ( ! list[j].test ( name ) ) continue ;
      target_conn = this._connectionList[i] ;
      if (  ( ! channel && target_conn.channels )
         || ( channel && ( ! target_conn.channels || ! target_conn.channels[channel] ) )
         )
      {
        if ( ! channel ) continue ;
        if ( ! conn.fullQualifiedEventNames[fullName] ) continue ;
      }
      found = true ;
      this._connectionList[i].write ( e ) ;
      if ( e.isResultRequested() && ! e.isBroadcast() )
      {
        break ;
      }
    }
    if ( found && e.isResultRequested() && ! e.isBroadcast() )
    {
      break ;
    }
  }
  if ( conn && found && isStatusInfoRequested )
  {
    e.setIsStatusInfo() ;
    e.control.status = { code:0, name:"success", reason:"Listener found for event: " + e.getName() } ;
    e.control.requestedName = e.getName() ;
    conn.write ( e ) ;
    return ;
  }
  if ( ! found )
  {
    var reasonText = "No listener found for event: " + e.getName() ;
    if ( e.getChannel() )
    {
      reasonText += " (" + e.getChannel() + ")" ;
    }
    if ( conn && e.isResultRequested() || e.isFailureInfoRequested() || isStatusInfoRequested )
    {
      if ( isStatusInfoRequested )
      {
        e.setIsStatusInfo() ;
      }
      else
      {
        e.setIsResult() ;
      }
      e.control.status = { code:1, name:"warning", reason:reasonText } ;
      e.control.requestedName = e.getName() ;
      conn.write ( e ) ;
      if ( e.control.task )
      {
        try
        {
          this._taskHandler.epilog ( e, conn ) ;
        }
        catch ( exc )
        {
          Log.log ( exc ) ;
        }
      }
      return ;
    }
    Log.info ( reasonText ) ;
  }
};
Broker.prototype._handleSystemClientMessages = function ( conn, e )
{
  var i = 0 ;
  var number = 1 ;
  e.control.clone = {} ;
  e.setSourceIdentifier ( conn.sid ) ;
  var sid = e.getValue ( "sid" ) ;

  var of = this._connectionList.length - 1 ;
  if ( conn.sid === sid )
  {
    e.setStatus ( 1, "error", "not self" ) ;
    e.setIsResult() ;
    conn.write ( e ) ;
    return ;
  }
  var numberOfEventsSent = 0 ;
  var targetConn ;
  if ( sid )
  {
    for ( i = 0 ; i < this._connectionList.length ; i++ )
    {
      targetConn = this._connectionList[i] ;
      if ( conn.sid === targetConn.sid )
      {
        continue ;
      }
      if ( sid !== targetConn.sid )
      {
        continue ;
      }
      targetConn._numberOfPendingRequests++ ;
      e.control.clone.number = number++ ;
      e.control.clone.of = 1 ;
      targetConn.write ( e ) ;
      numberOfEventsSent++ ;
    }
  }
  else
  {
    for ( i = 0 ; i < this._connectionList.length ; i++ )
    {
      targetConn = this._connectionList[i] ;
      if ( conn.sid === targetConn.sid )
      {
        continue ;
      }
      targetConn._numberOfPendingRequests++ ;
      e.control.clone.number = number++ ;
      e.control.clone.of = this._connectionList.length - 1 ;
      targetConn.write ( e ) ;
      numberOfEventsSent++ ;
    }
  }
  if ( ! numberOfEventsSent )
  {
    e.setStatus ( 1, "warning", "no clients found for sid=" + ( sid ? sid : "*" ) ) ;
    e.setIsResult() ;
    conn.write ( e ) ;
  }
};
/**
 * Description
 * @method _handleSystemMessages
 * @param {} socket
 * @param {} e
 * @return 
 */
Broker.prototype._handleSystemMessages = function ( conn, e )
{
  var i, found, list, CHANNEL, t, key ;
  if ( e.getType() === "addMultiplexer" )
  {
    return ;
  }
  if ( e.getType() === "log" )
  {
    this.validateAction ( this._connectionHook.system, [ conn, e ], this, this._logMessage, [ conn, e ] ) ;
    return ;
  }

  if ( e.getType() === "PONG" )
  {
    Log.info ( "Heartbeat PONG received from: " + conn.sid ) ;
    return ;
  }
  if ( e.getType() === "shutdown" )
  {
    this.validateAction ( this._connectionHook.shutdown, [ conn, e ], this, this._shutdown, [ conn, e ] ) ;
    return ;
  }
  if ( e.getType() === "setSystemParameter" )
  {
    this.validateAction ( this._connectionHook.system, [ conn, e ], this, this._setSystemParameter, [ conn, e ] ) ;
    return ;
  }
  if ( e.getType() === "tracePoint" )
  {
    this.validateAction ( this._connectionHook.system, [ conn, e ], this, this._tracePoint, [ conn, e ] ) ;
    return ;
  }
  if ( e.getType() === "client_info" )
  {
    conn.client_info = e.body ; e.body = {} ;
    if ( ! conn.client_info.version )
    {
      conn.client_info.version = 0 ;
    }
    conn.version         = conn.client_info.version ;
    conn.client_info.sid = conn.sid ;
    CHANNEL = conn.client_info.channels ;
    if ( typeof CHANNEL === 'string' )
    {
      conn.channels = {} ;
      if ( CHANNEL.indexOf ( ',' ) >= 0 )
      {
        list = CHANNEL.split ( ',' ) ;
      }
      else
      {
        list = [ CHANNEL ] ;
      }
      for ( i = 0 ; i < list.length ; i++ )
      {
        t = list[i].trim() ;
        if ( ! t ) continue ;
        if ( ! conn.channels ) conn.channels = {} ;
        conn.channels[t] = true ;
        conn.channelNameList.push ( t ) ;
        this._channelNameToSockets ( t, this ) ;
      } 
    }
    else
    if ( typeof CHANNEL === 'object' )
    {
      conn.channels = CHANNEL ;
      for ( key in conn.channels )
      {
        conn.channelNameList.push ( key ) ;
        this._channelNameToSockets.put ( key, conn.socket ) ;
      }
    }
    var app              = conn.client_info.application ;
    if ( app )
    {
      app = app.replace ( /\\/g, "/" ) ;
      if ( app.indexOf ( '/' ) < 0 )
      {
        if ( app.lastIndexOf ( ".js" ) == app.length - 3 )
        {
          app = app.substring ( 0, app.length - 3 ) ;
        }
        if ( app.lastIndexOf ( ".py" ) == app.length - 3 )
        {
          app = app.substring ( 0, app.length - 3 ) ;
        }
        conn.client_info.applicationName = app ;

      }
      else
      {
        if ( app.lastIndexOf ( ".js" ) == app.length - 3 )
        {
          app = app.substring ( 0, app.length - 3 ) ;
        }
        if ( app.lastIndexOf ( ".py" ) == app.length - 3 )
        {
          app = app.substring ( 0, app.length - 3 ) ;
        }
        conn.client_info.applicationName = app.substring ( app.lastIndexOf ( '/' ) + 1 ) ;
      }
    }
    if ( conn.version > 0 )
    {
      var thiz = this ;
      setTimeout ( function()
      {
        var broker_info                           = new Event ( "system", "broker_info" ) ;
        broker_info.body.brokerVersion            = thiz.brokerVersion ;
        broker_info.body._heartbeatIntervalMillis = thiz.heartbeatMillis ;
        conn.write ( broker_info ) ;
      },500) ;
    }
    return ;
  }
  if ( e.getType() === "getInfoRequest" )
  {
    this.validateAction ( this._connectionHook.getInfoRequest, [ conn, e ], conn, conn._sendInfoResult, [ e ] ) ;
    return ;
  }
  if ( e.getType() === "addEventListener" )
  {
    this.validateAction ( this._connectionHook.addEventListener, [ conn, e.body.eventNameList ], conn, conn._addEventListener, [ e ] ) ;
    return ;
  }
  if ( e.getType() === "removeEventListener" )
  {
    conn.removeEventListener ( e ) ;
    return ;
  }
  if ( e.getType() === "lockResourceRequest" )
  {
    this.validateAction ( this._connectionHook.lockResource, [ conn, e.body.resourceId ], this, this._lockResource, [ conn, e ] ) ;
    return ;
  }
  if ( e.getType() === "unlockResourceRequest" )
  {
    var resourceId = e.body.resourceId ;
    if ( ! resourceId )
    {
      this._ejectSocket ( socket ) ;
      return ;
    }
    e.setType ( "unlockResourceResult" ) ;
    e.body.isLockOwner = false ;
    if ( ! this._lockOwner[resourceId] )
    {
      e.control.status = { code:1, name:"error", reason:"not owner of resourceId=" + resourceId } ;
    }
    else
    {
      e.control.status = { code:0, name:"ack" } ;
    }
    delete this._lockOwner[resourceId] ;
    conn._lockedResourcesIdList.remove ( resourceId ) ;
    conn.write ( e ) ;
    return ;
  }
  if ( e.getType() === "acquireSemaphoreRequest" )
  {
    this.validateAction ( this._connectionHook.acquireSemaphore, [ conn, e.body.resourceId ], this, this._acquireSemaphoreRequest, [ conn, e ] ) ;
    return ;
  }
  if ( e.getType() === "releaseSemaphoreRequest" )
  {
    this._releaseSemaphoreRequest ( conn.socket, e ) ;
    return ;
  }
  Log.error ( "Invalid type: '" + e.getType() + "' for " + e.getName() ) ;
  Log.error ( e.toString() ) ;
};
Broker.prototype._lockResource = function ( conn, e )
{
    var resourceId = e.body.resourceId ;
    if ( ! resourceId )
    {
      this._ejectSocket ( conn.socket ) ;
      return ;
    }
    e.setType ( "lockResourceResult" ) ;
    if ( this._lockOwner[resourceId] )
    {
      e.body.isLockOwner = false ;
    }
    else
    {
      this._lockOwner[resourceId] = conn ;
      conn._lockedResourcesIdList.push ( resourceId ) ;
      e.body.isLockOwner = true ;
    }
    conn.write ( e ) ;
};
Broker.prototype._shutdown = function ( conn, e )
{
  var shutdown_sid = e.body.shutdown_sid ;
  if ( shutdown_sid )
  {
    var target_conn = this._connections[shutdown_sid] ;
    found = false ;
    if ( target_conn )
    {
      found = true ;
      target_conn.write ( new Event ( "system", "shutdown" ) ) ;
      target_conn.socket.end() ;
    }
    else
    {
      for ( i = 0 ; i < this._connectionList.length ; i++ )
      {
        if ( ! this._connectionList[i].client_info ) continue ;
        if ( this._connectionList[i].client_info.applicationName === shutdown_sid )
        {
          found = true ;
          this._connectionList[i].write ( new Event ( "system", "shutdown" ) ) ;
          this._connectionList[i].socket.end() ;
        }
      }
    }
    if ( ! found )
    {
      e.control.status = { code:1, name:"error", reason:"no connection for sid=" + shutdown_sid } ;
      conn.write ( e ) ;
      return ;
    }
    e.control.status = { code:0, name:"ack" } ;
    conn.write ( e ) ;
    return ;
  }
  else
  {
    try
    {
      if ( this.intervallId )
      {
        clearInterval ( this.intervallId ) ;
      }
      if ( this.bonjour )
      {
        this.bonjour.unpublishAll() ;
      }
      Log.info ( 'server shutting down' ) ;
      e.control.status = { code:0, name:"ack" } ;
      conn.write ( e ) ;
      // this.unpublishService() ;
      if ( this.bonjour )
      {
        this.bonjour.destroy() ;
        this.bonjour = null ;
      }
      this._closeAllSockets() ;
      this.server.unref() ;
      Log.info ( 'server shut down' ) ;
      this.emit ( "shutdown" ) ;
    }
    catch ( exc )
    {
      T.log ( exc ) ;
    }
  }
};
Broker.prototype._acquireSemaphoreRequest = function ( conn, e )
{
  var resourceId = e.body.resourceId ;
  if ( ! resourceId )
  {
    this._ejectSocket ( conn.socket ) ;
    return ;
  }
  var currentSemaphoreOwner = this._semaphoreOwner[resourceId] ;
  if ( currentSemaphoreOwner )
  {
    if ( currentSemaphoreOwner === conn )
    {
      Log.error ( conn.toString() + "\n is already owner of semaphore=" + resourceId ) ;
      e.control.status = { code:1, name:"error", reason:"already owner of semaphore=" + resourceId } ;
      conn.write ( e ) ;
      return ;
    }
    e.body.isSemaphoreOwner = false ;
    this._pendingAcquireSemaphoreConnections.put ( resourceId, conn ) ;
    conn._pendingAcquireSemaphoreRecourceIdList.push ( resourceId ) ;
    return ;
  }
  this._setIsSemaphoreOwner ( conn, resourceId ) ;
};
Broker.prototype._setIsSemaphoreOwner = function ( conn, resourceId )
{
  this._semaphoreOwner[resourceId] = conn ;
  conn._ownedSemaphoresRecourceIdList.push ( resourceId ) ;
  conn._pendingAcquireSemaphoreRecourceIdList.remove ( resourceId ) ;
  this._pendingAcquireSemaphoreConnections.remove ( resourceId, conn ) ;
  var e                   = new Event ( "system", "acquireSemaphoreResult" ) ;
  e.body.resourceId       = resourceId ;
  e.body.isSemaphoreOwner = true ;
  conn.write ( e ) ;
};
Broker.prototype._releaseSemaphoreRequest = function ( socket, e )
{
  var conn = this._connections[socket.sid] ;
  var resourceId = e.body.resourceId ;
  if ( ! resourceId )
  {
    this._ejectSocket ( socket ) ;
    return ;
  }
  var currentSemaphoreOwner = this._semaphoreOwner[resourceId] ;
  if ( currentSemaphoreOwner )
  {
    if ( currentSemaphoreOwner !== conn )
    {
      conn._pendingAcquireSemaphoreRecourceIdList.remove ( resourceId ) ;
      this._pendingAcquireSemaphoreConnections.remove ( resourceId, conn ) ;
      return ;
    }
  }
  Log.info ( conn.toString() + "\n released semaphore=" + resourceId ) ;
  delete this._semaphoreOwner[resourceId] ;
  conn._ownedSemaphoresRecourceIdList.remove ( resourceId ) ;
  var nextSemaphoreOwner = this._pendingAcquireSemaphoreConnections.removeFirst ( resourceId ) ;
  if ( ! nextSemaphoreOwner )
  {
    return ;
  }
  this._setIsSemaphoreOwner ( nextSemaphoreOwner, resourceId ) ;
};
/**
 * Description
 * @method _ejectSocket
 * @param {} socket
 * @return 
 */
Broker.prototype._ejectSocket = function ( socket )
{
  var i, rid ;
  var sid = socket.sid ;
  if ( ! sid ) return ;
  var conn = this._connections[sid] ;
  if ( ! conn ) return ;

  var uid  = conn._getCurrentlyProcessedMessageUid() ;
  if ( uid )
  {
    conn._setCurrentlyProcessedMessageUid ( "" ) ;
    var requesterMessage    = this._messagesToBeProcessed[uid] ;
    delete this._messagesToBeProcessed[uid] ;
    this._numberOfPendingMessages-- ;
    if ( this._numberOfPendingMessages < 0 ) this._numberOfPendingMessages = 0 ;
    var requester_sid ;
    var originatorConnection ;
    if ( requesterMessage )
    {
      requester_sid        = requesterMessage.getSourceIdentifier() ;
      originatorConnection = this._connections[requester_sid] ;
    }

    for ( i = 0 ; i < this._connectionList.length  ; i++ )
    {
      this._connectionList[i]._messageUidsToBeProcessed.remove ( uid ) ;
    }
    if ( originatorConnection )
    {
      requesterMessage.setIsResult() ;
      requesterMessage.control.status = { code:1, name:"warning", reason:"responder died unexpectedly." } ;
      try
      {
        originatorConnection.write ( requesterMessage ) ;
      }
      catch ( exc )
      {
        Log.log ( exc ) ;
      }
      if ( requesterMessage.control.task )
      {
        try
        {
          this._taskHandler.epilog ( requesterMessage, originatorConnection ) ;
        }
        catch ( exc )
        {
          Log.log ( exc ) ;
        }
      }
    }
    else
    if ( requesterMessage )
    {
      Log.log ( "Requester not found for result:\n" + requesterMessage.toString() ) ;
    }
  }

  if ( conn.eventNameList )
  {
    for  ( i = 0 ; i < conn.eventNameList.length ; i++ )
    {
      this._eventNameToSockets.remove ( conn.eventNameList[i], socket ) ;
    }
    conn.eventNameList.length = 0 ;
    for  ( i = 0 ; i < conn.channelNameList.length ; i++ )
    {
      this._channelNameToSockets.remove ( conn.channelNameList[i], socket ) ;
    }
    conn.channelNameList.length = 0 ;
  }
  this._connectionList.remove ( conn ) ;
  for ( i = 0 ; i < conn._lockedResourcesIdList.length ; i++ )
  {
    delete this._lockOwner [ conn._lockedResourcesIdList ] ;
  }
  conn._lockedResourcesIdList.length = 0 ;
  for ( i = 0 ; i < conn._ownedSemaphoresRecourceIdList.length ; i++ )
  {
    rid = conn._ownedSemaphoresRecourceIdList[i] ;
    delete this._semaphoreOwner[rid] ;
    var nextSemaphoreOwner = this._pendingAcquireSemaphoreConnections.removeFirst ( rid ) ;
    if ( ! nextSemaphoreOwner )
    {
      continue ;
    }
    this._setIsSemaphoreOwner ( nextSemaphoreOwner, rid ) ;
  }
  conn._pendingAcquireSemaphoreRecourceIdList.length = 0 ;
  conn._ownedSemaphoresRecourceIdList.length = 0 ;
  delete this._connections[sid] ;
  Log.info ( 'Socket disconnected, sid=' + sid ) ;
  this.republishService() ;
};
/**
 * Description
 * @method _closeAllSockets
 * @param {} exceptSocket
 * @return 
 */
Broker.prototype._closeAllSockets = function ( exceptSocket )
{
  if ( this.closing )
  {
    return ;
  }
  this.closing = true ;
  var list = Object.keys ( this._connections ) ;
  var e = new Event ( "system", "shutdown" ) ;
  for ( var i = 0 ; i < list.length ; i++ )
  {
    var conn = this._connections[list[i]] ;
    if ( conn.socket === exceptSocket )
    {
      continue ;
    }
    conn.write ( e ) ;
    conn.socket.end() ;
    conn.socket.unref() ;
  }
};

/**
 * Description
 * @method listen
 * @param {} port
 * @param {} callback
 * @return 
 */
Broker.prototype.listen = function ( port, callback )
{
  if ( !this._configIsSet )
  {
    this.setConfig() ;
  }

  if ( port ) this.port = port ;
  if ( ! this.port )
  {
    this.port = T.getProperty ( "gepard.port", 17501 ) ;
  }
  this._checkHeartbeat_bind = this._checkHeartbeat.bind ( this ) ;

  var thiz = this ;
  var callback2 = function()
  {
    Log.info ( 'server bound to port=' + thiz.server.address().port ) ;
    thiz.intervallId = setInterval ( thiz._checkHeartbeat_bind, thiz.heartbeatMillis ) ;
    if ( thiz.zeroconf )
    {
      thiz.zeroconf.port = thiz.server.address().port ;
      thiz.publishService() ;
    }
    if ( typeof callback === 'function' )
    {
      try
      {
        callback() ;
      }
      catch ( exc )
      {
        Log.log ( exc ) ;
      }
    }
  };
  if ( this.zeroconf )
  {
    if ( this.zeroconf.port )
    {
      this.port = parseInt ( this.zeroconf.port ) ;
    }
  }
  if ( this.port <= 0 ) this.port = 0 ;
  this.server.listen ( this.port, callback2 ) ;
  this.port = this.server.address().port ;
};
Broker.prototype._send_PING_to_all = function()
{
  var e = new Event ( "system", "PING" ) ;
  e.control._heartbeatIntervalMillis = this.heartbeatMillis ;
  var se = e.serialize() ;
  for ( i = 0 ; i < this._connectionList.length ; i++ )
  {
    conn = this._connectionList[i] ;
    if ( conn.version <= 0 )
    {
      continue ;
    }
    try
    {
      conn.socket.write ( se ) ;
    }
    catch ( exc )
    {
      Log.log ( exc ) ;
    }
  }
};
Broker.prototype._checkHeartbeat = function()
{
  // if ( ! TPStore.points["HEARTBEAT"].isActive() )
  // {
  //   return ;
  // }

  var socketsToBeClosed = [] ;
  var socketsToBePINGed = [] ;
  var i, conn ;
  var now = new Date().getTime() ;
  var heartbeatInterval = ( this.heartbeatMillis / 1000 ) ;
  var heartbeatInterval_x_3 = ( this.heartbeatMillis / 1000 ) * 3 ;
  var e = new Event ( "system", "PING" ) ;
  e.control._heartbeatIntervalMillis = this.heartbeatMillis ;
  var se = e.serialize() ;
  for ( i = 0 ; i < this._connectionList.length ; i++ )
  {
    conn = this._connectionList[i] ;
    if ( conn.version <= 0 )
    {
      continue ;
    }

    var dt = ( now - conn._timeStamp ) / 1000 ;
    try
    {
      if ( dt > heartbeatInterval_x_3 )
      {
        socketsToBeClosed.push ( conn ) ;
        continue ;
      }
      if ( dt > heartbeatInterval )
      {
        socketsToBePINGed.push ( conn ) ;
      }
    }
    catch ( exc )
    {
      Log.log ( exc ) ;
    }
  }
  for ( i = 0 ; i < socketsToBeClosed.length ; i++ )
  {
    try
    {
      Log.info ( "Connection timed out:\n" + socketsToBeClosed[i].toString() + "\n" ) ;
      socketsToBeClosed[i].socket.end() ;
    }
    catch ( exc )
    {
      Log.log ( exc ) ;
    }
  }
  socketsToBeClosed.length = 0 ;
  if ( socketsToBePINGed.length )
  {
    Log.info ( "Heartbeat PING sent." ) ;
  }
  for ( i = 0 ; i < socketsToBePINGed.length ; i++ )
  {
    try
    {
      socketsToBePINGed[i].socket.write ( se ) ;
    }
    catch ( exc )
    {
      Log.log ( exc ) ;
    }
  }
  socketsToBePINGed.length = 0 ;
};
Broker.prototype.republishService = function()
{
  if ( this.republishServiceTimeoutId )
  {
    clearTimeout ( this.republishServiceTimeoutId ) ;
  }
  var thiz = this ;
  this.republishServiceTimeoutId = setTimeout ( function republishServiceTimeout()
  {
    thiz._republishService() ;
  }, this._republishServiceTimeoutMillis );
};
Broker.prototype._republishService = function()
{
  if ( ! this.bonjour ) return ;
  this.bonjour.unpublishAll() ;
  if ( this.publishServiceTimeoutId )
  {
    clearTimeout ( this.publishServiceTimeoutId ) ;
  }
  var thiz = this ;
  this.publishServiceTimeoutId = setTimeout ( function publishServiceTimeout()
  {
    thiz.publishService() ;
  }, 1000 ) ;
};
Broker.prototype.publishService = function()
{
  if ( ! this.bonjour )
  {
    this.bonjour = require('bonjour')() ;
  }
  if ( !this.counter ) this.counter = 0 ;
  this.counter++ ;
  var eventNames   = this._eventNameToSockets.getKeys() ;
  eventNames = eventNames.join ( ',' ) ;
  var channelNames = this._channelNameToSockets.getKeys() ;
  channelNames = channelNames.join ( ',' ) ;
  var name = this.zeroconf.name
           + "-[H:" + os.hostname().replace ( /\./g, "-")
           + "]-[P:" + this.port
           // + "-P:" + this.port
           + "]-[T:" + eventNames
           // + "-T:" + eventNames
           + "]-[C:" + channelNames
           // + "-C:" + channelNames
           + "]"
           ;
  this.bonjour.publish ( { name: name
                         , type: this.zeroconf.type
                         , port: this.zeroconf.port
                         , txt:{ topics:eventNames
                               , channels:channelNames
                               , host:os.hostname()
                               , counter:this.counter
                         }
                         }) ;
};
Broker.prototype.unpublishService = function()
{
  if ( ! this.bonjour ) return ;
  this.bonjour.unpublishAll() ;
  this.bonjour.destroy() ;
  this.bonjour = null ;
};

/**
 * @method setConfig
 * @param {object} configJson
 * @return {void}
 */
Broker.prototype.setConfig = function ( configuration )
{
  var hbm = null ;
  this._configIsSet = true ;
  var connectionHookIsFile = false ;
  var hook ;
  if ( ! configuration )
  {
    configuration = T.getProperty ( "config" ) ;
  }
  if ( typeof configuration === 'string' )
  {
    var dir = process.cwd() ;
    configuration = configuration.replace ( /\\/g, "/" ) ;
    if ( configuration.indexOf ( "/" ) >= 0 )
    {
      dir = Path.dirname ( configuration ) ;
    }
    configuration = JSON.parse ( fs.readFileSync ( configuration, 'utf8' ) ) ;
    configuration.dir = dir ;
    if ( typeof configuration.connectionHook === 'string' )
    {
      configuration.connectionHook = configuration.connectionHook.replace ( /\\/g, "/" ) ;
      if ( configuration.connectionHook.indexOf ( "/" ) !== 0 )
      {
        configuration.connectionHook = dir + "/" + configuration.connectionHook ;
      }
    }
  }
  if ( ! configuration )
  {
    configuration = { connectionHook: "ConnectionHook" } ;
    hook = require ( "./" + configuration.connectionHook ) ;
  }
  if ( ! configuration.connectionHook )
  {
    configuration.connectionHook = "ConnectionHook" ;
    hook = require ( "./" + configuration.connectionHook ) ;
  }
  if ( ! hook )
  {
    hook = require ( configuration.connectionHook ) ;
  }
  this._connectionHook = new hook() ;
  if ( configuration.heartbeatMillis )
  {
    hbm = parseInt ( configuration.heartbeatMillis ) ;
    if ( ! isNaN ( hbm ) ) this.heartbeatMillis = hbm ;
  }
  this.heartbeatMillis = T.getInt ( "gepard.heartbeat.millis", this.heartbeatMillis ) ;

  var factor = 1 ;
  if ( configuration.maxMessageSize )
  {
    if ( configuration.maxMessageSize.endsWith ( "k" ) ) factor = 1000 ;
    if ( configuration.maxMessageSize.endsWith ( "m" ) ) factor = 1000000 ;
    hbm = parseInt ( configuration.maxMessageSize ) ;
    if ( ! isNaN ( hbm ) )
    {
      this._maxMessageSize = hbm * factor ;
    }
  }
  var v = T.getProperty ( "gepard.max.message.size" ) ;
  if ( v )
  {
    if ( v.endsWith ( "k" ) ) factor = 1000 ;
    if ( v.endsWith ( "m" ) ) factor = 1000000 ;
    hbm = parseInt ( v ) ;
    if ( ! isNaN ( hbm ) )
    {
      this._maxMessageSize = hbm * factor ;
    }
  }
  var zeroconf = this.zeroconf ;
  if ( ! zeroconf ) zeroconf = T.getProperty ( "gepard.zeroconf" ) ;
  if ( ! zeroconf ) zeroconf = configuration.zeroconf ;
  if ( zeroconf === 'true' )
  {
    zeroconf = "Gepard,gepard" ;
  }
  if ( typeof zeroconf === 'string' )
  {
    if ( zeroconf.indexOf ( ',' ) >= 0 )
    {
      var a = zeroconf.split ( ',' ) ;
      zeroconf      = {} ;
      zeroconf.name = a[0] ;
      zeroconf.type = a[1] ;
      zeroconf.port = a[2] ;
      if ( isFinite ( parseInt ( zeroconf.type ) ) ) // zeroconf.type is a port
      {
        zeroconf.port = zeroconf.type ;
        zeroconf.type = zeroconf.name ;
        zeroconf.name = "" ;
      }
    }
    else
    {
      var s = zeroconf ;
      zeroconf      = {} ;
      zeroconf.type = s ;
    }
  }
  if ( zeroconf )
  {
    if ( ! zeroconf.name ) zeroconf.name = "Gepard" ;
    if ( ! zeroconf.type ) zeroconf.type = "gepard" ;
    this.zeroconf = zeroconf ;
  }
  this._taskHandler.init ( configuration ) ;
};
Broker.prototype.setHeartbeatIntervalMillis = function ( millis )
{
  if ( isNaN ( millis ) || millis < 10 )
  {
    throw new Error ( "Invalid value for parameter millis:" + millis ) ;
  }
  this.heartbeatMillis = millis ;
};
Broker.prototype.setZeroconfParameter = function ( zeroconfCommaList )
{
  this.zeroconf = zeroconfCommaList ;
};
module.exports = Broker ;

if ( require.main === module )
{
  var Admin  = require ( "./Admin" ) ;
  var what   = T.getProperty ( "help" ) ;
  if ( what )
  {
    console.log ( "Broker for Gepard" ) ;
    console.log ( "Usage: gp.broker [Options] [Gepard-options]" ) ;
    console.log ( "Options are:" ) ;
    console.log ( "  --help \t display this text" ) ;
    console.log ( "  --web \t start also the WebSocketEventProxy" ) ;
    console.log ( "The form -D<name>[=<value> or --<name>[=<value>] are aquivalent." ) ;
    console.log ( "Gepard-options are:" ) ;
    console.log ( "  --gepard.port=<port> \t tcp connection port" ) ;
    console.log ( "      default is environment variable GEPARD_PORT or 17501" ) ;
    return ;
  }

  if ( T.getProperty ( "gepard.zeroconf" ) )
  {
    execute() ;
  }
  else
  {
    new Admin().isRunning ( function admin_is_running ( state )
    {
      if ( state )
      {
        console.log ( "Already running" ) ;
        return ;
      }
      execute() ;
    });
  }
  function execute()
  {
    var logDir = Gepard.getLogDirectory() ;
    Log.init ( "level=info,Xedirect=3,file=%GEPARD_LOG%/%APPNAME%.log:max=1m:v=4") ;

    var b = new Broker() ;
    b.listen() ;
    var wse ;
    b.on ( "shutdown", function onshutdown(e)
    {
      if ( wse ) wse.shutdown() ;
      process.exit ( 0 ) ;
    });
    if ( T.getBool ( "web", false ) )
    {
      var WebSocketEventProxy = require ( "./WebSocketEventProxy" ) ;
      wse = new WebSocketEventProxy() ;
      wse.listen() ;
    }
  }
}
