#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Requester, request a result for the message with name 'getFileList'.\n"
    + "Usage: node Requester\n"
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

    var name = "getFileList" ;

    var c = gepard.getClient() ;

    c.request ( name, function ( e )
    {
      if ( e.isBad() )
      {
        console.log ( e.getStatusReason() ) ;
      }
      else
      {
        console.log ( e.getBody().file_list ) ;
      }
      this.end() ;
    });
  });
}
