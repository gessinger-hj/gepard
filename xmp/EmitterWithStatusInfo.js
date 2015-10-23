#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: EmitterWithStatusInfo, emit a given event and request staus failure or success.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM"
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
  });

  var name = gepard.getProperty ( "name", "ALARM" ) ;
  var body = gepard.getProperty ( "body" ) ;

  var c = gepard.getClient() ;

  c.fire ( name,
  {
    status: function(event)
    {
      console.log ( "status=" + event.getStatusName() ) ;
      if ( event.isBad() )
      {
        console.log ( event.getStatusReason() ) ;
      }
      else
      {
        console.log ( event.getStatusReason() ) ;
      }
      this.end() ;
    }
  });
}
