if ( typeof gepard === 'undefined' ) gepard = {} ;

gepard.counter = 0 ;
gepard.port = 17502 ; // default port
gepard.clients = {} ;
/**
 * get an existing client or create a new one
 * @param  {int} port port
 * @param  {[string]} host host (optional)
 * @return {WebClient}      the WebClient object
 */
gepard.getClient = function ( port, host )
{
  return this.getWebClient ( port, host ) ;
};
/**
 * get an existing client or create a new one
 * @param  {int} port port
 * @param  {[string]} host host (optional)
 * @return {WebClient}      the WebClient object
 */
gepard.getWebClient = function ( port, host )
{
  var key = "" + port + host ;
  if ( typeof port === "string" )
  {
    key = port ;
  }
  else
  {
    host = ! host ? "" : host ;
    if ( ! port )
    {
      port = gepard.port ;
    }
    key = "" + port + host ;
  }
  var wc = gepard[key] ;
  if ( wc ) return wc ;
  return new gepard.WebClient ( port, host ) ;
};
gepard.hasStacks = false;
try {
  if ( typeof Error !== 'undefined' )
  {
    throw new Error();
  }
} catch (e) {
    gepard.hasStacks = !!e.stack;
};
gepard.where = function ( str )
{
  var t = this._where ( str ) ;
  if ( typeof t !== 'undefined' )
  {
    console.log ( t ) ;
  }
};
gepard._where = function ( str )
{
  if ( ! gepard.hasStacks) {
      return;
  }
  try
  {
    throw new Error();
  }
  catch (e)
  {
    var lines = e.stack.split ("\n") ;
    var i = 0 ;
    for ( i = 0 ; i < lines.length ; i++ )
    {
      if ( lines[i].indexOf ( "where" ) >= 0 )
      {
        break ;
      }
    }
    for ( ; i < lines.length ; i++ )
    {
      if ( lines[i].indexOf ( "where" ) < 0 )
      {
        break ;
      }
    }
    var firstLine = lines[i] ;
    firstLine = firstLine.trim() ;
    if ( firstLine.indexOf ( "at " ) === 0 ) firstLine = firstLine.substring ( 3 ) ;
    if ( firstLine.indexOf ( "<anonymous function: " ) === 0 )
    {
      firstLine = firstLine.substring ( "<anonymous function: ".length ) ;
    }
    var p1 = firstLine.indexOf ( "http:" ) ;
    if ( p1 > 0 )
    {
      var p2 = firstLine.lastIndexOf ( "/" ) ;
      if ( p2 > 0 )
      {
        firstLine = firstLine.substring ( 0, p1 ) + firstLine.substring ( p2 + 1 ) ;
      }
    }
    var p1 = firstLine.indexOf ( "?" ) ;
    if ( p1 > 0 )
    {
      var p2 = firstLine.indexOf ( ":", p1 ) ;
      if ( p2 > 0 )
      {
        firstLine = firstLine.substring ( 0, p1 ) + firstLine.substring ( p2 ) ;
      }
    }
    if ( str )
    {
      return str + ": " + firstLine ;
    }
    return firstLine ;
  }
};

/**
 * WebClient class
 * @param {int} port port of interest.
 *                   Default: 17502
 * @param {[string]} host host of interest
 */
gepard.WebClient = function ( port, host )
{
  this._port                     = port ;
  this._socket                   = null ;
  this._user                     = null ;
  this._pendingEventList         = [] ;
  this._pendingResultList        = {} ;
  this._callbacks                = {} ;
  this._eventListenerFunctions   = new tangojs.MultiHash() ;
  this._pendingEventListenerList = [] ;
  var domain                     = host ? host : document.domain ;
  if ( typeof port === 'string' )
  {
    this._url = port ;
  }
  else
  if ( window.location.protocol === 'https:')
  {
    this._url = "wss://" + domain + ":" + this._port ;
  }
  else
  {
    this._url = "ws://" + domain + ":" + this._port ;
  }

  this._proxyIdentifier             = null ;
  this._onCallbackFunctions         = new tangojs.MultiHash() ;
  this._pendingLockList             = [] ;
  this._acquiredResources           = {} ;
  this._ownedResources              = {} ;
  this._acquiredSemaphores          = {} ;
  this._ownedSemaphores             = {} ;
  this._pendingAcquireSemaphoreList = [] ;
  gepard.clients[""+port+host]      = this ;
  this._reconnectIntervalMillis     = 5000 ;
  this._reconnect                   = !! gepard.reconnect ;
  // this.setChannel ( T.getProperty ( "gepard.channel" ) ) ; TODO
  this._isReconnecting              = false ;
};
gepard.WebClient.prototype._initialize = function()
{
};
/**
 * Description
 * @return unique id
 */
gepard.WebClient.prototype._createUniqueEventId = function()
{
  return this._url + "_" + new Date().getTime() + "-" + this._proxyIdentifier + "-" + (gepard.counter++) ;
};
gepard.WebClient.prototype._emit = function ( p1, eventName )
{
  var list = this._onCallbackFunctions.get ( eventName ) ;
  if ( list )
  {
    for ( i = 0 ; i < list.length ; i++ )
    {
      list[i].call ( this, p1, eventName ) ;
    }
  }
};
/**
 * close this client-connection.
 */
gepard.WebClient.prototype.close = function()
{
  this._reconnect = false ;
  if ( ! this._socket ) return ;
  try
  {
    this._socket.close() ;
    this._socket = null ;
  }
  catch ( exc )
  {
    
  }
}
/**
 * Sets the reconnect.
 *
 * @param      {boolean}  state   The state
 * @return     {Object}  this
 */
gepard.WebClient.prototype.setReconnect = function ( state )
{
  state = !! state ;
  this._reconnect = state ;
  return this ;
};
gepard.WebClient.prototype._retryConnection = function()
{
  this.getSocket() ;
};
gepard.WebClient.prototype._connect = function()
{
  var thiz = this ;
  this._socket = new WebSocket ( this._url ) ;
  var list, i ;
  /**
   * Description
   * @param {} err
   */
  this._socket.onerror = function(err)
  {
    if ( thiz._socket )
    {
      thiz._socket.close() ;
      thiz._socket = null ;
    }
    thiz._emit ( err, "error" ) ;
    if ( thiz._reconnect && ! thiz._isReconnecting )
    {
      thiz._isReconnecting = true ;
      var keyList = thiz._eventListenerFunctions.getKeys() ;
      if ( keyList.length && ! thiz._pendingEventListenerList.length )
      {
        var e = new gepard.Event ( "system", "addEventListener" ) ;
        if ( thiz.user ) e.setUser ( thiz.user ) ;
        e.body.eventNameList = keyList ;
        thiz._pendingEventListenerList.push ( { e:e } ) ;
      }
      if ( thiz.intervalId ) clearInterval ( thiz.intervalId ) ;
      console.log ( "Connection failed. Trying to reconnect." ) ;
      thiz.intervalId = setInterval ( thiz._retryConnection.bind ( thiz ), thiz._reconnectIntervalMillis ) ;
    }
  } ;
  this._socket.onclose = function onclose(e)
  {
    thiz._socket = null ;
    thiz._emit ( null, "close" ) ;
    thiz._emit ( null, "end" ) ;
    if ( thiz._reconnect && ! thiz._isReconnecting )
    {
      thiz._isReconnecting = true ;
      var keyList = thiz._eventListenerFunctions.getKeys() ;
      if ( keyList.length && ! thiz._pendingEventListenerList.length )
      {
        var e = new gepard.Event ( "system", "addEventListener" ) ;
        if ( thiz.user ) e.setUser ( thiz.user ) ;
        e.body.eventNameList = keyList ;
        thiz._pendingEventListenerList.push ( { e:e } ) ;
      }
      if ( thiz.intervalId ) clearInterval ( thiz.intervalId ) ;
      console.log ( "Connection closed. Trying to reconnect." ) ;
      thiz.intervalId = setInterval ( thiz._retryConnection.bind ( thiz ), thiz._reconnectIntervalMillis ) ;
    }
  } ;
  /**
   * Description
   * @param {} messageEvent
   */
  this._socket.onmessage = function onmessage ( messageEvent )
  {
    var mm = messageEvent.data ;
    if ( ! this.partialMessage ) this.partialMessage = "" ;
    mm = this.partialMessage + mm ;
    this.partialMessage = "" ;
    var result = thiz._splitJSONObjects ( mm ) ;
    var messageList = result.list

    var j = 0 ;
    for ( j = 0 ; j < messageList.length ; j++ )
    {
      var m = messageList[j] ;
      if ( m.length === 0 )
      {
        continue ;
      }
      if ( j === messageList.length - 1 )
      {
        if ( result.lastLineIsPartial )
        {
          this.partialMessage = m ;
          break ;
        }
      }
      if ( m.charAt ( 0 ) === '{' )
      {
        var e = gepard.deserialize ( m ) ;
        // e._Client = thiz ;
        var wid = e.getWebIdentifier() ;
        if ( e.isResult() )
        {
          var ctx = thiz._callbacks[wid] ;
          delete thiz._callbacks[wid] ;
          if ( e.isBad() )
          {
            console.log ( e.getStatus() ) ;
            if ( ctx.error )
            {
              ctx.error.call ( thiz, e ) ;
            }
            else
            if ( ctx.result )
            {
              ctx.result.call ( thiz, e ) ;
            }
            continue ;
          }
          var rcb = ctx.result ;
          rcb.call ( thiz, e ) ;
          continue ;
        }
        if ( e.getName() === "system" )
        {
          if ( e.getType() === "shutdown" )
          {
            return ;
          }
          if ( e.getType() === "client_info_response" )
          {
            thiz._proxyIdentifier = e.getProxyIdentifier() ;
            return ;
          }
          if ( e.isBad() )
          {
            var ctx = thiz._callbacks[wid] ;
            delete thiz._callbacks[wid] ;
            var rcb = ctx.error ;
            if ( rcb )
            {
              rcb.call ( thiz, e ) ;
            }
            continue ;
          }
          ////////////////////////////
          // lock resource handling //
          ////////////////////////////
          if ( e.getType() === "lockResourceResult" )
          {
            ctx = thiz._acquiredResources[e.body.resourceId] ;
            delete thiz._acquiredResources[e.body.resourceId] ;
            if ( e.body.isLockOwner )
            {
              thiz._ownedResources[e.body.resourceId] = ctx ;
            }
            if ( ctx )
            {
              ctx.callback.call ( thiz, null, e ) ;
            }
            continue ;
          }
          if ( e.getType() === "unlockResourceResult" )
          {
            delete thiz._ownedResources[e.body.resourceId] ;
            continue ;
          }
          ////////////////////////
          // semaphore handling //
          ////////////////////////
          if ( e.getType() === "acquireSemaphoreResult" )
          {
            if ( e.body.isSemaphoreOwner )
            {
              thiz._ownedSemaphores[e.body.resourceId] = thiz._acquiredSemaphores[e.body.resourceId] ;
              delete thiz._acquiredSemaphores[e.body.resourceId] ;
              ctx = thiz._ownedSemaphores[e.body.resourceId] ;
              ctx.callback.call ( thiz, null, e ) ;
            }
            continue ;
          }
          if ( e.getType() === "releaseSemaphoreResult" )
          {
            continue ;
          }
        }
        else
        {
          var callbackList = thiz._eventListenerFunctions.get ( e.getName() ) ;
          if ( ! callbackList )
          {
            thiz._error ( "callbackList for " + e.getName() + " not found." ) ;
            thiz._error ( e ) ;
          }
          for  ( j = 0 ; j < callbackList.length ; j++ )
          {
            if ( e.isResultRequested() )
            {
              e._Client = thiz ;
              callbackList[j].call ( thiz, e ) ;
              break ;
            }
            else
            {
              callbackList[j].call ( thiz, e ) ;
            }
          }
        }
      }
    }
  } ;
  /**
   * Description
   */
  this._socket.onopen = function()
  {
    var wasReconnecting
    if ( thiz._isReconnecting )
    {
      thiz._isReconnecting = false ;
      console.log ( "re-connect in progress." ) ;
      thiz._emit ( null, "reconnect" ) ;
    }
    thiz._isReconnecting = false ;
    if ( thiz.intervalId )
    {
      clearInterval ( thiz.intervalId ) ;
      thiz.intervalId = null ;
    }
    var einfo = new gepard.Event ( "system", "client_info" ) ;
    einfo.body.userAgent = navigator.userAgent ;
    einfo.body.connectionTime = new Date() ;
    einfo.body.domain = document.domain ;
    thiz._socket.send ( einfo.serialize() ) ;

    thiz._emit ( null, "open" ) ;
    thiz._emit ( null, "connect" ) ;

    var i ;
    if ( thiz._pendingEventList.length )
    {
      var uid = thiz._createUniqueEventId() ;
      for ( i = 0 ; i < thiz._pendingEventList.length ; i++ )
      {
        var ctx = thiz._pendingEventList[i] ;
        var e = ctx.e ;
        var resultCallback = ctx.resultCallback ;
        e.setWebIdentifier ( uid ) ;
        thiz._callbacks[uid] = ctx ;
        ctx.e = undefined ;
        thiz._socket.send ( e.serialize() ) ;
      }
      thiz._pendingEventList.length = 0 ;
    }
    if ( thiz._pendingEventListenerList.length )
    {
      for ( i = 0 ; i < thiz._pendingEventListenerList.length ; i++ )
      {
        var ctx = thiz._pendingEventListenerList[i] ;
        var e = ctx.e ;
        e.setWebIdentifier ( uid ) ;
        thiz._socket.send ( e.serialize() ) ;
      }
      thiz._pendingEventListenerList.length = 0 ;
    }
    if ( thiz._pendingLockList.length )
    {
      for ( i = 0 ; i < thiz._pendingLockList.length ; i++ )
      {
        var uid = thiz._createUniqueEventId() ;
        var ctx = thiz._pendingLockList[i] ;
        ctx.e.setUniqueId ( uid ) ;
        thiz._socket.send ( ctx.e.serialize() ) ;
        thiz._acquiredResources[ctx.e.body.resourceId] = ctx;
      }
      thiz._pendingLockList.length = 0 ;
    }
    if ( thiz._pendingAcquireSemaphoreList.length )
    {
      for ( i = 0 ; i < thiz._pendingAcquireSemaphoreList.length ; i++ )
      {
        var uid = thiz._createUniqueEventId() ;
        var ctx = thiz._pendingAcquireSemaphoreList[i] ;
        ctx.e.setUniqueId ( uid ) ;
        thiz._socket.send ( ctx.e.serialize() ) ;
        thiz._acquiredSemaphores[ctx.e.body.resourceId] = ctx;
      }
      thiz._pendingAcquireSemaphoreList.length = 0 ;
    }
    console.log ( "Connection opened." ) ;
  };
};
/**
 * Description
 * @return MemberExpression
 */
gepard.WebClient.prototype.getSocket = function()
{
  if ( ! this._socket )
  {
    this._connect() ;
  }
  return this._socket ;
};
/**
 * Description
 * @method emit
 * @param {} params
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype.emit = function ( params, callback )
{
  this._fireEvent ( params, callback, null ) ;
};
/**
 * Description
 * @method fire
 * @param {} params
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype.fire = function ( params, callback )
{
  this._fireEvent ( params, callback, null ) ;
};
/**
 * Description
 * @method request
 * @param {} params
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype.request = function ( params, callback )
{
  if ( typeof params === 'string' )
  {
    params = { name: params } ;
  }
  if ( typeof callback === 'function' )
  {
    callback = { result: callback } ;
  }
  if ( typeof callback.result !== 'function' )
  {
    throw new Error ( "Missing result function.")
  }
  this._fireEvent ( params, callback, { isBroadcast:false } ) ;
};
/**
 * Description
 * @method fireEvent
 * @param {} params
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype.fireEvent = function ( params, callback )
{
  return this._fireEvent ( params, callback, null ) ;
};
/**
 */
gepard.WebClient.prototype._fireEvent = function ( params, callback, opts )
{
  var e = null, user ;
  if ( params instanceof gepard.Event )
  {
    e = params ;
  }
  else
  if ( typeof params === 'string' )
  {
    e = new gepard.Event ( params ) ;
  }
  else
  if ( params && typeof params === 'object' )
  {
    e = new gepard.Event ( params.name, params.type ) ;
    e.setBody ( params.body ) ;
    e.setUser ( params.user ) ;
  }
  if ( ! e.getUser() ) e.setUser ( this.user )

  var ctx = {} ;
  if ( callback )
  {
    if ( typeof callback === 'object' )
    {
      ctx.result = callback.result ;
      if ( ctx.result ) e.setResultRequested() ;
      ctx.error = callback.error ;
      ctx.write = callback.write ;
    }
    else
    if ( typeof callback === 'function' )
    {
      ctx.write = callback ;
    }
  }
  if ( ! this._socket )
  {
    ctx.e = e ;
    this._pendingEventList.push ( ctx ) ;
  }
  var s = this.getSocket() ;
  if ( ! this._pendingEventList.length )
  {
    var uid = this._createUniqueEventId() ;
    e.setWebIdentifier ( uid ) ;
    this._callbacks[uid] = ctx ;
    var thiz = this ;
    s.send ( e.serialize() ) ;
  }
};
/**
 * Description
 * @param {} eventNameList
 * @param {} callback
 */
gepard.WebClient.prototype.on = function ( eventNameList, callback )
{
  if ( typeof eventNameList === 'string' )
  {
    if (  eventNameList === "open"
       || eventNameList === "close"
       || eventNameList === "error"
       || eventNameList === "shutdown"
       || eventNameList === "end"
       || eventNameList === "reconnect"
       // || eventNameList === "disconnect"
       )
    {
      this._onCallbackFunctions.put ( eventNameList, callback ) ;
      return ;
    }
  }
  this.addEventListener ( eventNameList, callback ) ;
};
/**
 * Description
 * @param {} eventNameList
 * @param {} callback
 */
gepard.WebClient.prototype.addEventListener = function ( eventNameList, callback )
{
  if ( ! eventNameList ) throw new Error ( "Client.addEventListener: Missing eventNameList." ) ;
  if ( typeof callback !== 'function' ) throw new Error ( "Client.addEventListener: callback must be a function." ) ;
  if ( typeof eventNameList === 'string' ) eventNameList = [ eventNameList ] ;
  if ( ! Array.isArray ( eventNameList ) )
  {
    throw new Error ( "Client.addEventListener: eventNameList must be a string or an array of strings." ) ;
  }
  if ( ! eventNameList.length )
  {
    throw new Error ( "Client.addEventListener: eventNameList must not be empty." ) ;
  }
  var e = new gepard.Event ( "system", "addEventListener" ) ;
  if ( this._user )
  {
    e.setUser ( this._user ) ;
  }
  e.body.eventNameList = eventNameList ;
  var i ;
  for ( i = 0 ; i < eventNameList.length ; i++ )
  {
    this._eventListenerFunctions.put ( eventNameList[i], callback ) ;
  }
  if ( ! this._socket )
  {
    this._pendingEventListenerList.push ( { e:e, callback:callback } ) ; // TODO: callback ??
  }
  else
  if ( this._pendingEventListenerList.length )
  {
    this._pendingEventListenerList.push ( { e:e, callback:callback } ) ;
  }
  var s = this.getSocket() ;
  if ( ! this._pendingEventListenerList.length )
  {
    var uid = this._createUniqueEventId() ;
    e.setUniqueId ( uid ) ;
    e.setWebIdentifier ( uid ) ;
    s.send ( e.serialize() ) ;
  }
};
/**
 * Description
 * @param {} eventNameOrFunction
 */
gepard.WebClient.prototype.removeEventListener = function ( eventNameOrFunction )
{
  var i ;
  if ( typeof eventNameOrFunction === 'string' )
  {
    eventNameOrFunction = [ eventNameOrFunction ] ;
  }
  else
  if ( typeof eventNameOrFunction === 'function' )
  {
    eventNameOrFunction = [ eventNameOrFunction ] ;
  }
  else
  if ( Array.isArray ( eventNameOrFunction ) )
  {
  }
  else
  {
    throw new Error ( "Client.removeEventListener: eventNameOrFunction must be a function, a string or an array of strings." ) ;
  }

  var eventNameList = [] ;
  for ( i = 0 ; i < eventNameOrFunction.length  ; i++ )
  {
    var item = eventNameOrFunction[i] ;
    if ( typeof item === 'string' )
    {
      eventNameList.push ( item ) ;
      this._eventListenerFunctions.remove ( item ) ;
    }
    else
    if ( typeof item === 'function' )
    {
      var keys = this._eventListenerFunctions.getKeysOf ( item ) ;
      for ( i = 0 ; i < keys.length ; i++ )
      {
        eventNameList.push ( keys[i] ) ;
      }
      this._eventListenerFunctions.remove ( item ) ;
    }
    if ( ! eventNameList.length ) return ;
    var e = new gepard.Event ( "system", "removeEventListener" ) ;
    e.setUser ( this._user ) ;
    e.body.eventNameList = eventNameList ;
    var s = this.getSocket() ;
    s.send ( e.serialize() ) ;
  }
};
/**
 * Description
 * @param {} str
 * @return list
 */
gepard.WebClient.prototype._splitJSONObjects = function ( str )
{
  var list = [] ;
  var pcounter = 1 ;
  var q = "" ;
  var i0 = 0 ;
  var i = 1 ;
  for ( i = 1 ; i < str.length ; i++ )
  {
    var c = str.charAt ( i ) ;
    if ( c === '"' || c === "'" )
    {
      q = c ;
      for ( var j = i+1 ; j < str.length ; j++ )
      {
        c = str.charAt ( j ) ;
        if ( c === q )
        {
          if ( str.charAt  ( j - 1 ) === '\\' )
          {
            continue ;
          }
          i = j ;
          break ;
        }
      }
    }
    if ( c === '{' )
    {
      pcounter++ ;
      continue ;
    }
    if ( c === '}' )
    {
      pcounter-- ;
      if ( pcounter === 0 )
      {
        list.push ( str.substring ( i0, i + 1 ) ) ;
        i0 = i + 1 ;
        for ( ; i0 < str.length ; i0++ )
        {
          if ( str.charAt ( i0 ) === '{' )
          {
            i = i0 - 1 ;
            break ;
          }
        }
      }
      continue ;
    }
  }
  if ( i0 < str.length )
  {
    list.push ( str.substring ( i0 ) ) ;
  }
	return { list: list, lastLineIsPartial: pcounter ? true : false } ;
};
////////////////////////////////////////////////////////////////////////////////
/// Unification                                                               //
////////////////////////////////////////////////////////////////////////////////
/**
 * Description
 * @param {} message
 */
gepard.WebClient.prototype.sendResult = function ( message )
{
  if ( ! message.isResultRequested() )
  {
    this._error ( "No result requested" ) ;
    this._error ( message ) ;
    return ;
  }
  message.setIsResult() ;
  this.send ( message ) ;
};
/**
 * Description
 * @param {} message
 */
gepard.WebClient.prototype.send = function ( event )
{
  this.getSocket().send ( event.serialize() ) ;
};
/**
 * Description
 * @param {} what
 */
gepard.WebClient.prototype._error = function ( what )
{
  console.log ( what ) ;
};
/**
 * Description
 * @method lockResource
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype._lockResource = function ( resourceId, callback )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.lockResource: resourceId must be a string." ) ;
    return ;
  }
  if ( typeof callback !== 'function' )
  {
    this._error ( "Client.lockResource: callback must be a function." ) ;
    return ;
  }
  if ( this._ownedResources[resourceId] || this._acquiredResources[resourceId] )
  {
    this._error ( "Client.lockResource: already owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new gepard.Event ( "system", "lockResourceRequest" ) ;
  e.body.resourceId = resourceId ;
  var ctx = {} ;
  ctx.resourceId = resourceId ;
  ctx.callback = callback ;
  ctx.e = e ;
  if ( ! this._socket || this._pendingLockList.length )
  {
    this._pendingLockList.push ( ctx ) ;
  }
  var s = this.getSocket() ;
  if ( ! this._pendingLockList.length )
  {
    e.setUniqueId ( this._createUniqueEventId() ) ;
    this._acquiredResources[resourceId] = ctx;
    this.send ( e ) ;
  }
};
/**
 * Description
 * @method unlockResource
 * @param {} resourceId
 * @return 
 */
gepard.WebClient.prototype._unlockResource = function ( resourceId )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.unlockResource: resourceId must be a string." ) ;
    return ;
  }
  delete this._acquiredResources[resourceId] ;
  if ( ! this._ownedResources[resourceId] )
  {
    this._error ( "Client.unlockResource: not owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new gepard.Event ( "system", "unlockResourceRequest" ) ;
  e.body.resourceId = resourceId ;
  var s = this.getSocket() ;
  e.setUniqueId ( this._createUniqueEventId() ) ;
  delete this._ownedResources[resourceId] ;
  this.send ( e ) ;
};
/**
 * Description
 * @method acquireSemaphore
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
gepard.WebClient.prototype._acquireSemaphore = function ( resourceId, callback )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.acquireSemaphore: resourceId must be a string." ) ;
    return ;
  }
  if ( typeof callback !== 'function' )
  {
    this._error ( "Client.acquireSemaphore: callback must be a function." ) ;
    return ;
  }
  if ( this._acquiredSemaphores[resourceId] )
  {
    this._error ( "Client.acquireSemaphore: already waiting for resourceId=" + resourceId ) ;
    return ;
  }
  if ( this._ownedSemaphores[resourceId] )
  {
    this._error ( "Client.acquireSemaphore: already owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new gepard.Event ( "system", "acquireSemaphoreRequest" ) ;
  e.body.resourceId = resourceId ;
  var ctx = {} ;
  ctx.resourceId = resourceId ;
  ctx.callback = callback ;
  ctx.e = e ;

  if ( ! this._socket || this._pendingAcquireSemaphoreList.length )
  {
    this._pendingAcquireSemaphoreList.push ( ctx ) ;
  }
  var s = this.getSocket() ;
  if ( ! this._pendingAcquireSemaphoreList.length )
  {
    e.setUniqueId ( this._createUniqueEventId() ) ;
    this._acquiredSemaphores[resourceId] = ctx;
    this.send ( e ) ;
  }
};
/**
 * Description
 * @method releaseSemaphore
 * @param {} resourceId
 * @return 
 */
gepard.WebClient.prototype._releaseSemaphore = function ( resourceId )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.releaseSemaphore: resourceId must be a string." ) ;
    return ;
  }
  delete this._acquiredSemaphores[resourceId] ;
  var e = new gepard.Event ( "system", "releaseSemaphoreRequest" ) ;
  e.body.resourceId = resourceId ;
  var s = this.getSocket() ;
  e.setUniqueId ( this._createUniqueEventId() ) ;
  delete this._ownedSemaphores[resourceId] ;
  this.send ( e ) ;
};
gepard.WebClient.prototype._releaseAllSemaphores = function()
{
  for ( var key in this._ownedSemaphores )
  {
    this.releaseSemaphore ( this._ownedSemaphores[key] ) ;
  }
  this.releaseSemaphore = {} ;
};
gepard.WebClient.prototype.getSemaphore = function ( resourceId )
{
  return new gepard.Semaphore ( this, resourceId ) ;
};
gepard.WebClient.prototype.getLock = function ( resourceId )
{
  return new gepard.Lock ( this, resourceId ) ;
};
/**
 * Description
 * @constructor
 * @return 
 */
gepard.Semaphore = function ( client, resourceId )
{
  this.className         = "Semaphore" ;
  this._resourceId       = resourceId ;
  this._isSemaphoreOwner = false ;
  if ( typeof client === 'string' )
  {
    this._resourceId = client ;
    this._client     = gepard.getWebClient() ;
  }
  else
  {
    this._client = client ;
  }
};

/**
 * Description
 * @method toString
 * @return string
 */
gepard.Semaphore.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isSemaphoreOwner + "]" ;
};
/**
 * Description
 * @method acquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
gepard.Semaphore.prototype.acquire = function ( callback )
{
  this._callback = callback ;
  this._client._acquireSemaphore ( this._resourceId, this._acquireSemaphoreCallback.bind ( this ) ) ;
};
gepard.Semaphore.prototype._acquireSemaphoreCallback = function ( err, e )
{
  if ( ! err )
  {
    this._acquireSemaphoreResult = e ;
    this._isSemaphoreOwner = e.body.isSemaphoreOwner ;
  }
  this._callback.call ( this, err ) ;
};
/**
 * Description
 * @method isOwner
 * @return MemberExpression
 */
gepard.Semaphore.prototype.isOwner = function()
{
  return this._isSemaphoreOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
gepard.Semaphore.prototype.release = function()
{
  this._isSemaphoreOwner = false ;
  this._client._releaseSemaphore ( this._resourceId ) ;
};
/**
 * Description
 * @constructor
 * @param {string} resourceId
 * @return 
 */
gepard.Lock = function ( client, resourceId )
{
  this.className = "Lock" ;
  this._resourceId = resourceId ;
  this._isLockOwner = false ;
  if ( typeof client === 'string' )
  {
    this._resourceId = client ;
    this._client = gepard.getWebClient() ;
  }
  else
  {
    this._client = client ;
  }
};
/**
 * Description
 * @method toString
 * @return string
 */
gepard.Lock.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isLockOwner + "]" ;
};

/**
 * Description
 * @method acquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
gepard.Lock.prototype.acquire = function ( callback )
{
  this._callback = callback ;
  this._client._lockResource ( this._resourceId, this._lockResourceCallback.bind ( this ) ) ;
};
gepard.Lock.prototype._lockResourceCallback = function ( err, e )
{
  this._lockResourceResult = e ;
  this._isLockOwner = e.body.isLockOwner ;
  this._callback.call ( this, err ) ;
};
/**
 * Description
 * @method isOwner
 * @return MemberExpression
 */
gepard.Lock.prototype.isOwner = function()
{
  return this._isLockOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
gepard.Lock.prototype.release = function()
{
  if ( ! this._isLockOwner )
  {
    return ;
  }
  this._isLockOwner = false ;
  this._client._unlockResource ( this._resourceId ) ;
};
