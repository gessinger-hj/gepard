#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var client = gepard.getClient() ;
client.emit ( name,
{
  write: () => {// The event is sent -> end connection and exit
    client.end() ;
  }
});
