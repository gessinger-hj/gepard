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
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM\n"
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

  var name = "getFileList" ;

  var c = new Client() ;

  c.request ( name,
  {
    result: function ( e )
    {
      if ( e.isBad() )
      {
        console.log ( e ) ;
      }
      else
      {
        console.log ( e.getBody().file_list ) ;
      }
      this.end() ;
    }
  });
}
