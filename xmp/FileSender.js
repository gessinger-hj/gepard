#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: FileSender, send a file and get an ack.\n"
    + "Usage: node FileSender.js [--file=<file>], default: FileSender.js\n"
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
   	var client = gepard.getClient() ;
    var event = new gepard.Event ( "__FILE__" ) ;
    var file = gepard.getProperty ( "file", "FileSender.js" ) ;
    event.putValue ( "DATA", new gepard.FileContainer ( file ) ) ;
    client.request ( event, function ( e )
    {
      if ( e.isBad() )
      {
        console.log ( e ) ;
      }
      else
      {
        console.log ( "File " + file + " sent successfully." )
        console.log ( e.getStatus() ) ;
      }
			this.end() ;
    }) ;
  });
}
