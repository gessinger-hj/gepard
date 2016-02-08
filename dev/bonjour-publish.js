#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-05 18:27:25
*/

'use strict';
var gepard = require ( "gepard" ) ;
var os = require ( "os" ) ;

var bonjour = require('bonjour')() ;
bonjour.publish({ name: 'MyWebServer', type: 'gepard', port: 17501, txt:{ list:"a,b" }}) ;
setTimeout ( function()
{
  // bonjour.unpublishAll ( function (p)
  // {
  //   console.log ( p ) ;
  // });
  process.exit(0) ;
},10000 ) ;
// bonjour.publish({ name: 'My Web Server2', type: 'gepard', port: 3100, addresses:["AAA"] }) ;
