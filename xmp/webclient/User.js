if ( typeof gepard === 'undefined' ) gepard = {} ;

/**
 * @constructor
 * @param {} id
 * @param {} key
 * @param {} pwd
 */
gepard.User = function ( id, key, pwd )
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
gepard.User.prototype.toString = function()
{
	var str = "" ;
	for ( var key in this.rights )
	{
		str += key + "=" + this.rights[key] ;
	}
	return "(" + this.className + ")[id=" + this.id + ",key=" + this.key + "\n" + str + "\n]" ;
};
/**
 * Description
 * @return id
 */
gepard.User.prototype.getId = function (  )
{
	return this.id ;
};
/**
 * Description
 * @return key
 */
gepard.User.prototype.getKey = function (  )
{
	return this.key ;
};
/**
 * Description
 * @return key
 */
gepard.User.prototype.getRights = function (  )
{
	return this.rights ;
};
gepard.User.prototype.getRight = function ( name )
{
	return this.rights[name] ;
};
gepard.User.prototype.setKey = function ( key )
{
  this.key = key ;
}
gepard.User.prototype.addRight = function ( name, value )
{
  rights[name] = value ;
}

if ( typeof document === 'undefined' )
{
	module.exports = gepard.User ;
	gepard = undefined ;
}
