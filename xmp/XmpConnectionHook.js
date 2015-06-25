var util = require ( "util" ) ;
var ConnectionHook = require ( "../src/ConnectionHook" ) ;
var XmpConnectionHook = function()
{
	XmpConnectionHook.super_.call ( this ) ;
};
util.inherits ( XmpConnectionHook, ConnectionHook ) ;
XmpConnectionHook.prototype.connect = function ( connection )
{
	console.log ( "connection.getRemoteAddress()=" + connection.getRemoteAddress() ) ;
	return true ;
};
XmpConnectionHook.prototype.addEventListener = function ( connection, eventNameList )
{
	console.log ( connection.getClientInfo() ) ;
  return true ;
};
module.exports = XmpConnectionHook ;
