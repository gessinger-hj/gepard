#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   Hans Jürgen Gessinger
* @Last Modified time: 2016-04-10 21:10:44
*/

'use strict';
var gepard = require ( 'gepard' ) ;
var type = gepard.getProperty ( 'type', 'gepard' ) ;
var Bonjour = require('bonjour') ;

var bonjour = new Bonjour()

var browser = bonjour.find({ type: type } ) ;

browser.on ( "up", function(service)
{
  	console.log('up:', service ) ;
});
browser.on ( "down", function(service)
{
	console.log('down:', service.fqdn ) ;
});

setInterval ( function()
{
  browser.stop() ;
  browser.start() ;
},21000);
