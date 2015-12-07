#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var c      = gepard.getClient() ;
c.emit ( name,
{
  write: function() // The event is sent -> end connection and exit
  {
    this.end() ;
  }
});
