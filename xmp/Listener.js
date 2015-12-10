#!/usr/bin/env node

if ( require.main === module )
{
	var gepard = require ( "gepard" ) ;

	if ( gepard.getProperty ( "help" ) )
	{
		console.log (
			"Gepard Examples: Listener, listen to a given event.\n"
		+ "Usage: node Listener [Options]\n"
		+ "Options: -Dname=<event-name>, default <event-name>=ALARM\n"
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
		var name = [ "ALARM", "BLARM" ] ;
		var c = gepard.getClient() ;
		c.setReconnect ( true ) ; // Reconnection requested
		var tp = c.registerTracePoint ( "BLARM_REMOVED" ) ;
		c.on ( "reconnect", function on_reconnect ( e )
		{
			console.log ( "reconnect/" + e.body.eventNameList ) ;
		});
		console.log ( "Listen for events with name=" + name ) ;
		c.on ( name, function(e)
		{
			if ( e.getName() === "BLARM" )
			{
				this.remove ( "BLARM" ) ;
				tp.log ( "BLARM is removed." ) ;
			}
			console.log ( e ) ;
		});
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
			console.log('disconnect');
		});
		c.on('reconnect', function()
		{
			console.log('reconnect');
		});
		c.onActionInfo ( function ( parameter, info )
		{
			info.add ( "kill", "Shut down this client." ) ;
		});
		c.onActionCmd ( function ( parameter, cmd )
		{
			cmd.setResult ( "I don't " + cmd.cmd + "!!")
		});
	}
}
