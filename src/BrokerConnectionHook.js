var util         = require ( "util" ) ;

var BrokerConnectionHook = function()
{
	this.jsClassName = "BrokerConnectionHook" ;
};
BrokerConnectionHook.prototype.toString = function()
{
	return "(" + this.jsClassName + ")" ;
};
BrokerConnectionHook.prototype.connect = function ( connection )
{
// console.log ( connection ) ;
};
BrokerConnectionHook.prototype.shutdown = function ( connection )
{
  if ( ! connection.isLocalHost() ) return false ;
  return true ;
};
BrokerConnectionHook.prototype.getInfoRequest = function ( connection )
{
  return true ;
};
BrokerConnectionHook.prototype.addEventListener = function ( connection, event )
{
  return true ;
};
BrokerConnectionHook.prototype.sendEvent = function ( connection, event )
{
  return true ;
};
BrokerConnectionHook.prototype.lockResource = function ( connection, event )
{
  return true ;
};
BrokerConnectionHook.prototype.acquireSemaphore = function ( connection, event )
{
  return true ;
};
module.exports = BrokerConnectionHook ;