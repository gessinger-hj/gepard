#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
var name = gepard.getProperty ( "name", "ack" ) ;
var c = gepard.getClient() ;
c.on ( name, function(e)
{
	console.log ( "e.getCHANNEL()=" + e.getChannel() ) ;
	e.setStatus ( 0, "ack", c.getChannel() ) ;
// this.end() ;
	e.sendBack() ;
}) ;
