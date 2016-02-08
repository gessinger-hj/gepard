#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-05 18:26:41
*/

'use strict';
var Bonjour = require('bonjour') ;

var bonjour ;
	bonjour = new Bonjour()

	var browser = bonjour.find({ type: 'gepard' } ) ;

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
	browser.reset() ;
},21000);
