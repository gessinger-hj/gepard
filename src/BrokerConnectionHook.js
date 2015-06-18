var util         = require ( "util" ) ;
var T            = require ( "./Tango" ) ;

if ( typeof Promise === 'undefined' )
{
  Promise = require ( "promise" ) ;
}

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
  return true ;
};
BrokerConnectionHook.prototype.shutdown = function ( connection, event )
{
  var p = new Promise ( function ( resolve, reject )
  {
    if ( ! connection.isLocalHost() )
    {
      reject() ;
      return ;
    }
    resolve() ;
  });
  return p ;
  // if ( ! connection.isLocalHost() ) return false ;
  // return true ;
};
BrokerConnectionHook.prototype.getInfoRequest = function ( connection, event )
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