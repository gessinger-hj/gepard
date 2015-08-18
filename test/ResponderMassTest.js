#!/usr/bin/env node

if ( require.main === module )
{
	var T			= require ( "../src/Tango" ) ;
	var Client = require ( "../src/Client" ) ;
	var Admin	= require ( "../src/Admin" ) ;

	if ( T.getProperty ( "help" ) )
	{
		console.log (
			"Gepard Examples: Responder, respond to a request to with the name 'getFileList'.\n"
		+ "Usage: node Responder\n"
		) ;
		process.exit() ;
	}

	new Admin().isRunning ( function admin_is_running ( state )
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
		var n = 0 ;
		var c = new Client() ;
		c.on ( "mass-test-start", function(e)
		{
			n = 0 ;
			console.log ( "mass test start" ) ;
		});
		c.on ( "mass-test-end", function(e)
		{
			console.log ( "mass test end" ) ;
			console.log ( "n=" + n ) ;
		});
		c.on ( "mass-test", function(e)
		{
			n++ ;
			e.sendBack() ;
		});
		c.on('end', function()
		{
			console.log('socket disconnected');
		});
		c.on('shutdown', function()
		{
			console.log('broker shut down');
		});
	}
}
