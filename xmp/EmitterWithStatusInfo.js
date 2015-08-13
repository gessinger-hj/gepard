#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;
  var User   = require ( "../src/User" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: EmitterWithStatusInfo, emit a given event and request staus failure or success.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM"
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

  var name = T.getProperty ( "name", "ALARM" ) ;
  var body = T.getProperty ( "body" ) ;

  var c = new Client() ;

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
