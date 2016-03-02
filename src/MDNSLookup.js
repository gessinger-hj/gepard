#!/usr/bin/env node

/*
* @Author: hg02055
* @Date:   2016-02-24 19:09:52
* @Last Modified by:   hg02055
* @Last Modified time: 2016-02-25 13:46:54
*/

'use strict';

var os     = require ( "os" ) ;
var gepard = require ( "gepard" ) ;
var type   = gepard.getProperty ( "t", "gepard" ) ;
var local  = gepard.getProperty ( "l" ) ;
var arg    = gepard.getProperty ( "a" ) ;

if ( local === "true" )
{
	gepard.findService ( { type:type }, (service) => {
		if ( service.host === os.hostname() )
		{
			formatOutput ( service ) ;
		  return true ;
		}
	});
	return ;
}
if ( local )
{
	gepard.findService ( { type:type }, (service) => {
		if ( service.host === local )
		{
			formatOutput ( service ) ;
		  return true ;
		}
	});
	return ;
}

function formatOutput ( service )
{
	if ( arg )
	{
	  process.stdout.write ( "--gepard.host=" + service.host + " --gepard.port=" + service.port ) ;
	  return ;
	}
	console.log ( service.fqdn )
}
var cache = {} ;
setInterval ( () => {
	let now = new Date().getTime() ;
	let toBeRemoved = [] ;
	for ( let fqdn in cache )
	{
		if ( cache[fqdn].time + 10000 < now )
		{
			console.log ( "Removed: " + fqdn ) ;
		  toBeRemoved.push ( fqdn ) ;
		}
	}
	for ( let i = 0 ; i < toBeRemoved.length ; i++ )
	{
		delete cache[toBeRemoved[i]] ;
	}
	toBeRemoved.length = 0 ;
}, 10000);
gepard.findService ( { type:type }, (service) => {
	if ( ! cache[service.fqdn] )
	{
		console.log ( "Added: " + service.fqdn ) ;
	}
	cache[service.fqdn] = { time:new Date().getTime() } ;
 } ) ;