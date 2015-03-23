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
	var n = 0 ;
	function execute()
	{
		var name = "getFileList" ;
		var c = new Client() ;
		console.log ( "Listen for requests with name=" + name ) ;
		var fileList = [ "a.js", "b.js", "c.js" ] ;
		c.on ( name, function(e)
		{
			n++ ;
			if ( n >= 2 )
			{
				var inter = setInterval ( function intervalFunction()
				{
					console.log ( "Request in" ) ;
					console.log ( "DELAYED File list out:" ) ;
					console.log ( fileList ) ;
					e.body.file_list = fileList ;
					e.sendBack() ;
					clearInterval ( inter ) ;
				}
				, 5000 ) ;
				return ;
			}
			console.log ( "Request in" ) ;
			console.log ( "File list out:" ) ;
			console.log ( fileList ) ;
			e.body.file_list = fileList ;
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
