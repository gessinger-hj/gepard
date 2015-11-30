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
    var n = 0 ;
    c.broadcast ( name, function ( e )
    {
    	var inst = e.control.clone ;
    	n++ ;
    	console.log ( inst ) ;
    	if ( n === inst.of )
    	{
				this.setReconnect ( false ) ;
    		this.end() ;
    	}
    });
  });
}
