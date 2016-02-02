#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-02 18:21:23
*/

'use strict';
var bonjour = require('bonjour')()

var browser = bonjour.find({ type: '' }, function (service) {
  console.log('Found an HTTP server:', service)
}) ;

// browser.on ( "up", function(service)
// {
// 	console.log ( "----------------------up---------------------------------" ) ;
// 	console.log ( service ) ;
// console.log ( browser.services ) ;
// });
// browser.on ( "down", function(service)
// {
// 	console.log ( "----------------------down---------------------------------" ) ;
// 	console.log ( service ) ;
// console.log ( browser.services ) ;
// });
