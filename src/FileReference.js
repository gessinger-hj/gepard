var T      = require ( "./Tango" ) ;
var Path   = require ( 'path') ;

/**
 * Description
 * @constructor
 * @return 
 */
var FileReference = function ( file )
{
  this.className = "FileReference" ;
  this.path = file.replace ( /\\/g, "/" ) ;
  this.path = Path.resolve ( this.path ) ;
  this.name = this.path.substring ( this.path.lastIndexOf ( "/" ) + 1 ) ;
  this.data = null ;
};
/**
 * Description
 * @method toString
 * @return string
 */
FileReference.prototype.toString = function()
{
  return "(" + this.className + ")[path=" + this.path + "]" ;
};
/**
 * Description
 * @return string 
 */
// FileReference.prototype.toJSON = function()
// {
//   return { type:'FileReference', 'value': this.path } ;
// };
module.exports = FileReference ;
