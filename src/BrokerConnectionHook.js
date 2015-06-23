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
  // if ( ! connection.isLocalHost() ) return false ;
  // return true ;
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
};
BrokerConnectionHook.prototype.getInfoRequest = function ( connection, event )
{
  var p = new Promise ( function promis_getInfoRequest ( resolve, reject )
  {
    resolve() ;
  });
  return p ;
  // return true ;
};
BrokerConnectionHook.prototype.addEventListener = function ( connection, eventNameList )
{
  return true ;
};
BrokerConnectionHook.prototype.sendEvent = function ( connection, eventName )
{
  return true ;
};
BrokerConnectionHook.prototype.lockResource = function ( connection, resourceId )
{
  return true ;
};
BrokerConnectionHook.prototype.acquireSemaphore = function ( connection, resourceId )
{
  return true ;
};
module.exports = BrokerConnectionHook ;