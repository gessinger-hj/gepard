#!/usr/bin/env node

var net    = require('net');
var gepard = require ( "gepard" ) ;

/**
 * @constructor
 *
 * @class      Admin tool for Gepard
 * @method     Admin
 * @param      {}    port    { description }
 * @param      {}    host    { description }
 */
var Admin = function ( port, host )
{
	this.port = port ;
	this.host = host ;
	if ( ! this.port )
	{
		var hp = this.host = gepard.getProperty ( "gepard" ) ;
		if ( hp )
		{
			if ( ! isNaN ( parseInt ( hp ) ) )
			{
				this.port = parseInt ( hp ) ;
			}
			else
			if ( hp.indexOf ( ":" ) > 0 )
			{
				this.host = hp.substring ( 0, hp.indexOf ( ":" ) ) ;
				this.port = parseInt ( hp.substring ( hp.indexOf ( ":" ) + 1 ) ) ;
			}
		}
	}
	if ( ! this.port ) this.port = gepard.getProperty ( "gepard.port" ) ;
	if ( ! this.host ) this.host = gepard.getProperty ( "gepard.host" ) ;
	if ( ! this.port ) this.port = 17501 ;
};
/**
 * method getPort
 * @return port
 */
Admin.prototype.getPort = function()
{
	return this.port ;
};
/**
 * method getHost
 * @return host
 */
Admin.prototype.getHost = function()
{
	return this.host ? this.host : "localhost" ;
};
/**
 * method getHostPort
 * @return host
 */
Admin.prototype.getHostPort = function()
{
	return this.getHost() + ":" + this.getPort() ;
};
/**
 * Shutdown Broker
 * @param {} what
 * @return 
 */
Admin.prototype.shutdown = function ( what )
{
	this._execute ( "shutdown", what ) ;
};
Admin.prototype.tracePoint = function ( what )
{
	this._execute ( "tracePoint", what ) ;
};
Admin.prototype.setSystemParameter = function ( what )
{
	this._execute ( "setSystemParameter", what ) ;
};
 /**
  * Display an info from GPBroker
  *
  * @method     info
  * @param      {<type>}    what      { description }
  * @param      {Function}  callback  { description }
  */
Admin.prototype.info = function ( what, callback )
{
	this._execute ( "info", what, callback ) ;
};
/**
 * Check if is running
 *
 * @method     isRunning
 * @param      {Function}  callback  { description }
 */
Admin.prototype.isRunning = function ( callback )
{
	var thiz = this ;
	try
	{
		this.socket = net.connect ( { port: this.port, host: this.host } ) ;
		this.socket.on ( 'error', function socket_on_error( data )
		{
			callback.call ( thiz, false ) ;
		});
		this.socket.on ( "connect", function()
		{
			callback.call ( thiz, true ) ;
			thiz.socket.end() ;
		});
	}
	catch ( exc )
	{
	}
};
/**
 * execute command in client
 *
 * @method     _execute
 * @param      {String}    action    { description }
 * @param      {String}    what      { description }
 * @param      {Function}  callback  { description }
 */
Admin.prototype._execute = function ( action, what, callback )
{
	var thiz = this ;
	try
	{
		this.socket = net.connect ( { port: this.port, host: this.host } ) ;
	}
	catch ( exc )
	{
    console.log ( "Not running on " + this.getHostPort() ) ;
		return ;
	}
	if ( action === "shutdown" )
	{
		this.socket.on ( "connect", function()
		{
		  var e = new gepard.Event ( "system", "shutdown" ) ;
  		var channel = gepard.getProperty ( "channel" ) ;
  		if ( channel )
  		{
		  	e.body.shutdown_channel = channel ;
  		}
		  if ( what )
		  {
		  	e.body.shutdown_sid = what ;
		  }
		  this.write ( e.serialize() ) ;
		  if ( ! what )
		  {
		  	return ;
		  }
		});
		// return ;
	}
	else
	if ( action === "tracePoint" )
	{
		this.socket.on ( "connect", function()
		{
		  var e = new gepard.Event ( "system", "tracePoint" ) ;
		  e.body.tracePointActionList = what ;
		  this.write ( e.serialize() ) ;
		});
	}
	else
	if ( action === "setSystemParameter" )
	{
		this.socket.on ( "connect", function()
		{
		  var e = new gepard.Event ( "system", "setSystemParameter" ) ;
		  e.body.systemParameter = what ;
		  this.write ( e.serialize() ) ;
		});
	}
	else
	{
		this.socket.on ( "connect", function()
		{
		  var e = new gepard.Event ( "system", "getInfoRequest" ) ;
		  e.body.info_type = what ;
		  this.write ( e.serialize() ) ;
		});
	}
	this.socket.on ( 'error', function socket_on_error( data )
	{
		if ( action === "info" )
		{
			if ( what === "conn" )
			{
   			if ( callback )
  			{
  				callback.call ( null, null ) ;
  				return ;
  			}
			}
		}
    console.log ( "Not running on " + thiz.getHostPort() ) ;
		// gepard.lwhere (  ) ;
		// gepard.log ( data ) ;
	});
	this.socket.on ( 'end', function socket_on_end( data )
	{
		// gepard.lwhere (  ) ;
	});
	this.socket.on ( 'data', function ondata ( data )
	{
		var list, i, desc, str, app, l ;
    var mm = data.toString() ;
    if ( ! this.partialMessage ) this.partialMessage = "" ;
    mm = this.partialMessage + mm ;
    this.partialMessage = "" ;
    var result = gepard.splitJSONObjects ( mm ) ;
    var messageList = result.list ;
    var i, j, k ;
    var ctx, uid, rcb, e, callbackList ;
    for ( j = 0 ; j < messageList.length ; j++ )
    {
      if ( this.stopImediately )
      {
        return ;
      }
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
		    var e = gepard.Event.prototype.deserialize ( m ) ;
		    if ( e.getType() === "getInfoResult" )
		    {
		    	if ( what === "conn" )
		    	{
		    		list = e.body.connectionList ;
	    			if ( callback )
	    			{
	    				callback.call ( null, list ) ;
	    				return ;
	    			}
		    		if ( ! list || ! list.length )
		    		{
			    		console.log ( "No Connections" ) ;
		    		}
		    		else
		    		{
			    		for ( i = 0 ; i < list.length ; i++ )
			    		{
			    			desc = list[i] ;
			    			str = desc.application ;
			    			console.log ( "%s\t%s:%s", desc.sid, desc.hostname, desc.applicationName ) ;
		    			}
			    	}
		    	}
		    	else
		    	if ( what === "lock" )
		    	{
		    		list = e.body.lockList ;
	    			if ( callback )
	    			{
	    				callback.call ( null, list ) ;
	    				this.end() ;
	    				return ;
	    			}
		    		if ( ! list || ! list.length )
		    		{
		    			console.log ( "No locks" ) ;
		    		}
		    		else
		    		{
			    		for ( i = 0 ; i < list.length ; i++ )
			    		{
			    			desc = list[i] ;
			    			str = desc.owner.application ;
			    			console.log ( "%s\t%s\t%s:%s", desc.resourceId, desc.owner.sid, desc.owner.hostname, desc.owner.applicationName ) ;
			    		}
		    		}
		    	}
		    	else
		    	if ( what === "sem" )
		    	{
		    		list = e.body.semaphoreList ;
	    			if ( callback )
	    			{
	    				callback.call ( null, list ) ;
	    				this.end() ;
	    				return ;
	    			}
		    		if ( ! list || ! list.length )
		    		{
		    			console.log ( "No semaphores" ) ;
		    		}
		    		else
		    		{
			    		for ( i = 0 ; i < list.length ; i++ )
			    		{
			    			desc = list[i] ;
			    			str = desc.owner.application ;
			    			console.log ( "%s\t%s\t%s:%s", desc.resourceId, desc.owner.sid, desc.owner.hostname, desc.owner.applicationName ) ;
			    		}
		    		}
		    	}
		    	else
		    	if ( what === "events" )
		    	{
		    		var mapping = e.body.mapping ;
		    		var pattern = e.body.currentEventPattern ;
	    			if ( callback )
	    			{
	    				callback.call ( null, mapping ) ;
	    				this.end() ;
	    				return ;
	    			}
		    		if ( ! mapping )
		    		{
		    			console.log ( "No event listener" ) ;
		    		}
		    		else
		    		{
		    			for ( var eventName in mapping )
		    			{
		    				var l = mapping[eventName] ;
			    			console.log ( "%s\t%s", eventName, l ) ;
		    			}
		    		}
		    	}
		    	else
		    	{
		    		if ( e.isBad() ) gepard.log ( e.getStatus() ) ;
		    		else             gepard.log ( e.getBody() ) ;
		    	}
		    }
		    else
		    {
		    	if ( e.isBad() ) gepard.log ( e.getStatus() ) ;
	    		else             gepard.log ( e.getBody() ) ;
		    }
		  }
		}
	  this.end();
	});
};
Admin.prototype.getInfoForApplication = function ( applicationName, callback )
{
	this.info ( "conn", function lsconn ( list )
	{
		var al = [] ;
		if ( ! list || ! list.length ) return al ;
		for ( var i = 0 ; i < list.length ; i++ )
		{
			if ( list[i].applicationName === applicationName )
			{
				al.push ( list[i] ) ;
			}
		}
		callback.call ( null, al ) ;
	});
};
Admin.prototype.getNumberOfApplications = function ( applicationName, callback )
{
	var thiz = this ;
	this.info ( "conn", function lsconn ( list )
	{
		var n = 0 ;
		if ( ! list )
		{
			callback.call ( null, -1 ) ;
		  thiz.socket.end() ;
			return ;
		}
		if ( ! list.length )
		{
			callback.call ( null, 0 ) ;
		  thiz.socket.end() ;
			return ;
		}
		for ( var i = 0 ; i < list.length ; i++ )
		{
			if ( list[i].applicationName === applicationName )
			{
				n++ ;
			}
		}
		callback.call ( null, n ) ;
	  thiz.socket.end() ;
	});
};
Admin.prototype.client = function ( p )
{
	var i ;
	var name   = "client/info" ;
	var parameter = {} ;
	
	if ( p.info )
	{
		name = "client/info/" + p.info + "/" ;
	}
	else
	if ( p.action )
	{
		name = "client/action/" + p.action + "/" ;
		if ( ! p.value ) p.value = "" ;
		if ( p.value ) p.value = p.value.trim() ;
		if ( p.action === "tp" && p.value.charAt ( 0 ) === '[' && p.value.charAt ( p.value.length - 1 ) === ']' )
		{
			parameter.actionName = "tp" ;
			parameter.output     = p.output ;
			parameter.system     = p.system ;
			parameter.points     = JSON.parse ( p.value )
// gp.client.tp '[{"name":"BLARM_REMOVED","state":"on"},{"name":"EVENT_IN","state":"on"}]' --system=true|false --output=remote --sid=::ffff:127.0.0.1_30551_1449856585669
		}
		else
		if ( p.action.startsWith ( "tp" ) )
		{
			parameter.actionName = "tp" ;
			parameter.output     = p.output ;
			parameter.system     = p.system ;
			if ( ! p.value ) p.value = "*" ;
			var what = "toggle"
			if ( p.action === "tpon" ) what = "on" ;
			if ( p.action === "tpoff" ) what = "off" ;
			if ( p.action === "tp" ) what = "toggle" ;
			var l = p.value.split(',') ;
			parameter.points = [] ;
			for ( i = 0 ; i < l.length ; i++ )
			{
				parameter.points.push ( { "name": l[i], state: what } ) ;
			}
		}
		else
		{
			parameter.actionName = p.action ;
			parameter.cmd = gepard.getProperty ( "cmd" ) ;
			if ( p.action !== "info" && ! parameter.cmd )
			{
				console.log ( "Missing --cmd=<cmd-name> option for execute." ) ;
				return ;
			}
			if ( ! p.args ) p.args = "" ;
			if ( p.args.charAt ( 0 ) === '{' && p.args.charAt ( p.args.length - 1 ) === '}' )
			{
				parameter.args = JSON.parse ( p.args ) ;
			}
			else
			{
				parameter.args = { text: p.args } ;
			}
		}
	}
	else
	{
		name = "client/info/" ;
	}
// console.log ( "name=" + name ) ;
	var util = require ( "util" ) ;
	var c = gepard.getClient ( this.port, this.host ) ;
	c.setReconnect ( false ) ;
  var n = 0 ;

  var sid = gepard.getProperty ( "sid" ) ;
  var channel = gepard.getProperty ( "channel" ) ;
  parameter.name = name ;
  parameter.sid = sid ;
  parameter.channel = channel ;
  c.systemInfo ( function ( e )
  {
    if ( e.isBad() )
    {
      console.log ( e.getStatus() ) ;
  		this.end() ;
      return ;
    }
    var inst = e.control.clone ;
    n++ ;
    if ( e.body.info )
    {
      console.log ( util.inspect(e.body.info,{depth:null}) ) ;
    }
    else
    {
      console.log ( inst ) ;
    }
    if ( n === inst.of )
    {
      this.end() ;
  	}
  }, parameter );
};
Admin.prototype.main = function()
{
	var what = gepard.getProperty ( "help" ) ;
	if ( what )
	{
		console.log ( "Admin tool for Gepard" ) ;
		console.log ( "Usage: gp.info [Options] [Gepard-options]" ) ;
		console.log ( "Options are:" ) ;
		console.log ( "  --help \t display this text" ) ;
		console.log ( "  --info \t display all available information from the broker" ) ;
		console.log ( "  --conn   \t list all connections" ) ;
		console.log ( "  --lock   \t list all locks" ) ;
		console.log ( "  --sem    \t list all semaphores" ) ;
		console.log ( "  --events \t list all event-names listened to" ) ;
		console.log ( "  --shutdown[=<connectin-id>]" ) ;
		console.log ( "      without <connection-id>: send a shutdown event" ) ;
		console.log ( "        to all clients and shutdown the broker." ) ;
		console.log ( "      with <connection-id>: send a shutdown event" ) ;
		console.log ( "        to the specified client and close the connection." ) ;
		console.log ( "      <connection-id> is an applicationName or an sid shown with --info" ) ;
		console.log ( "  --client \tdisplay various information collected from each client" ) ;
		console.log ( "    Optional:" ) ;
		console.log ( "    --sid=<connection-id>" ) ;
		console.log ( "    		use only connection-id (sid) of interest" ) ;
		console.log ( "    --info=env|where" ) ;
		console.log ( "      env \tdisplay remote environment variables." ) ;
		console.log ( "      where \tdisplay stacktraces. Aplicable only for Java clients." ) ;
		console.log ( "The form -D<name>[=<value> or --<name>[=<value>] are aquivalent." ) ;
		console.log ( "Gepard-options are:" ) ;
		console.log ( "  --gepard.port=<port> \t tcp connection port, default=17501" ) ;
		console.log ( "      default is environment variable GEPARD_PORT or 17501" ) ;
		console.log ( "  --gepard.host=<host> \t tcp connection host, default=localhost" ) ;
		console.log ( "      default is environment variable GEPARD_HOST or localhost" ) ;
		return ;
	}
	var i ;
	what = gepard.getProperty ( "shutdown" ) ;
	if ( what )
	{
		if ( what === "true" ) what = null ;
		this.shutdown ( what ) ;
		return ;
	}
	what = gepard.getProperty ( "run" ) ;
	if ( what  )
	{
		if ( what === "true" )
		{
			console.log ( "Missing application name for -Drun=<" ) ;
			return ;
		}
		this.getNumberOfApplications ( what, function getNumberOfApplications ( n )
		{
console.log ( "n=" + n ) ;
		} ) ;
// 		this.getInfoForApplication ( what, function getInfoForApplication ( list )
// 		{
// console.log ( list ) ;
// 		} ) ;
		return ;
	}
	what = gepard.getProperty ( "isRunning" ) ;
	if ( what  )
	{
		this.isRunning ( function admin_is_running ( state )
		{
			if ( state )
			{
				process.exit  ( 0 ) ;
				return ;
			}
			process.exit  ( 1 ) ;
			return ;
		});
		return ;
	}
	var cmds  = [ "conn", "lock", "sem", "events" ] ;
	for ( i = 0 ; i < cmds.length ; i++ )
	{
		if ( gepard.getProperty ( cmds[i] ) )
		{
			this.info ( cmds[i] ) ;
			return ;
		}
	}
	if ( gepard.getProperty ( "client" ) )
	{
		var info   = gepard.getProperty ( "info" ) ;
		var action = gepard.getProperty ( "action" ) ;
		var value  = gepard.getProperty ( "value" ) ;
		var channel  = gepard.getProperty ( "channel" ) ;
		if ( value && value.startsWith ( "--" ) )
		{
			value = "" ;
		}
		this.client ( { info:info
									, action:action
									, value:value
									, args: gepard.getProperty ( "args" )
									, output: gepard.getProperty ( "output" )
									, system: gepard.getProperty ( "system" )
									} ) ;
		return ;
	}
	what = gepard.getProperty ( "tp" ) ;
	if ( what )
	{
		if ( what === '*' || what === "true" )
		{
			what = '{"points":[{"name":"*","state":"toggle"}]}' ;
		}

		what = JSON.parse ( what ) ;
		this.tracePoint ( what ) ;
		return ;
	}
	what = gepard.getProperty ( "tpon" ) ;
	if ( what )
	{
		if ( what === '*' || what === "true" )
		{
			what = '*' ;
		}
		var l = what.split(',') ;
		var a = [] ;
		what = { "points":a } ;
		for ( i = 0 ; i < l.length ; i++ )
		{
			a.push ( { "name": l[i], state:"on", "system":gepard.getProperty ( "system" ) } ) ;
		}
		this.tracePoint ( what ) ;
		return ;
	}
	what = gepard.getProperty ( "tpoff" ) ;
	if ( what )
	{
		if ( what === '*' || what === "true" )
		{
			what = '*' ;
		}
		var l = what.split(',') ;
		var a = [] ;
		what = { "points":a } ;
		for ( i = 0 ; i < l.length ; i++ )
		{
			a.push ( { "name": l[i]
							 , state:"off"
							 , system:gepard.getProperty ( "system" )
							 }
						 ) ;
		}
		this.tracePoint ( what ) ;
		return ;
	}
	what = gepard.getProperty ( "tplist" ) ;
	if ( what )
	{
		what = { "list": [] } ;
		this.tracePoint ( what ) ;
		return ;
	}
	what = parseInt ( gepard.getProperty ( "hbm" ) ) ;
	if ( ! isNaN ( what ) )
	{
		if ( what < 0 )
		{
			what = 1000 ;
		}
		else
		if ( what < 1000 )
		{
			what = what * 1000 ;
		}
		this.setSystemParameter ( { _heartbeatIntervalMillis: what } ) ;
		return ;
	}
	what = gepard.getProperty ( "info", "true" ) ;

	if ( what )
	{
		if ( what !== "true" )
		{
			this.info ( what ) ;
		}
		else
		{
			this.info() ;
		}
		return ;
	}
	return ;
};
Admin.prototype.lookup = function()
{
	var zc = gepard.getProperty ( "gepard.zeroconf.type" ) ;
	if ( ! zc )
	{
		console.log ( "lookup: Missing option --gepard.zeroconf.type=<>" ) ;
		return ;
	}
  gepard.findService ( { type:zc, timeout:5000 }, function client_findService ( srv )
  {
    try
    {
      console.log ( srv.host + ":" + srv.port ) ;
    }
    catch ( exc )
    {
      console.log ( exc ) ;
    }
  } ) ;
};
module.exports = Admin ;
if ( require.main === module )
{
	var ad = new Admin() ;
	ad.main() ;
}
