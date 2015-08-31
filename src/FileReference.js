var T    = require ( "./Tango" ) ;
var Path = require ( 'path') ;
var fs   = require ( 'fs') ;

/**
 * Description
 * @constructor
 * @return 
 */
var FileReference = function ( file )
{
  this.className = "FileReference" ;
  this.path = "" ;
  this.name = "" ;
  this.data = null ;
  if ( file )
  {
    this.path = file.replace ( /\\/g, "/" ) ;
    this.path = Path.resolve ( this.path ) ;
    this.path = this.path.replace ( /\\/g, "/" ) ;
    this.name = this.path.substring ( this.path.lastIndexOf ( "/" ) + 1 ) ;
  }
  this.targetIsLocalHost = false ;
};
/**
 * Description
 * @method toString
 * @return string
 */
FileReference.prototype.toString = function()
{
  return "(" + this.className + ")[\npath=" + this.path + "\n  name=" + this.name + "\n  data=" + this.data + "\n]" ;
};
FileReference.prototype.setTargetIsLocalHost = function ( state )
{
  this.targetIsLocalHost = !!state ;
};
/**
 * Description
 * @return string 
 */
FileReference.prototype.toJSON = function()
{
  var data = this.data ;
  if ( ! this.targetIsLocalHost && ! data )
  {
    data = fs.readFileSync ( this.path ) ;
  }
  delete this.targetIsLocalHost ;
  return { className:'FileReference', path: this.path, name:this.name, data:data } ;
};
FileReference.prototype.getBytes = function()
{
  if ( this.data ) //instanceof Buffer )
  {
    return this.data ;
  }
  return fs.readFileSync ( this.path ) ;
};
FileReference.prototype.getName = function()
{
  return this.name ;
};
FileReference.prototype.getPath = function()
{
  return this.path ;
};
FileReference.prototype.write = function ( fullFileName )
{
  var ws ;
  if ( ! this.data )
  {
    var options =
    {
      flags: 'r'
    , encoding: null
    , fd: null
    , autoClose: true
    } ;
    ws = fs.createWriteStream ( fullFileName, { encoding: null } ) ;
    var rs = fs.createReadStream ( this.path, options ) ;
    rs.pipe ( ws ) ;
  }
  else
  {
    ws = fs.createWriteStream ( fullFileName, { encoding: null } ) ;
    ws.write ( this.data ) ;
    ws.end() ;
  }
};

module.exports = FileReference ;
