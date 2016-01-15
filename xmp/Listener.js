#!/usr/bin/env node

if ( require.main === module )
{
	var gepard = require ( "gepard" ) ;

	if ( gepard.getProperty ( "help" ) )
	{
		console.log (
			"Gepard Examples: Listener, listen to a given event.\n"
		+ "Usage: node Listener [Options]\n"
		+ "Options: -Dname=<event-name>, default <event-name>=ALARM,BLARM\n"
		) ;
		process.exit() ;
	}

	new gepard.Admin().isRunning ( function admin_is_running ( state )
	{
		if ( ! state )
		{
			console.log ( "Not running on " + this.getHostPort() ) ;
			process.exit ( 1 ) ;
		}
		execute() ;
	});
	function execute()
	{
		var name = gepard.getProperty ( "name" ) ;
		if ( ! name )
		{
			name = "ALARM,BLARM" ;
		}
		name = name.split ( ',' ) ;
		var c = gepard.getClient() ;
		c.setReconnect ( true ) ; // Reconnection requested
		var tracePoint = c.registerTracePoint ( "BLARM_REMOVED" ) ;
		c.on ( "reconnect", function on_reconnect ( e )
		{
			console.log ( "reconnect/" + e.body.eventNameList ) ;
		});
		console.log ( "Listen for events with name=" + name ) ;
		var func = function(e)
		{
			if ( e.getName() === "BLARM" )
			{
				this.remove ( "BLARM" ) ;
				tracePoint.log ( "BLARM is removed." ) ;
			}
			console.log ( e ) ;
		};
		c.on ( name, func ) ;

		c.on('end', function()
		{
			console.log('socket disconnected');
		});
		c.on('shutdown', function()
		{
			console.log('broker shut down');
			this.setReconnect ( false ) ;
		});
		c.on('disconnect', function()
		{
			console.log('disconnect: connection closed because heart-beat is missing' );
		});
		c.on('reconnect', function()
		{
			console.log('reconnect: connection re-established');
		});
		// c.onActionInfo ( function ( cl, info )
		// {
		// 	info.add ( "kill", "Shut down this client." ) ;
		// });
		c.onAction ( "kill", function ( cl, cmd )
		{
			cmd.setResult ( "done") ;
			cl.end() ;
		});
		c.onAction ( "rmname", function ( cl, cmd )
		{
			cmd.setResult ( "done") ;
			cl.remove ( name ) ;
		});
		c.onAction ( "rmfunc", function ( cl, cmd )
		{
			cmd.setResult ( "done") ;
			cl.remove ( func ) ;
		});
	}
}
