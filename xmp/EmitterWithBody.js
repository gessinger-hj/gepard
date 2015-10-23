#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;

  if ( gepard.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=ALARM\n"
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

    var c = gepard.getClient() ;
    var e = new gepard.Event ( name ) ;
    e.putValue ( "BINARY", new Buffer ( [ 64, 65, 66, 67 ] ) ) ;
    e.putValue ( "DATE", new Date() ) ;
    var u = new gepard.User ( "smith" ) ;
    u.addRight ( "CAN_READ_FILES", "*.docx" ) ;
    e.setUser ( u ) ;

    c.emit ( e,
    {
      write: function()
      {
        this.end() ;
      }
    });
  }
}
