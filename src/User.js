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
	this.id = id ;
	this.key = key ;
	this._pwd = pwd ;
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
 * @return MemberExpression
 */
User.prototype.getId = function (  )
{
	return this.id ;
};
module.exports = User ;
