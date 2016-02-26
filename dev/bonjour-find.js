#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   hg02055
* @Last Modified time: 2016-02-16 19:39:53
*/

'use strict';
var gepard = require ( 'gepard' ) ;
var type = gepard.getProperty ( 'type', 'gepard' ) ;
var Bonjour = require('bonjour') ;

var bonjour ;
	bonjour = new Bonjour()

	var browser = bonjour.find({ type: type } ) ;

	browser.on ( "up", function(service)
	{
	  // if ( service.fqdn.indexOf ( "gepard" ) >= 0 )
	  	console.log('up:', service ) ;
	});
	browser.on ( "down", function(service)
	{
	  // if ( service.fqdn.indexOf ( "gepard" ) >= 0 )
	  	console.log('down:', service.fqdn ) ;
	});

// scan() ;
setInterval ( function()
{
  browser.stop() ;
  browser.start() ;
},21000);