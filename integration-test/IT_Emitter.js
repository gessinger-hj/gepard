#!/usr/bin/env node

"use strict"

var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var type   = gepard.getProperty ( "type", "DEFAULT" ) ;
var c      = gepard.getClient() ;
let e = new gepard.Event ( name, type ) ;
c.emit ( e,
{
  write: function() // The event is sent -> end connection and exit
  {
    console.log ( "[" + gepard.getScriptName() + "]" ) ;
    this.end() ;
  }
});
