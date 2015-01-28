var T      = require ( "../Tango" ) ;
var Event  = require ( "./Event" ) ;
var Client = require ( "./Client" ) ;

/**
 * Description
 * @constructor
 * @param {int} [port]
 * @param {string} [host]
 * @return 
 */
Semaphore = function ( resourceId, port, host )
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
 * @method aquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
Semaphore.prototype.aquire = function ( callback )
{
  if ( ! this._client )
  {
    this._client = new Client ( this._port, this._host ) ;
  }
  this._callback = callback ;
  this._client.aquireSemaphore ( this._resourceId, this._aquireSemaphoreCallback.bind ( this ) ) ;
};
Semaphore.prototype._aquireSemaphoreCallback = function ( err, e )
{
  if ( ! err )
  {
    this._aquireSemaphoreResult = e ;
    this._isSemaphoreOwner = e.body.isSemaphoreOwner ;
  }
  this._callback.call ( this, err, this ) ;
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
  var key = T.getProperty ( "key", "user:10000" ) ;
  var auto = T.getProperty ( "auto" ) ;
  var sem = new Semaphore ( key ) ;
  sem.aquire ( function ( err, l )
  {
    // console.log ( "err=" + err ) ;
    console.log ( this.toString() ) ;
    if ( auto )
    {
      this.release() ;
    }
  } ) ;
}