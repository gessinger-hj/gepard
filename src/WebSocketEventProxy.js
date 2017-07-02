#!/usr/bin/env node

var ws           = require ( "nodejs-websocket" ) ;
var EventEmitter = require ( "events" ).EventEmitter ;
var util         = require ( 'util' ) ;

var Event        = require ( "./Event" ) ;
var Client       = require ( "./Client" ) ;
var Lock         = require ( "./Lock" ) ;
var Semaphore    = require ( "./Semaphore" ) ;

var Log          = require ( "./LogFile" ) ;
var MultiHash    = require ( "./MultiHash" ) ;
var T            = require ( "./Tango" ) ;

/**
 * Description
 * @constructor
 * @method WebSocketEventProxy
 * @param {} port
 * @return 
 */
var WebSocketEventProxy = function ( port )
{
  EventEmitter.call ( this ) ;
	this.className = "WebSocketEventProxy" ;
  this._sockets = {} ;
  this._eventNameToSocketContext = new MultiHash() ;
	this.client = null ;
	this.port = port ;
	this._create() ;
	this._excludeSelf = T.getBool ( "gepard.websocket.exclude.self", false ) ;
};
util.inherits ( WebSocketEventProxy, EventEmitter ) ;

/**
 * Description
 * @method toString
 * @return BinaryExpression
 */
WebSocketEventProxy.prototype.toString = function()
{
	return "(" + this.className + ")[port=" + this.port + "]" ;
};
/**
 * Description
 * @method closeAllWebsockets
 * @return 
 */
WebSocketEventProxy.prototype.closeAllWebsockets = function()
{
	if ( ! this.server ) return ;

	this.server.connections.forEach(function (conn)
	{
    conn.close() ;
  }) ;
};
/**
 * Description
 * @method sendToWebSocket
 * @param {} e
 * @return 
 */
WebSocketEventProxy.prototype.sendToWebSocket = function ( e )
{
	var pid = e.getProxyIdentifier() ;
	var conn = this._sockets[pid]
	if ( conn )
	{
		conn.send ( e ) ;
	}
};
/**
 * Description
 * @method generalEventListenerFunction
 * @param {} e
 * @return 
 */
WebSocketEventProxy.prototype.generalEventListenerFunction = function ( e )
{
	var se = e.serialize() ;
	var i, conn ;
	var name = e.getName() ;
	var list = this._eventNameToSocketContext.get ( name ) ;
	if ( list )
	{
		for ( i = 0 ; i < list.length ; i++ )
		{
			conn = list[i] ;
			this._excludeSelf
			if ( this._excludeSelf && conn.socket.key === e.getProxyIdentifier() ) continue ;
			conn.socket.sendText ( se ) ;
		}
	}
};
/**
 * Description
 * @method removeWebsocket
 * @param {} socket
 * @return 
 */
WebSocketEventProxy.prototype.removeWebsocket = function ( socket )
{
	var conn = this._sockets[socket.key] ;
	if ( ! conn )
	{
		return ;
	}
	conn.remove() ;
};
WebSocketEventProxy.prototype._create = function()
{
	var wssOptions = {} ;
	var thiz = this ;
	this.server = ws.createServer ( wssOptions, function ( socket )
	{
		var eventNameList ;
		var i = 0 ;
		var index = 0 ;

		Log.info ( 'web connects' ) ;
		var e ;
		socket.on ( "text", function ( message )
		{
			try
			{
				e = Event.prototype.deserialize ( message ) ;
			}
			catch ( exc )
			{
				Log.log ( exc ) ;
			}
			e.setProxyIdentifier ( socket.key ) ;
			var conn = thiz._sockets[this.key] ;
			if ( ! conn )
			{
				conn = new Conn  ( thiz, socket ) ;
				Log.info ( 'web-socket connection created.' ) ;
			}
			if ( ! thiz.client )
			{
				thiz.client = new Client() ;
				thiz.client.on ( 'end', function()
				{
					// thiz.client.removeAllListeners() ;
				  thiz.client = null ;
					Log.info ( 'gepard connection closed.' ) ;
				});
				thiz.client.on ( 'shutdown', function()
				{
					// thiz.client.removeAllListeners() ;
					Log.info ( 'gepard shutdown.' ) ;
					thiz.closeAllWebsockets() ;
				});
			}
			if ( e.getName() === 'system' )
			{
				thiz.handleSystemMessages ( conn, e ) ;
			}
			else
			{
				if ( ! e.isResultRequested() )
				{
					e.control.__ignore_result_function_as_result_indicator__ = true ;
				}
				thiz.client.fire ( e
	      , { 
						result: function(e)
	          {
							if ( e.isResult() )
							{
								thiz.sendToWebSocket ( e ) ;
							}
	          }
	        	, 
						error: function(e)
	          {
							thiz.sendToWebSocket ( e ) ;
	          }
	         	, 
						write: function()
	          {
	          }
	        }) ;
				}
		}) ;
		socket.on ( "error", function ( e )
		{
			thiz.removeWebsocket ( this ) ;
			Log.info ( 'web-socket closed with error.' ) ;
		}) ;
		socket.on ( "close", function ( message )
		{
			thiz.removeWebsocket ( this ) ;
			Log.info ( 'web-socket closed.' ) ;
		}) ;
	}) ;
};
/**
 * Description
 * @method handleSystemMessages
 * @param {} conn
 * @param {} ne
 * @return 
 */
WebSocketEventProxy.prototype.handleSystemMessages = function ( conn, e )
{
	if ( e.getType() === "client_info" )
	{
		e.setType ( "client_info_response" ) ;
		conn.send ( e ) ;
		return ;
	}
	if ( e.getType() === 'addEventListener' )
	{
	  eventNameList = e.body.eventNameList ;
	  var errText = "" ;
	  if ( ! eventNameList ) { Log.error ( "Missing eventNameList." ) ; return ; }
	  if ( typeof eventNameList === 'string' ) eventNameList = [ eventNameList ] ;
	  if ( ! Array.isArray ( eventNameList ) )
	  {
	    Log.error ( "eventNameList must be a string or an array of strings." ) ; return ;
	  }
	  if ( ! eventNameList.length )
	  {
	    Log.error ( "eventNameList must not be empty." ) ; return ;
	  }
	  if ( ! conn.eventNameList ) conn.eventNameList = [] ;
	  for ( i = 0 ; i < conn.eventNameList.lenth ; i++ )
	  {
	  	index = eventNameList.indexOf ( conn.eventNameList[i] ) ;
	  	if ( index >= 0 )
	  	{
        eventNameList.splice ( index, 1 ) ;
	  	}
	  }
	  if ( ! eventNameList.length )
	  {
	  	return ;
	  }
	  for ( i = 0 ; i < eventNameList.length ; i++ )
	  {
	  	conn.eventNameList.push ( eventNameList[i] ) ;
	  }
	  var eventNameListToBePropagated = [] ;
	  for ( i = 0 ; i < eventNameList.length ; i++ )
	  {
	  	if ( ! this._eventNameToSocketContext.get ( eventNameList[i] ) )
	  	{
	  		eventNameListToBePropagated.push ( eventNameList[i] ) ;
	  	}
			this._eventNameToSocketContext.put ( eventNameList[i], conn ) ;
	  }
	  if ( eventNameListToBePropagated.length )
	  {
	  	this.client.addEventListener ( eventNameListToBePropagated, this.generalEventListenerFunction.bind ( this ) ) ;
	  }
	}
	else
	if ( e.getType() === 'removeEventListener' )
	{
	  eventNameList = e.body.eventNameList ;
	  var errText = "" ;
	  if ( ! eventNameList ) { Log.error ( "Missing eventNameList." ) ; return ; }
	  if ( typeof eventNameList === 'string' ) eventNameList = [ eventNameList ] ;
	  if ( ! Array.isArray ( eventNameList ) )
	  {
	    Log.error ( "eventNameList must be a string or an array of strings." ) ; return ;
	  }
	  if ( ! eventNameList.length )
	  {
	    Log.error ( "eventNameList must not be empty." ) ; return ;
	  }
		var currentKeys = this._eventNameToSocketContext.getKeys() ;
		if ( conn.eventNameList )
		{
			for ( i = 0 ; i < eventNameList.length ; i++ )
			{
		  	index = conn.eventNameList.indexOf ( eventNameList[i] ) ;
		  	if ( index >= 0 )
		  	{
	        conn.eventNameList.splice ( index, 1 ) ;
					this._eventNameToSocketContext.remove ( eventNameList[i], conn ) ;
		  	}
			}
		}
	  var eventNamesToBeRemoved = [] ;
		for ( i = 0 ; i < currentKeys.length ; i++ )
		{
			if ( ! this._eventNameToSocketContext.get ( currentKeys[i] ) )
			{
				eventNamesToBeRemoved.push ( currentKeys[i] ) ;
			}
		}
		if ( eventNamesToBeRemoved.length )
		{
			this.client.removeEventListener ( eventNamesToBeRemoved ) ;
		}
	}
	else
	if ( e.getType() === 'lockResourceRequest' )
	{
		conn._lockResourceRequest  ( e ) ;
	}
	else
	if ( e.getType() === 'unlockResourceRequest' )
	{
		conn._unlockResourceRequest  ( e ) ;
	}
	else
	if ( e.getType() === 'acquireSemaphoreRequest' )
	{
		conn._acquireSemaphoreRequest  ( e ) ;
	}
	else
	if ( e.getType() === 'releaseSemaphoreRequest' )
	{
		conn._releaseSemaphoreRequest  ( e ) ;
	}
  else
  {
    Log.error ( "Invalid event received:\n" + e ) ; return ;
  }
};
/**
 * Description
 * @method listen
 * @param {} port
 * @return 
 */
WebSocketEventProxy.prototype.listen = function ( port )
{
	if ( port )
	{
		this.port = port ;
	}
	if ( ! this.port )
	{
    this.port = T.getProperty ( "gepard.websocket.port", 17502 ) ;
	}
	this.server.listen ( this.port, this.listenSocketBound.bind ( this ) ) ;
};
/**
 * Description
 * @method listenSocketBound
 * @return 
 */
WebSocketEventProxy.prototype.listenSocketBound = function()
{
	Log.info ( "WebSocketEventProxy bound to port=" + this.port ) ;
};
WebSocketEventProxy.prototype.shutdown = function()
{
	if ( ! this.server ) return ;
	this.server.socket.close() ;
	this.server = null ;
};
/**
 * Internal class
 * @constructor
 */
var Conn = function ( proxy, socket )
{
	this.socket                   = socket ;
	this.sid                      = socket.key ;
	this.proxy                    = proxy ;
	this.proxy._sockets[this.sid] = this ;
	this.client                   = null ;
	this._locks                   = {} ;
	this._semaphores              = {} ;
};
Conn.prototype.toString = function()
{
  return "(Conn)[sid=" + this.sid +  "\n" + util.inspect ( this._locks  ) + "]" ;
};
Conn.prototype.getClient = function()
{
	if ( this.client )
	{
		return this.client ;
	}
	this.client = new Client() ;
	return this.client ;
};
Conn.prototype.send = function ( what )
{
	if ( what instanceof Event )
	{
		this.socket.sendText ( what.serialize() ) ;
		return ;
	}
	if ( typeof what === 'string' )
	{
		this.socket.sendText ( what ) ;
	}
};
Conn.prototype.remove = function()
{
	var eventNamesToBeRemoved = [] ;
	this.socket.removeAllListeners ( "text" ) ;
	this.socket.removeAllListeners ( "error" ) ;
	this.socket.removeAllListeners ( "close" ) ;

	var currentKeys = this.proxy._eventNameToSocketContext.getKeys() ;
	this.proxy._eventNameToSocketContext.remove ( this ) ;
	for ( i = 0 ; i < currentKeys.length ; i++ )
	{
		if ( ! this.proxy._eventNameToSocketContext.get ( currentKeys[i] ) )
		{
			eventNamesToBeRemoved.push ( currentKeys[i] ) ;
		}
	}
	delete this.proxy._sockets[this.sid] ;

	if ( eventNamesToBeRemoved.length && this.proxy.client )
	{
		this.proxy.client.removeEventListener ( eventNamesToBeRemoved ) ;
	}
	this.flush() ;
};
Conn.prototype.flush = function ()
{
	this.socket = null ;
	this.sid    = null ;
	this.proxy  = null ;
	if ( this.client )
	{
		try
		{
			this.client.end() ;
		}
		catch ( exc )
		{
		}
		this.client = null ;
	}
	this._locks      = {} ;
	this._semaphores = {} ;
};
Conn.prototype._lockResourceRequest = function ( e )
{
	var thiz = this ;
	var resourceId = e.body.resourceId  ;
	if ( ! resourceId ) return ;
	if ( this._locks[resourceId] )
	{
		return
	}
	var lock = new Lock ( resourceId, this.getClient() ) ;
	this._locks[resourceId] = lock ;
  lock.acquire ( function ( err )
  {
    e.setType ( "lockResourceResult" ) ;
  	if ( err )
  	{
  		e.body.isLockOwner = false ;
  	}
  	else
  	{
	  	e.body.isLockOwner = this.isOwner() ;
  	}
  	if ( ! e.body.isLockOwner )
  	{
			delete thiz._locks[resourceId] ;
  	}
  	thiz.send ( e ) ;
  } ) ;
};
Conn.prototype._unlockResourceRequest = function ( e )
{
	var thiz = this ;
	var resourceId = e.body.resourceId  ;
	if ( ! resourceId ) return ;
	var lock = this._locks[resourceId] ;
	if ( ! lock )
	{
		return
	}
	delete this._locks[resourceId] ;
  lock.release() ;
  if ( ! this.client.holdsLocksOrSemaphores() )
  {
		try
		{
			this.client.end() ;
		}
		catch ( exc )
		{
		}
		this.client = null ;
  }
};
Conn.prototype._acquireSemaphoreRequest = function ( e )
{
	var thiz = this ;
	var resourceId = e.body.resourceId  ;
	if ( ! resourceId ) return ;
	if ( this._semaphores[resourceId] )
	{
		return
	}
	var sem = new Semaphore ( resourceId, this.getClient() ) ;
	this._semaphores[resourceId] = sem ;
  sem.acquire ( function ( err )
  {
    e.setType ( "acquireSemaphoreResult" ) ;
  	if ( err )
  	{
  		e.body.isSemaphoreOwner = false ;
  	}
  	else
  	{
	  	e.body.isSemaphoreOwner = this.isOwner() ;
  	}
  	thiz.send ( e ) ;
  } ) ;
};
Conn.prototype._releaseSemaphoreRequest = function ( e )
{
	var thiz = this ;
	var resourceId = e.body.resourceId  ;
	if ( ! resourceId ) return ;
	var sem = this._semaphores[resourceId] ;
	if ( ! sem )
	{
		return
	}
	delete this._semaphores[resourceId] ;
  sem.release() ;
  if ( ! this.client.holdsLocksOrSemaphores() )
  {
		try
		{
			this.client.end() ;
		}
		catch ( exc )
		{
		}
		this.client = null ;
  }
};

module.exports = WebSocketEventProxy ;

if ( require.main === module )
{
	var ep = new WebSocketEventProxy() ;
	var WEBSOCKET_PORT = T.getProperty ( "gepard.websocket.port", 17502 ) ;
	ep.listen ( WEBSOCKET_PORT ) ;
}


