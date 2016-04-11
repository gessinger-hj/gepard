#!/usr/bin/env node

var T      = require ( "./Tango" ) ;
var Event  = require ( "./Event" ) ;
var Client = require ( "./Client" ) ;

/**
 * Description
 * @constructor
 * @param {int} [port]
 * @param {string} [host]
 * @return 
 */
var Semaphore = function ( resourceId, port, host )
{
  this.className = "Semaphore" ;
  this._resourceId = resourceId ;
  if ( port instanceof Client )
  {
    this._isClientOwner = false ;
    this._client = port ;
  }
  else
  {
    this._port = port ;
    this._host = host ;
    this._isClientOwner = true ;
    this._client = new Client ( this._port, this._host ) ;
  }
  this._isSemaphoreOwner = false ;
};

/**
 * Description
 * @method toString
 * @return BinaryExpression
 */
Semaphore.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isSemaphoreOwner + "]" ;
};
/**
 * Description
 * @method acquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
Semaphore.prototype.acquire = function ( callback )
{
  this._callback = callback ;
  this._client.acquireSemaphore ( this._resourceId, this._acquireSemaphoreCallback.bind ( this ) ) ;
};
Semaphore.prototype._acquireSemaphoreCallback = function ( err, e )
{
  if ( ! err )
  {
    this._acquireSemaphoreResult = e ;
    this._isSemaphoreOwner = e.body.isSemaphoreOwner ;
  }
  this._callback.call ( this, err ) ;
};
/**
 * Description
 * @method isOwner
 * @return MemberExpression
 */
Semaphore.prototype.isOwner = function()
{
  return this._isSemaphoreOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
Semaphore.prototype.release = function()
{
  this._isSemaphoreOwner = false ;
  if ( ! this._client )
  {
    return ;
  }
  this._client.releaseSemaphore ( this._resourceId ) ;
  if ( this._isClientOwner && this._client )
  {
    this._client.end() ;
    this._client = null ;
  }
};
module.exports = Semaphore ;
if ( require.main === module )
{
  if ( T.getProperty ( "help" ) )
  {
    console.log (
      "Gepard example: Semaphore, acquire a given semaphore.\n"
    + "Usage: node Semaphore [options]\n"
    + "  Options are: -Dname=<semaphore-name>, default <semaphore-name>=user:4711\n"
    + "               -Dname=<auto>, release semaphore imediately after aquiring ownership owner.\n"
    ) ;
    process.exit() ;
  }

  var key = T.getProperty ( "name", "user:4711" ) ;
  var auto = T.getProperty ( "auto" ) ;
  var sem = new Semaphore ( key ) ;
  console.log ( "Aquiring semaphor=" + key ) ;
  sem.acquire ( function ( err )
  {
    console.log ( this.toString() ) ;
    console.log ( "Is owner: " + this.isOwner() ) ;
    if ( auto )
    {
      this.release() ;
    }
  } ) ;
}
