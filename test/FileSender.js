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
      "Gepard Examples: FileSender, send a file and get an ack.\n"
    + "Usage: node FileSender.js --file=<file>\n"
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
   	var name = "__FILE__" ;
   	var c = new Client() ;
    var event = new Event ( "__FILE__" ) ;
    var fileName = T.getProperty ( "file", "FileSender.js" ) ;
    var fr = new FileReference ( fileName ) ;
    event.putValue ( "FR", fr ) ;
    c.request ( event, function ( e )
    {
      if ( e.isBad() )
      {
        console.log ( e ) ;
      }
			this.end() ;
    }) ;
  });
}
