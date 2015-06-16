var util = require ( "util" ) ;
var BrokerConnectionHook = require ( "gepard" ).BrokerConnectionHook ;
var XmpConnectionHook = function()
{
	XmpConnectionHook.super_.call ( this ) ;
};
util.inherits ( XmpConnectionHook, BrokerConnectionHook ) ;
XmpConnectionHook.prototype.connect = function ( connection )
{
	console.log ( "connection.getRemoteAddress()=" + connection.getRemoteAddress() ) ;
	return true ;
};
module.exports = XmpConnectionHook ;
