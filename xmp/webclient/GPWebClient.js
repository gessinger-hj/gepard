if ( typeof tangojs === 'undefined' ) tangojs = {} ;
if ( typeof tangojs.gp === 'undefined' ) tangojs.gp = {} ;

tangojs.gp.counter = 0 ;
tangojs.gp.getWebClient = function ( port )
{
  if ( tangojs.gp._WebClientInstance ) return tangojs.gp._WebClientInstance ;
  return new tangojs.gp.WebClient ( port ) ;
};
/**
 * Description
 * @param {} port
 */
tangojs.gp.WebClient = function ( port )
{
  this._port                       = port ;
  this._socket                     = null ;
  this._user                       = null ;
  this._pendingEventList           = [] ;
  this._pendingResultList          = {} ;
  this._callbacks                  = {} ;
  this._eventListenerFunctions     = new tangojs.MultiHash() ;
  this._pendingEventListenerList   = [] ;
  if ( window.location.protocol == 'http:')
  {
    this._url = "ws://" + document.domain + ":" + this._port ;
  }
  else
  {
    this._url = "wss://" + document.domain + ":" + this._port ;
  }

  this._proxyIdentifier            = null ;
  this._onCallbackFunctions        = new tangojs.MultiHash() ;
  this._pendingLockList            = [] ;
  this._aquiredResources           = {} ;
  this._ownedResources             = {} ;
  this._aquiredSemaphores          = {} ;
  this._ownedSemaphores            = {} ;
  this._pendingAquireSemaphoreList = [] ;

  tangojs.gp._WebClientInstance = this ;
};
tangojs.gp.WebClient.prototype._initialize = function()
{
};
/**
 * Description
 * @return BinaryExpression
 */
tangojs.gp.WebClient.prototype._createUniqueEventId = function()
{
  return this._url + "_" + new Date().getTime() + "-" + this._proxyIdentifier + "-" + (tangojs.gp.counter++) ;
};
tangojs.gp.WebClient.prototype.emit = function ( p1, eventName )
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
 * Description
 */
tangojs.gp.WebClient.prototype._connect = function()
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
    if ( ! thiz._socket ) return ;
    thiz._socket.close() ;
    thiz._socket = null ;
    thiz.emit ( err, "error" ) ;
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
        var e = tangojs.gp.deserialize ( m ) ;
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
            ctx = thiz._aquiredResources[e.body.resourceId] ;
            delete thiz._aquiredResources[e.body.resourceId] ;
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
          if ( e.getType() === "aquireSemaphoreResult" )
          {
            if ( e.body.isSemaphoreOwner )
            {
              thiz._ownedSemaphores[e.body.resourceId] = thiz._aquiredSemaphores[e.body.resourceId] ;
              delete thiz._aquiredSemaphores[e.body.resourceId] ;
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
            callbackList[j].call ( thiz, e ) ;
          }
        }
      }
    }
  } ;
  /**
   * Description
   * @param {} e
   */
  this._socket.onclose = function onclose(e)
  {
    if ( ! thiz._socket ) return ;
    thiz._socket = null ;
    thiz.emit ( null, "close" ) ;
  } ;
  /**
   * Description
   */
  this._socket.onopen = function()
  {
    var einfo = new tangojs.gp.Event ( "system", "client_info" ) ;
    einfo.body.userAgent = navigator.userAgent ;
    einfo.body.connectionTime = new Date() ;
    einfo.body.domain = document.domain ;
    thiz._socket.send ( einfo.serialize() ) ;

    thiz.emit ( null, "open" ) ;

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
        var callback = ctx.callback ;
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
        thiz._aquiredResources[ctx.e.body.resourceId] = ctx;
      }
      thiz._pendingLockList.length = 0 ;
    }
    if ( thiz._pendingAquireSemaphoreList.length )
    {
      for ( i = 0 ; i < thiz._pendingAquireSemaphoreList.length ; i++ )
      {
        var uid = thiz._createUniqueEventId() ;
        var ctx = thiz._pendingAquireSemaphoreList[i] ;
        ctx.e.setUniqueId ( uid ) ;
        thiz._socket.send ( ctx.e.serialize() ) ;
        thiz._aquiredSemaphores[ctx.e.body.resourceId] = ctx;
      }
      thiz._pendingAquireSemaphoreList.length = 0 ;
    }
  };
};
/**
 * Description
 * @return MemberExpression
 */
tangojs.gp.WebClient.prototype.getSocket = function()
{
  if ( ! this._socket )
  {
    this._connect() ;
  }
  return this._socket ;
};
/**
 * Description
 * @method fire
 * @param {} params
 * @param {} callback
 * @return 
 */
tangojs.gp.WebClient.prototype.fire = function ( params, callback )
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
tangojs.gp.WebClient.prototype.request = function ( params, callback )
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
tangojs.gp.WebClient.prototype.fireEvent = function ( params, callback )
{
  return this._fireEvent ( params, callback, null ) ;
};
/**
 */
tangojs.gp.WebClient.prototype._fireEvent = function ( params, callback, opts )
{
  var e = null, user ;
  if ( params instanceof tangojs.gp.Event )
  {
    e = params ;
  }
  else
  if ( typeof params === 'string' )
  {
    e = new tangojs.gp.Event ( params ) ;
  }
  else
  if ( params && typeof params === 'object' )
  {
    e = new tangojs.gp.Event ( params.name, params.type ) ;
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
tangojs.gp.WebClient.prototype.on = function ( eventNameList, callback )
{
  if ( typeof eventNameList === 'string' )
  {
    if (  eventNameList === "open"
       || eventNameList === "close"
       || eventNameList === "error"
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
tangojs.gp.WebClient.prototype.addEventListener = function ( eventNameList, callback )
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
  var e = new tangojs.gp.Event ( "system", "addEventListener" ) ;
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
    this._pendingEventListenerList.push ( { e:e, callback:callback } ) ;
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
tangojs.gp.WebClient.prototype.removeEventListener = function ( eventNameOrFunction )
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
    var e = new tangojs.gp.Event ( "system", "removeEventListener" ) ;
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
tangojs.gp.WebClient.prototype._splitJSONObjects = function ( str )
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
tangojs.gp.WebClient.prototype.sendResult = function ( message )
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
tangojs.gp.WebClient.prototype.send = function ( event )
{
  this.getSocket().send ( event.serialize() ) ;
};
/**
 * Description
 * @param {} what
 */
tangojs.gp.WebClient.prototype._error = function ( what )
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
tangojs.gp.WebClient.prototype._lockResource = function ( resourceId, callback )
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
  if ( this._ownedResources[resourceId] || this._aquiredResources[resourceId] )
  {
    this._error ( "Client.lockResource: already owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new tangojs.gp.Event ( "system", "lockResourceRequest" ) ;
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
    this._aquiredResources[resourceId] = ctx;
    this.send ( e ) ;
  }
};
/**
 * Description
 * @method unlockResource
 * @param {} resourceId
 * @return 
 */
tangojs.gp.WebClient.prototype._unlockResource = function ( resourceId )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.unlockResource: resourceId must be a string." ) ;
    return ;
  }
  delete this._aquiredResources[resourceId] ;
  if ( ! this._ownedResources[resourceId] )
  {
    this._error ( "Client.unlockResource: not owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new tangojs.gp.Event ( "system", "unlockResourceRequest" ) ;
  e.body.resourceId = resourceId ;
  var s = this.getSocket() ;
  e.setUniqueId ( this._createUniqueEventId() ) ;
  delete this._ownedResources[resourceId] ;
  this.send ( e ) ;
};
/**
 * Description
 * @method aquireSemaphore
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
tangojs.gp.WebClient.prototype._aquireSemaphore = function ( resourceId, callback )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.aquireSemaphore: resourceId must be a string." ) ;
    return ;
  }
  if ( typeof callback !== 'function' )
  {
    this._error ( "Client.aquireSemaphore: callback must be a function." ) ;
    return ;
  }
  if ( this._aquiredSemaphores[resourceId] )
  {
    this._error ( "Client.aquireSemaphore: already waiting for resourceId=" + resourceId ) ;
    return ;
  }
  if ( this._ownedSemaphores[resourceId] )
  {
    this._error ( "Client.aquireSemaphore: already owner of resourceId=" + resourceId ) ;
    return ;
  }

  var e = new tangojs.gp.Event ( "system", "aquireSemaphoreRequest" ) ;
  e.body.resourceId = resourceId ;
  var ctx = {} ;
  ctx.resourceId = resourceId ;
  ctx.callback = callback ;
  ctx.e = e ;

  if ( ! this._socket || this._pendingAquireSemaphoreList.length )
  {
    this._pendingAquireSemaphoreList.push ( ctx ) ;
  }
  var s = this.getSocket() ;
  if ( ! this._pendingAquireSemaphoreList.length )
  {
    e.setUniqueId ( this._createUniqueEventId() ) ;
    this._aquiredSemaphores[resourceId] = ctx;
    this.send ( e ) ;
  }
};
/**
 * Description
 * @method releaseSemaphore
 * @param {} resourceId
 * @return 
 */
tangojs.gp.WebClient.prototype._releaseSemaphore = function ( resourceId )
{
  if ( typeof resourceId !== 'string' || ! resourceId )
  {
    this._error ( "Client.releaseSemaphore: resourceId must be a string." ) ;
    return ;
  }
  delete this._aquiredSemaphores[resourceId] ;
  var e = new tangojs.gp.Event ( "system", "releaseSemaphoreRequest" ) ;
  e.body.resourceId = resourceId ;
  var s = this.getSocket() ;
  e.setUniqueId ( this._createUniqueEventId() ) ;
  delete this._ownedSemaphores[resourceId] ;
  this.send ( e ) ;
};
tangojs.gp.WebClient.prototype._releaseAllSemaphores = function()
{
  for ( var key in this._ownedSemaphores )
  {
    this.releaseSemaphore ( this._ownedSemaphores[key] ) ;
  }
  this.releaseSemaphore = {} ;
};
tangojs.gp.WebClient.prototype.getSemaphore = function ( resourceId )
{
  return new tangojs.gp.Semaphore ( this, resourceId ) ;
};
tangojs.gp.WebClient.prototype.getLock = function ( resourceId )
{
  return new tangojs.gp.Lock ( this, resourceId ) ;
};
/**
 * Description
 * @constructor
 * @return 
 */
tangojs.gp.Semaphore = function ( client, resourceId )
{
  this.className         = "Semaphore" ;
  this._resourceId       = resourceId ;
  this._client           = client ;
  this._isSemaphoreOwner = false ;
};

/**
 * Description
 * @method toString
 * @return string
 */
tangojs.gp.Semaphore.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isSemaphoreOwner + "]" ;
};
/**
 * Description
 * @method aquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
tangojs.gp.Semaphore.prototype.aquire = function ( callback )
{
  this._callback = callback ;
  this._client._aquireSemaphore ( this._resourceId, this._aquireSemaphoreCallback.bind ( this ) ) ;
};
tangojs.gp.Semaphore.prototype._aquireSemaphoreCallback = function ( err, e )
{
  if ( ! err )
  {
    this._aquireSemaphoreResult = e ;
    this._isSemaphoreOwner = e.body.isSemaphoreOwner ;
  }
  this._callback.call ( this, err ) ;
};
/**
 * Description
 * @method isOwner
 * @return MemberExpression
 */
tangojs.gp.Semaphore.prototype.isOwner = function()
{
  return this._isSemaphoreOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
tangojs.gp.Semaphore.prototype.release = function()
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
tangojs.gp.Lock = function ( client, resourceId )
{
  this.className = "Lock" ;
  this._resourceId = resourceId ;
  this._client = client ;
  this._isLockOwner = false ;
};
/**
 * Description
 * @method toString
 * @return string
 */
tangojs.gp.Lock.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isLockOwner + "]" ;
};

/**
 * Description
 * @method aquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
tangojs.gp.Lock.prototype.aquire = function ( callback )
{
  this._callback = callback ;
  this._client._lockResource ( this._resourceId, this._lockResourceCallback.bind ( this ) ) ;
};
tangojs.gp.Lock.prototype._lockResourceCallback = function ( err, e )
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
tangojs.gp.Lock.prototype.isOwner = function()
{
  return this._isLockOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
tangojs.gp.Lock.prototype.release = function()
{
  if ( ! this._isLockOwner )
  {
    return ;
  }
  this._isLockOwner = false ;
  this._client._unlockResource ( this._resourceId ) ;
};
