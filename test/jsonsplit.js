#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
var fs = require ( "fs" ) ;
var fn = gepard.getProperty ( "file" ) ;
var s = fs.readFileSync ( fn, "utf-8" ) ;
var l = gepard.splitJSONObjects ( s ) ;

console.log ( "l.list.length=" + l.list.length ) ;
// console.log ( "l.lastLineIsPartial=" + l.lastLineIsPartial ) ;
console.log ( l ) ;
