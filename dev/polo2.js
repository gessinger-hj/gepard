#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-01 12:10:26
*/

'use strict';

var polo = require('polo');
var util = require('util');
var apps = polo();

apps.on('up', function(name, service) {                   // up fires everytime some service joins
    console.log("1 --------------------------------");
    console.log(apps.get(name));                        // should print out the joining service, e.g. hello-world
    console.log("2 --------------------------------");
    console.log ( service ) ;
    console.log("3 --------------------------------");
});
apps.on('down', function(name, service) {                   // up fires everytime some service joins
		console.log ( service ) ;
});
