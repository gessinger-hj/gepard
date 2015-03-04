#!/usr/bin/env node

if ( require.main === module )
{
	var T      = require ( "../src/Tango" ) ;
	var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;

	if ( T.getProperty ( "help" ) )
	{
		console.log (
		  "Gepard Examples: Responder, respond to a request to a given event.\n"
		+ "Usage: node Responder [Options]\n"
		+ "Options: -Dname=<event-name>, default <event-name>=ALARM\n"
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
		var name = "getFileList" ;
		var c = new Client() ;
		console.log ( "Listen for requests with name=" + name ) ;
		c.on ( name, function(e)
		{
      var fileList = [ "a.js", "b.js", "c.js" ] ;
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
