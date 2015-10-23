#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM\n"
    + "                    [-Dbody=<json-string>], example: '-Dbody={\"City\":\"Frankfurt\"}'"
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
    var name = gepard.getProperty ( "name", "ALARM" ) ;
    var body = gepard.getProperty ( "body" ) ;

    var c = gepard.getClient() ;
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
