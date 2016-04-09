#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-05 15:11:16
*/

'use strict';

var polo = require('polo');
var util = require('util');
var apps = polo();

apps.on('up', function(name, service) {                   // up fires everytime some service joins
	console.log ( "name=" + name ) ;
    console.log ( service ) ;
});
apps.on('down', function(name, service) {                   // up fires everytime some service joins
		console.log ( service ) ;
});
