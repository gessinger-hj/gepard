#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
var name = gepard.getProperty ( "name", "ack" ) ;
var c = gepard.getClient() ;
c.on ( name, function(e)
{
	console.log ( "e.getCHID()=" + e.getCHID() ) ;
	e.setStatus ( 0, "ack", c.getCHID() ) ;
// this.end() ;
	e.sendBack() ;
}) ;
