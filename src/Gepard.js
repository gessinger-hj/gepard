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
  this.version = "" ;
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
Gepard.prototype.getVersion = function()
{
  if ( this.version )
  {
    return this.version ;
  }
  var fs  = require ( "fs" ) ;
  try
  {
    var package_json = JSON.parse ( fs.readFileSync ( __dirname + "/../package.json", 'utf8' ) ) ;
    this.version  = package_json.version ;
  }
  catch ( exc )
  {
    this.version = "X" ;
  }
  return this.version ;
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
    return ;
  }
  this._logDir = T.resolve ( "%HOME%/log" ) ;
  T.setProperty ( "GEPARD_LOG", this._logDir ) ;
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
