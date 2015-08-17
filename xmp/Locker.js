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
    + "Usage: node Lock [-Dname=<resource-name>], default <resource-name>=resid:main"
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
    var key = T.getProperty ( "name", "resid:main" ) ;
    var lock = new Lock ( key ) ;
    lock.acquire ( function ( err )
    {
      console.log ( "" + this.toString() ) ;
      if ( lock.isOwner() )
      {
        console.log ( "Sleep for 10 seconds" ) ;
        setInterval ( function sleep ()
        {
          lock.release() ;
          console.log ( "Lock released." ) ;
          process.exit() ;
        }, 10000 ) ;
      }
    } ) ;
  }
}
