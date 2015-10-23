#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard example: Semaphore, acquire a given semaphore.\n"
    + "Usage: node Semaphore [options]\n"
    + "  Options are: -Dname=<semaphore-name>, default <semaphore-name>=user:4711\n"
    + "               -Dname=<auto>, release semaphore imediately after aquiring ownership owner.\n"
    ) ;
    process.exit() ;
  }
  new gepard.Admin().isRunning ( function admin_is_running ( state )
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
    var key = gepard.getProperty ( "name", "user:4711" ) ;
    var auto = gepard.getProperty ( "auto" ) ;
    var sem = new gepard.Semaphore ( key ) ;
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
