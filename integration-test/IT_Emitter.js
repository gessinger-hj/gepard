#!/usr/bin/env node

"use strict"

var getScriptName = () => {
  let argv1 = process.argv[1] ;
  if ( argv1 )
  {
    argv1 = argv1.replace ( /\\/g, "/" ) ;
  }
  else
  {
    argv1 = "Unknown" ;
  }
  if ( argv1.indexOf ( '/' >= 0 ) )
  {
    return argv1.substring ( argv1.lastIndexOf ( '/' ) + 1 ) ; 
  }
  return argv1 ; 
}


var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var type   = gepard.getProperty ( "type", "DEFAULT" ) ;
var c      = gepard.getClient() ;
let e = new gepard.Event ( name, type ) ;
c.emit ( e,
{
  write: function() // The event is sent -> end connection and exit
  {
    console.log ( "[" + getScriptName() + "]" ) ;
        this.end() ;
  }
});
