#!/usr/bin/env node

var gepard = require ( "gepard" ) ;

var name = "ALARM,BLARM" ;
name = name.split ( ',' ) ;
var c = gepard.getClient() ;
c.setReconnect ( true ) ; // Reconnection requested
console.log ( "Listen for events with name=" + name ) ;
c.on ( name, e => { console.log ( e ) ; } ) ;

		// c.onAction ( "rmfunc", function ( cl, cmd )
		// {
		// 	cmd.setResult ( "done") ;
		// 	cl.remove ( func ) ;
		// });
