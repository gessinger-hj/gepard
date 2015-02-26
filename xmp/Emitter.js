#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;
  var Admin  = require ( "../src/Admin" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM\n"
    + "                    [-Dbody=<json-string>], example: {\"City\":\"Frankfurt\"}"
    + "                    [-Drequest]"
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

  if ( T.getProperty ( "request" ) )
  {
    name += ":request" ;
    c.request ( name,
    {
      result: function ( e )
      {
        console.log ( e ) ;
        this.end() ;
      }
    });
    return ;
  }
  if ( body )
  {
    body = JSON.parse ( body ) ;
    var e = new Event ( name, body ) ;
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
      write: function()
      {
        this.end() ;
      }
    });
  }
}
