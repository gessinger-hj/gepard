#!/usr/bin/env node
if ( require.main === module )
{
  var T      = require ( "../src/Tango" ) ;
  var Event  = require ( "../src/Event" ) ;
  var Client = require ( "../src/Client" ) ;

  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard Examples: Emitter, emit a given event.\n"
    + "Usage: node Emitter [-Dname=<event-name>], default <event-name>=CONFIG-CHANGED"
    ) ;
    process.exit() ;
  }
  var name = T.getProperty ( "name", "CONFIG-CHANGED" ) ;

  var c = new Client() ;

  c.fire ( name,
  {
    write: function()
    {
      c.end() ;
    }
  });
}
