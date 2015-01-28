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
Lock = function ( resourceId, port, host )
{
  this.className = "Lock" ;
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
  this._isLockOwner = false ;
};
/**
 * Description
 * @method toString
 * @return BinaryExpression
 */
Lock.prototype.toString = function()
{
  return "(" + this.className + ")[resourceId=" + this._resourceId + ",isOwner=" + this._isLockOwner + "]" ;
};

/**
 * Description
 * @method aquire
 * @param {} resourceId
 * @param {} callback
 * @return 
 */
Lock.prototype.aquire = function ( callback )
{
  if ( ! this._client )
  {
    this._client = new Client ( this._port, this._host ) ;
  }
  this._callback = callback ;
  this._client.lockResource ( this._resourceId, this._lockResourceCallback.bind ( this ) ) ;
};
Lock.prototype._lockResourceCallback = function ( err, e )
{
  this._lockResourceResult = e ;
  this._isLockOwner = e.body.isLockOwner ;
  this._callback.call ( null, err, this ) ;
  if ( ! this._isLockOwner )
  {
    if ( this._isClientOwner && this._client )
    {
      this._client.end() ;
      this._client = null ;
    }
  }
};
/**
 * Description
 * @method isOwner
 * @return MemberExpression
 */
Lock.prototype.isOwner = function()
{
  return this._isLockOwner ;
};
/**
 * Description
 * @method release
 * @return 
 */
Lock.prototype.release = function()
{
  if ( ! this._isLockOwner )
  {
    return ;
  }
  this._isLockOwner = false ;
  this._client.unlockResource ( this._resourceId ) ;
  if ( this._isClientOwner && this._client )
  {
    this._client.end() ;
    this._client = null ;
  }
};
module.exports = Lock ;
if ( require.main === module )
{
  var key = T.getProperty ( "key", "user:4711" ) ;
  var auto = T.getProperty ( "auto" ) ;
  var lock = new Lock ( key ) ;
  lock.aquire ( function ( err, l )
  {
    console.log ( "err=" + err ) ;
    console.log ( "l=" + l ) ;
    if ( auto )
    {
      l.release() ;
    }
  } ) ;
}