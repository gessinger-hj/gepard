var T = require ( "./Tango" ) ;
var util = require ( "util" ) ;

/**
 * @constructor
 * @param {} id
 * @param {} key
 * @param {} pwd
 */
var User = function ( id, key, pwd )
{
	this.className = "User" ;
	this.id        = id ;
	this.key       = key ;
	this._pwd      = pwd ;
	this.rights = {} ;
};
/**
 * Description
 * @return BinaryExpression
 */
User.prototype.toString = function()
{
	return "(" + this.className + ")[" + util.inspect ( this ) + "]" ;
};
/**
 * Description
 * @return id
 */
User.prototype.getId = function (  )
{
	return this.id ;
};
/**
 * Description
 * @return key
 */
User.prototype.getKey = function (  )
{
	return this.key ;
};
/**
 * Description
 * @return key
 */
User.prototype.getRights = function (  )
{
	return this.rights ;
};
User.prototype.getRight = function ( name )
{
	return this.rights[name] ;
};
User.prototype.setKey = function ( key )
{
  this.key = key ;
}
User.prototype.addRight = function ( name, value )
{
  rights[name] = value ;
}

module.exports = User ;
