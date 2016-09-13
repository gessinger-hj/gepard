var util          = require ( 'util' ) ;
var Event         = require ( "./Event" ) ;
var T             = require ( "./Tango" ) ;
var MultiHash     = require ( "./MultiHash" ) ;
var Log           = require ( "./LogFile" ) ;
var Gepard        = require ( "./Gepard" ) ;
var TracePoints   = require ( "./TracePoints" ) ;

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
      var TPStore = TracePoints.getStore ( "broker" ) ;
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

module.exports = Connection ;
