#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;
  var FileReference  = require ( "../src/FileReference" ) ;

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
 		var nCalls = T.getInt ( "n", 10 ) ;
		if ( nCalls < 1 )
		{
			console.log ( "invalidn=" + n ) ;
			return ;
		}
   	var name = "mass-test" ;
   	var c = new Client() ;
		var m = nCalls ;
		var T0 = new Date().getTime() ;
    c.emit ( "mass-test-start" )
    // var event = new Event ( name ) ;
    var fr = new FileReference ( "xxx.txt" ) ;
    // event.putValue ( "FR", fr ) ;

    for ( var n = nCalls ; n > 0 ; n-- )
    {
      var event = new Event ( name ) ;
      event.putValue ( "FR", fr ) ;
      c.request ( event, function ( e )
      {
        m-- ;
        if ( m < 1 )
        {
          var T1 = new Date().getTime() ;
          var millis = T1 - T0 ;
          var millisPerCall = millis / nCalls ;
          console.log ( "millis=" + millis ) ;
          console.log ( "millisPerCall=" + millisPerCall ) ;
          c.emit ( "mass-test-end", { write: function(p){ c.end(); }} )
          console.log ( c._stats ) ;
					// this.end() ;
				}
      }) ;
    }
  });
}
