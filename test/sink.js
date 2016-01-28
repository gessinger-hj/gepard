#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
var name = gepard.getProperty ( "name", "sink" ) ;
var c = gepard.getClient() ;
c.on ( name, function(e)
{
	gepard.log ( e ) ;
	console.log ( "e.getChannel()=" + e.getChannel() ) ; // CHANGED
}) ;
