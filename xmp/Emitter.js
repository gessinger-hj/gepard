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
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM\n"
    + "                    [-Dbody=<json-string>], example: '-Dbody={\"City\":\"Frankfurt\"}'"
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
    var name = T.getProperty ( "name", "ALARM" ) ;
    var body = T.getProperty ( "body" ) ;

    var c = new Client() ;
    if ( body )
    {
      body = JSON.parse ( body ) ;
      c.emit ( e,
      {
        write: function()
        {
          this.end() ;
        }
      });
    }
    else
    {
      c.emit ( name,
      {
        write: function() // The event is sent -> end connection and exit
        {
          this.end() ;
        }
      });
    }
  }
}
