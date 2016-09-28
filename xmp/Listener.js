#!/usr/bin/env node

var gepard = require ( "gepard" ) ;
gepard.getClient().on ( "ALARM", (e) => { console.log(e) } ) ;
