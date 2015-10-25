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
      "Gepard Examples: RequesterMassTest, do a statistic for performance analysation.\n"
    + "Usage: node RequesterMassTest.js [-n=<number-of-calls>, -b=<number-of-bytes>], default: 10\n"
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
    var nb = T.getInt ( "b", 0 ) ;
 		var n = T.getInt ( "n", 10 ) ;
		if ( n < 1 )
		{
			console.log ( "invalid n=" + n ) ;
			return ;
		}
   	var name = "mass-test" ;
   	var c = new Client() ;
		var m = n ;
    c.emit ( "mass-test-start" )
    var txt = "" ;
    var i ;
    if ( nb > 0 )
    {
      for ( i = nb ; i > 0 ; i-- )
      {
        txt += "A" ;
      }
    }
		var T0 = new Date().getTime() ;
    for ( i = n ; i > 0 ; i-- )
    {
      var event = new Event ( name ) ;
      if ( txt )
      {
        event.putValue ( "TEXT", txt ) ;
      }
      c.request ( event, function ( e )
      {
        m-- ;
        if ( m < 1 )
        {
          var T1 = new Date().getTime() ;
          var millis = T1 - T0 ;
          var millisPerCall = millis / n ;
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
