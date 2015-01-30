var T      = require ( "./Tango" ) ;

/**
 * Description
 * @constructor
 * Singleton
 * @return 
 */
var Gepard = function()
{
  this.className = "Gepard" ;
  this._logDir = null ;
};
/**
 * Description
 * @method toString
 * @return string
 */
Gepard.prototype.toString = function()
{
  return "(" + this.className + ")[_logDir=" + this._logDir + "]" ;
};
/**
 * Description
 * @return string 
 */
Gepard.prototype.getLogDirectory = function()
{
  var s = T.getProperty ( "GEPARD_LOG" ) ;
  var fs = require ( "fs" ) ;
  if ( s )
  {
    this._logDir = s ;
  }
  else
  {
    this._logDir = T.resolve ( "%HOME%/log" ) ;
    T.setProperty ( "GEPARD_LOG", this._logDir ) ;
  }
  try
  {
    fs.statSync ( this._logDir ).isDirectory() ;
  }
  catch ( exc )
  {
    try
    {
      fs.mkdirSync ( this._logDir ) ;
    }
    catch ( exc )
    {
      console.log ( exc ) ;
    }
  }
  return this._logDir ;
};

module.exports = new Gepard() ;
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
