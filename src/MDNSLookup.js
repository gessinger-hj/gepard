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
	console.log ( service )
}
gepard.findService ( { type:type }, (service) => console.log ( service ) ) ;