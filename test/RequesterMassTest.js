#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Requester, request a result for the message with name 'getFileList'.\n"
    + "Usage: node Requester\n"
    ) ;
    process.exit() ;
  }

  new Admin().isRunning ( function admin_is_running ( state )
  {
    if ( ! state )
    {
      console.log ( "Not running on " + this.getHostPort() ) ;
			process.exit() ;
    }
 		var nCalls = T.getInt ( "nCalls", 10 ) ;
		if ( nCalls < 1 )
		{
			console.log ( "invalidn=" + n ) ;
			return ;
		}
   	var name = "mass-test" ;
   	var c = new Client() ;
		var m = nCalls ;
		var T0 = new Date().getTime() ;
		for ( var n = nCalls ; n >= 0 ; n-- )
		{
    	c.request ( name, function ( e )
    	{
				m-- ;
				if ( m <= 1 )
				{
					var T1 = new Date().getTime() ;
					var millis = T1 - T0 ;
					var millisPerCall = millis / nCalls ;
					console.log ( "millis=" + millis ) ;
					console.log ( "millisPerCall=" + millisPerCall ) ;
					this.end() ;
				}
      }) ;
    }
  });
}
