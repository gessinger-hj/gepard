var util  = require ( "util" ) ;
var T     = require ( "./Tango" ) ;
var JSAcc = require ( "./JSAcc" ) ;

if ( typeof Promise === 'undefined' )
{
  Promise = require ( "promise" ) ;
}

var ConnectionHook = function()
{
	this.jsClassName = "ConnectionHook" ;
};
ConnectionHook.prototype.createPromise = function ( executor )
{
  return new Promise  ( executor ) ;
};
ConnectionHook.prototype.toString = function()
{
	return "(" + this.jsClassName + ")" ;
};
ConnectionHook.prototype.connect = function ( connection )
{
  return true ;
};
ConnectionHook.prototype.shutdown = function ( connection, event )
{
  if ( ! connection.isLocalHost() )
  {
    return false ;
  }
  return true ;
};
ConnectionHook.prototype.getInfoRequest = function ( connection, event )
{
  var p = new Promise ( function promis_getInfoRequest ( resolve, reject )
  {
    resolve() ;
  });
  return p ;
  // return true ;
};
ConnectionHook.prototype.addEventListener = function ( connection, eventNameList )
{
  return true ;
};
ConnectionHook.prototype.sendEvent = function ( connection, eventName )
{
  return true ;
};
ConnectionHook.prototype.lockResource = function ( connection, resourceId )
{
  return true ;
};
ConnectionHook.prototype.acquireSemaphore = function ( connection, resourceId )
{
  return true ;
};
ConnectionHook.prototype.clientAction = function ( connection, event )
{
  return true ;
};
ConnectionHook.prototype.system = function ( connection, event )
{
  return true ;
};
ConnectionHook.prototype.messageReturned = function ( event, responderConnection, requesterConnection )
{
  if ( ! event.getName().startsWith ( "ack" ) )
  {
    return ;
  }
  console.log ( event.control ) ;
  console.log ( "event.getName()=" + event.getName() ) ;
T.lwhere (  ) ;
  if ( event.getName() === "ack2" )
  {
T.lwhere (  ) ;
    event.setName ( "ack" ) ;
    return ;
  }
T.lwhere (  ) ;
  var jsacc = new JSAcc ( event.control ) ;
  jsacc.add ( "availableDecision/command", "goto" ) ;
  jsacc.add ( "availableDecision/step", "ack2" ) ;
  console.log ( event.control ) ;
  return ;
};
module.exports = ConnectionHook ;