#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   hg02055
* @Last Modified time: 2016-02-22 17:24:00
*/

'use strict';
var gepard = require ( "gepard" ) ;
var os = require ( "os" ) ;

var port = gepard.getInt ( 'port', 17501 ) ;
var type = gepard.getProperty ( 'type', 'gepard' ) ;
var name = gepard.getProperty ( 'name', 'Broker1' ) ;
var bonjour = require('bonjour')() ;
bonjour.publish({ name: name, type: type, port: port, txt:{ list:"a,b" }}) ;
setTimeout ( function()
{
  // bonjour.unpublishAll ( function (p)
  // {
  //   console.log ( p ) ;
  // });
  // process.exit(0) ;
},10000 ) ;
// bonjour.publish({ name: 'My Web Server2', type: 'gepard', port: 3100, addresses:["AAA"] }) ;
