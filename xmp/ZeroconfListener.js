#!/usr/bin/env node

var gepard = require ( "gepard" ) ;

// Option 1: callback
var client = gepard.getClient ( 'test-gepard', service => { return true ; } ) ;
/*
// Option 2: callback with decision
var client = gepard.getClient ( 'test-gepard', service => { if ( service.isLocalHost() ) return true ; } ) ;
// Option 3: auto-callback with timeout
var client = gepard.getClient ( { timeout:10000, type:'test-gepard' } ) ;
// Option 4: auto-callback type only
var client = gepard.getClient ( 'test-gepard' ) ;
// Option 5: auto-callback type given by: --gepard.zeroconf.type=test-gepard
var client = gepard.getClient() ;
*/

client.on ( "ALARM", (e) => console.log ( e ) ) ;
client.on ( "error", e => console.log ( e ) ) ;