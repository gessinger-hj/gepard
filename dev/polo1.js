#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-05 15:09:48
*/

'use strict';
var os   = require ( "os" ) ;
var polo = require('polo');
var apps = polo();
var hostname  = os.hostname() ;

apps.put({
    name: "gepard", //{ x:1, Y:2 }, //'hello-world', // required - the name of the service
    // host:hostname, // defaults to the network ip of the machine
    port: 8080,          // we are listening on port 8080.
    events:"A,B,C"          // we are listening on port 8080.
});