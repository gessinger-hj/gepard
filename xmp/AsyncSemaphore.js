#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;
  var Semaphore   = require ( "../src/Semaphore" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard example: Semaphore, acquire a given semaphore.\n"
    + "Usage: node Semaphore [options]\n"
    + "  Options are: -Dname=<semaphore-name>, default <semaphore-name>=user:10000\n"
    + "               -Dname=<auto>, release semaphore imediately after aquiring ownership owner.\n"
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
    var key = T.getProperty ( "name", "user:10000" ) ;
    var auto = T.getProperty ( "auto" ) ;
    var sem = new Semaphore ( key ) ;
    console.log ( "Aquiring semaphor=" + key ) ;
    sem.acquire ( function ( err )
    {
      console.log ( this.toString() ) ;
      console.log ( "Is owner: " + this.isOwner() ) ;
      if ( auto )
      {
        this.release() ;
      }
    } ) ;
  }
}
