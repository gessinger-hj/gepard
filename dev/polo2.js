#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   gess
* @Last Modified time: 2016-01-31 21:40:45
*/

'use strict';

var polo = require('polo');
var util = require('util');
var apps = polo();

apps.on('up', function(name, service) {                   // up fires everytime some service joins
    console.log("1 --------------------------------");                        // should print out the joining service, e.g. hello-world
    // console.log(apps.get(name));                        // should print out the joining service, e.g. hello-world
    console.log ( service ) ;
});
apps.on('down', function(name, service) {                   // up fires everytime some service joins
    console.log( util.inspect ( name, { showHidden: false, depth: null } ) ) ;
    console.log( typeof name ) ;
		console.log ( service ) ;
});
