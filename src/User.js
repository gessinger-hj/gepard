if ( typeof gepard === 'undefined' ) gepard = {} ;

/**
 * User class
 *
 * @class
 * @param      {string}    id      The identifier
 * @param      {int}    key     The key
 * @param      {string}    pwd     The password
 */
gepard.User = function ( id, key, pwd )
{
	this.className  = "User" ;
	this.id         = id ;
	this.key        = key ;
	this._pwd       = pwd ;
	this.rights     = {} ;
	this.groups     = {} ;
	this.attributes = {} ;
};
/**
 * Description
 * @return String representation
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
/**
 * Gets right.
 *
 * @param      {string}  name    The name
 * @return     {string}  The right.
 */
gepard.User.prototype.getRight = function ( name )
{
	return this.rights[name] ;
};
/**
 * Sets the key.
 *
 * @param      {int}  key     The key
 */
gepard.User.prototype.setKey = function ( key )
{
  this.key = key ;
};
/**
 * Adds right.
 *
 * @param      {string}  name    The name
 * @param      {string}  value   The value
 */
gepard.User.prototype.addRight = function ( name, value )
{
  this.rights[name] = value ;
};
/**
 * Gets the attributes.
 *
 * @return     {object}  The attributes.
 */
gepard.User.prototype.getAttributes = function()
{
  return this.attributes ;
};

/**
 * Gets the attribute.
 *
 * @param      {string}  name    The name
 * @return     {string}  The attribute.
 */
gepard.User.prototype.getAttribute = function ( name )
{
	return this.attributes[name] ;
};
/**
 * Gets the language.
 *
 * @return     {string}  The language.
 */
gepard.User.prototype.getLanguage = function()
{
	return this.getAttribute("lang") ;
};

if ( typeof module !== 'undefined' && typeof require !== 'undefined' )
{
	module.exports = gepard.User ;
}
