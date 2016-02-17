#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: RequesterMassTest, do a statistic for performance analysation.\n"
    + "Usage: node RequesterMassTest.js [-n=<number-of-calls>, -b=<number-of-bytes>], default: 10\n"
    ) ;
    process.exit() ;
  }

  new gepard.Admin().isRunning ( function admin_is_running ( state )
  {
    if ( ! state )
    {
      console.log ( "Not running on " + this.getHostPort() ) ;
			process.exit() ;
    }
    var nb = gepard.getInt ( "b", 0 ) ;
 		var n = gepard.getInt ( "n", 10 ) ;
		if ( n < 1 )
		{
			console.log ( "invalid n=" + n ) ;
			return ;
		}
   	var name = "mass-test" ;
   	var c = new gepard.Client() ;
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
    var count = 0 ;
    for ( i = n ; i > 0 ; i-- )
    {
      var event = new gepard.Event ( name ) ;
      event.control.sequenceNumber = i ;
      if ( txt )
      {
        event.putValue ( "TEXT", txt ) ;
      }
      c.request ( event, function ( e )
      {
        count++ ;
// console.log ( "count=" + count ) ;
// console.log ( "m=" + m ) ;
        m-- ;
        if ( e.control.sequenceNumber <= 1 )
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
