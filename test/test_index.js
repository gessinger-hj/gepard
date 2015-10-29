#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
var Log = gepard.LogFile ;
// console.log ( Log ) ;

console.log ( gepard.exists ( "Broker" ) ) ;
var client = new gepard.getClient ( 17501 ) ;
var client2 = new gepard.getClient() ;
//console.log ( client ) ;
//console.log ( client2 ) ;
// var c = gepard.getClient() ;
// console.log ( c ) ;
