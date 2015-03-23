#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;
  var Lock   = require ( "../src/Lock" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard example: Lock, lock a given resource.\n"
    + "Usage: node Lock [-Dname=<resource-name>], default <resource-name>=user:4711"
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
    var key = T.getProperty ( "name", "user:4711" ) ;
    var auto = T.getProperty ( "auto" ) ;
    var lock = new Lock ( key ) ;
    lock.acquire ( function ( err )
    {
      console.log ( "" + this.toString() ) ;
      if ( auto )
      {
        this.release() ;
      }
    } ) ;
  }
}
