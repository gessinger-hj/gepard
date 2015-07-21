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
    + "                    [-Dbody=<json-string>], example: {\"City\":\"Frankfurt\"}"
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

  if ( body )
  {
    body = JSON.parse ( body ) ;
    body.binary = new Buffer ( [ 64, 65, 66, 67 ] ) ;
    var e = new Event ( name, body ) ;
    var u = new User ( "smith" ) ;
    u.addRight ( "CAN_READ_FILES", "*.docx" ) ;
    e.setUser ( u ) ;

    c.fire ( e,
    {
      write: function()
      {
        this.end() ;
      }
    });
  }
  else
  {
    c.fire ( name,
    {
      status: function(event)
      {
        this.end() ;
      },
      write: function()
      {
        // this.end() ;
      }
    });
  }
}
