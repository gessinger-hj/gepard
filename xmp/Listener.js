#!/usr/bin/env node

if ( require.main === module )
{
	var T      = require ( "../src/Tango" ) ;
	var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;

	if ( T.getProperty ( "help" ) )
	{
		console.log (
		  "Gepard Examples: Listener, listen to a given event.\n"
		+ "Usage: node Listener [-Dname=<event-name>], default <event-name>=ALARM"
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
  });


	var name = T.getProperty ( "name", "ALARM" ) ;
	var c = new Client() ;
	console.log ( "Listen for events with name=" + name ) ;
	c.on ( name, function(e)
	{
	  console.log ( e ) ;
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
