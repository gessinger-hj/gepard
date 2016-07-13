if ( typeof gepard === 'undefined' ) gepard = {} ;
if ( !Array.isArray )
{
  /**
   * Description
   * @method isArray
   * @param {} arg
   * @return LogicalExpression
   */
  Array.isArray = function(arg) {
  	return arg && arg.constructor === Array ;
  };
}
var _Event_isBrowser = true ;
if ( typeof process === 'object' ) {
  if ( typeof process.versions === 'object' ) {
    if ( typeof process.versions.node !== 'undefined' ) {
      _Event_isBrowser = false ;
    }
  }
}
var _Event_replace_Buffer_toJSON = null ;
/**
 * Description
 * @constructor
 * @class    Event
 * @param      {}    name    { description }
 * @param      {}    type    { description }
 * @param      {}    data    { description }
 */
gepard.Event = function ( name, type, data )
{
	this._init ( name, type, data ) ;
};
gepard.Event.prototype =
{
	/**
	 * Description
	 * @method serialize
	 * @param {object} obj
	 * @return string
	 */
	serialize: function ( obj )
	{
		var Date_toJSON, Buffer_toJSON ;
		if ( ! obj )
		{
			if ( this._Client ) delete this["_Client"] ;
			obj = this ;
		}
 		if ( typeof Buffer !== 'undefined' )
 		{
 			if ( _Event_replace_Buffer_toJSON === null )
 			{
 				var s = String ( Buffer.prototype.toJSON ) ;
	 			if ( s.indexOf ( 'type:' ) < 0 && s.indexOf ( 'data' ) < 0 )
	 			{
	 				_Event_replace_Buffer_toJSON = true ;
	 			}
 			}
 			if ( _Event_replace_Buffer_toJSON )
 			{
	    	Buffer_toJSON = Buffer.prototype.toJSON ;
 				Buffer.prototype.toJSON = function function_Buffer_toJSON()
 				{
			    return { type:"Buffer", data:Array.prototype.slice.call(this, 0) } ;
			  }
 			}
 		}
	  Date_toJSON = Date.prototype.toJSON ;
	  try
	  {
	    /**
    	 * Description
    	 * @method toJSON
    	 * @return ObjectExpression
    	 */
    	Date.prototype.toJSON = function function_Date_toJSON()
	    {
	      return { type:'Date', 'value': this.toISOString() } ;
	    };
	    return JSON.stringify ( obj ) ;
	  }
	  finally
	  {
	  	if ( Date_toJSON )
	  	{
	    	Date.prototype.toJSON = Date_toJSON ;
	  	}
	  	if ( Buffer_toJSON )
	  	{
	    	Buffer.prototype.toJSON = Buffer_toJSON ;
	  	}
	  }
	},
	_classNameToConstructor: {},
	addClassNameToConstructor: function ( className, clazz )
	{
		this._classNameToConstructor[className] = clazz ;
	},
	setTargetIsLocalHost: function ( state )
	{
		state = !! state ;
    this._visit ( this.body, function e_visit ( o )
    {
      if ( typeof o.setTargetIsLocalHost === 'function' )
      {
        o.setTargetIsLocalHost ( state ) ;
      }
    }) ;
  },
	visit: function ( visitor )
	{
		this._visit ( this, visitor ) ;
	},
	_visit: function ( obj, visitor )
	{
		for ( var key in obj )
		{
			var o = obj[key] ;
			if ( typeof o !== 'object' )
			{
				continue ;
			}
			if ( ! o )
			{
				continue ;
			}
			if ( visitor.call ( null, o ) === false )
			{
				return false ;
			}
			if ( this._visit ( o, visitor ) === false )
			{
				return false ;
			}
		}
	},
	/**
	 * Description
	 * @method deserialize
	 * @param {} serializedObject
	 * @param {} classNameToConstructor
	 * @param {} deepClassInspection
	 * @return that
	 */
	deserialize: function ( serializedObject, classNameToConstructor, deepClassInspection )
	{
	  var that, f ;
	  var obj = serializedObject ;
	  if ( deepClassInspection !== false ) deepClassInspection = true ;
	  if ( typeof serializedObject === 'string' )
	  {
			try
			{
		    obj = JSON.parse ( serializedObject ) ;
			}
			catch ( exc )
			{
				console.log ( serializedObject ) ;
				console.log ( exc ) ;
				throw exc ;
			}
	  }
	  if ( deepClassInspection )
	  {
		  if ( ! _Event_isBrowser )
		  {
		  	module.exports.prototype.deepDeserializeClass ( obj ) ;
		  }
		  else
		  {
		  	gepard.Event.prototype.deepDeserializeClass ( obj ) ;
		  }
	  }
	  if ( ! classNameToConstructor )
	  {
		  if ( ! _Event_isBrowser )
		  {
		  	classNameToConstructor = module.exports.prototype._classNameToConstructor ;
		  }
		  else
		  {
		  	classNameToConstructor = gepard.Event.prototype._classNameToConstructor ;
		  }
	  }
	  if ( obj.className && typeof obj.className === 'string' )
	  {
      var mcn = classNameToConstructor[obj.className] ;
      if ( mcn )
      {
        that = f = new mcn() ;
      }
      if ( ! f )
      {
	      f = eval ( obj.className ) ;
		    if ( typeof Object.create === 'function' )
		    {
			    that = Object.create ( f.prototype ) ;
		    }
		    else
		    {
			    /**
    			 * Description
    			 * @method F
    			 * @return 
    			 */
    			function F() { } ;
			    F.prototype = f.prototype ;
	    		that = new F();
	  		}
	    }

	    for ( var k in obj )
	    {
	      if ( ! obj.hasOwnProperty ( k ) ) continue ;
	      var o = obj[k] ;
	      if ( o && typeof o === 'object' )
	      {
	        if ( o.className && typeof o.className === 'string' )
	        {
	          that[k] = this.deserialize ( o ) ;
	          continue ;
	        }
	      }
	      that[k] = obj[k]  ;
	    }
	  }
  	return that ;
	},
	/**
	 * Description
	 * @method deepDeserializeClass
	 * @param {} obj
	 * @return 
	 */
	deepDeserializeClass: function ( obj )
	{
  	if ( ! obj ) return ;
  	for ( var k in obj )
  	{
    	if ( typeof obj.hasOwnProperty === 'function' )
    	{
	    	if ( ! obj.hasOwnProperty ( k ) ) continue ;
    	}
	    var o = obj[k] ;
  	  if ( ! o ) continue ;
    
	    if ( typeof o.type === 'string' )
	    {
	      if ( o.type === 'Date' )
	      {
	        obj[k] = new Date ( o.value ) ;
	        continue ;
	      }
	      if ( typeof Buffer !== 'undefined' )
	      {
		      if ( o.type === "Buffer" && Array.isArray ( o.data ) )
		      {
		        obj[k] = new Buffer ( o.data ) ;
		        continue ;
		      }
	      }
	      if ( ! _Event_isBrowser )
	      {
		      if ( o.type === 'Xml' )
		      {
		        var txml = require ( "Xml" ) ;
		        var f = new txml.XmlFactory() ;
		        obj[k] = f.create ( o.value ) ;
		        continue ;
		      }
	      }
	    }
	    if ( o.className && typeof o.className === 'string' )
	    {
	      var mcn = this._classNameToConstructor[o.className] ;
	      if ( mcn )
	      {
			    if ( typeof Object.create === 'function' )
			    {
				    obj[k] = that = Object.create ( mcn.prototype ) ;
				    for ( var kk in o )
				    {
				      if ( ! o.hasOwnProperty ( kk ) ) continue ;
				      var oo = o[kk] ;
				      if ( oo && typeof oo === 'object' )
				      {
				        if ( oo.className && typeof oo.className === 'string' )
				        {
				          that[kk] = this.deserialize ( oo ) ;
				          continue ;
				        }
				        if ( typeof oo.type === 'string' )
				        {
						      if ( oo.type === 'Date' )
						      {
						        that[kk] = new Date ( oo.value ) ;
						        continue ;
						      }
						      if ( typeof Buffer !== 'undefined' )
						      {
							      if ( oo.type === "Buffer" && Array.isArray ( oo.data ) )
							      {
							        that[kk] = new Buffer ( oo.data ) ;
							        continue ;
							      }
							    }
						      if ( ! _Event_isBrowser )
						      {
							      // if ( o.type === 'Xml' )
							      // {
							      //   var txml = require ( "Xml" ) ;
							      //   var f = new txml.XmlFactory() ;
							      //   obj[k] = f.create ( o.value ) ;
							      //   continue ;
							      // }
						      }
				        }
				      }
				      that[kk] = o[kk]  ;
				    }
			    }
	      }
	    }
	    if ( typeof o === 'object' )
	    {
	      this.deepDeserializeClass ( o ) ;
	    }
	  }
	},
	_init: function ( name, type, data )
	{
		this.className = "Event" ;
		this.name = "" ;
		this.type = "" ;
		this.setName ( name ) ;
		if ( type && typeof type === 'object' )
		{
			data = type ;
			type = "" ;
		}
		this.setType ( type ) ;
		this.user = null ;
		this.control = { createdAt: new Date(), plang: "JavaScript" } ;
		if ( data )
		{
			if ( typeof data === 'object' ) this.body = data ;
			else
			{
				this.body = {} ;
				this.body.data = data ;
			}
		}
		else this.body = {} ;
		if ( ! _Event_isBrowser )
		{
			var os = require ( "os" ) ;
			this._setHostname  ( os.hostname() ) ;
		}
	},
	/**
	 * Description
	 * @method getClassName
	 * @return MemberExpression
	 */
	getClassName: function()
	{
		return this.className ;
	},
	/**
	 * Description
	 * @method toString
	 * @return 
	 */
	toString: function()
	{
		return "(" + this.className + ")["
		+  "name=" + this.name
		+ ",type=" + this.type
		+ "]\n"
		+ ( this.user ? "[user=" + this.user + "]" : "" )
		+ "[control=" + this.toFullString ( this.control ) + "]\n"
		+ "[body=" + this.toFullString ( this.body ) + "]"
		;
	},
	toFullString: function ( text, indent )
	{
	  if ( ! indent ) indent = "" ;
	  if ( Array.isArray ( text ) || ( typeof ( text ) == 'object' && text ) )
	  {
	    var str = "" ;
	    if ( text.jsClassName && typeof ( text.toString ) == 'function' )
	    {
	      str += indent + text + "\n" ;
	      return ;
	    }
	    if ( typeof ( text.nodeType ) == 'number' && text.nodeName && typeof ( text.firstChild  ) )
	    {
	      str += indent + text + "\n" ;
	      return ;
	    }
	    for ( var key in text )
	    {
	      var p = text [ key ] ;
	      if ( typeof ( p ) == 'function' ) continue ;
	      if ( Array.isArray ( p ) || ( typeof ( p ) == 'object' && ! ( p instanceof Date ) ) )
	      {
	        str += indent + "\"" + key + "\": <br/>" + this.toFullString ( p, indent + "  " ) + "\n" ;
	        continue ;
	      }
	      str += indent + "\"" + key + "\": \"" + p + "\"\n" ;
	    }
	    return str ;
	  }
	  return String ( text ) ;
	},
	/**
	 * Description
	 * @method getCreatedAt
	 * @return MemberExpression
	 */
	getCreatedAt: function()
	{
  	return this.control.createdAt ;
	},
	/**
	 * Description
	 * @method setIsResult
	 * @return 
	 */
	setIsResult: function()
	{
  	this.control._isResult = true ;
	},
	/**
	 * Description
	 * @method isResult
	 * @return MemberExpression
	 */
	isResult: function()
	{
  	return this.control._isResult ;
	},
	/**
	 * Description
	 * @method setResultRequested
	 * @return 
	 */
	setResultRequested: function()
	{
  	this.control._isResultRequested = true ;
	},
		/**
	 * Description
	 * @method isResultRequested
	 * @return MemberExpression
	 */
	isResultRequested: function()
	{
  	return this.control._isResultRequested ;
	},
	setFailureInfoRequested: function()
	{
  	this.control._isFailureInfoRequested = true ;
	},
	isFailureInfoRequested: function()
	{
  	return this.control._isFailureInfoRequested ;
	},
	setStatusInfoRequested: function()
	{
  	this.control._isStatusInfoRequested = true ;
	},
	isStatusInfoRequested: function()
	{
  	return this.control._isStatusInfoRequested ;
	},
	setIsStatusInfo: function()
	{
  	this.control._isStatusInfo = true ;
	},
	isStatusInfo: function()
	{
  	return this.control._isStatusInfo ;
	},
	/**
	 * Description
	 * @method setIsBroadcast
	 * @return 
	 */
	setIsBroadcast: function()
	{
  	this.control._isBroadcast = true ;
	},
		/**
	 * Description
	 * @method isBroadcast
	 * @return MemberExpression
	 */
	isBroadcast: function()
	{
  	return this.control._isBroadcast ;
	},
	/**
	 * Description
	 * @method getSourceIdentifier
	 * @return MemberExpression
	 */
	getSourceIdentifier: function()
	{
  	return this.control.sourceIdentifier ;
	},
	/**
	 * Description
	 * @method setSourceIdentifier
	 * @param {} sourceIdentifier
	 * @return 
	 */
	setSourceIdentifier: function ( sourceIdentifier )
	{
  	this.control.sourceIdentifier = sourceIdentifier ;
	},
	setChannel: function ( channel )
	{
		if ( this.control.channel ) return ;
  	this.control.channel = channel ;
	},
	getChannel: function()
	{
  	return this.control.channel ;
	},
	/**
	 * Description
	 * @method getProxyIdentifier
	 * @return MemberExpression
	 */
	getProxyIdentifier: function()
	{
  	return this.control.proxyIdentifier ;
	},
	/**
	 * Description
	 * @method setProxyIdentifier
	 * @param {} proxyIdentifier
	 * @return 
	 */
	setProxyIdentifier: function ( proxyIdentifier )
	{
  	this.control.proxyIdentifier = proxyIdentifier ;
	},
	/**
	 * Description
	 * @method getWebIdentifier
	 * @return MemberExpression
	 */
	getWebIdentifier: function()
	{
  	return this.control.webIdentifier ;
	},
	/**
	 * Description
	 * @method setWebIdentifier
	 * @param {} webIdentifier
	 * @return 
	 */
	setWebIdentifier: function ( webIdentifier )
	{
  	this.control.webIdentifier = webIdentifier ;
	},
	/**
	 * Description
	 * @method getName
	 * @return MemberExpression
	 */
	getName: function()
	{
  	return this.name ;
	},
	/**
	 * Description
	 * @method setName
	 * @param {} name
	 * @return 
	 */
	setName: function ( name )
	{
  	this.name = name ? name : "" ;
	},
	/**
	 * Description
	 * @method getType
	 * @return MemberExpression
	 */
	getType: function()
	{
		return this.type ;
	},
	/**
	 * Description
	 * @method setType
	 * @param {} type
	 * @return 
	 */
	setType: function ( type )
	{
		if ( typeof type === 'undefined' ) type = "" ;
  	this.type = type ;
	},
	/**
	 * Description
	 * @method getBody
	 * @return {object} body
	 */
	getBody: function()
	{
		return this.body ;
	},
	/**
	 * Description
	 * @method setBody
	 * @param {object} data
	 * @return 
	 */
	setBody: function ( data )
	{
		if ( ! data ) return ;
		if ( typeof data !== 'object' )
		{
			throw new Error ( "Event.setBody(): Argument must be an object." ) ;
		}
		if ( data ) this.body = data ;
	},
	/**
	 * Description
	 * @method putValue
	 * @param {string} name
	 * @param {any} value
	 * @return 
	 */
	putValue: function ( name, value )
	{
		if ( ! name || typeof name !== 'string' )
		{
			throw new Error ( "Event.putValue(): name must be a string." ) ;
		}
		if ( typeof value === 'undefined' )
		{
			throw new Error ( "Event.putValue(): Missing value." ) ;
		}
		this.body[name] = value ;
	},
	/**
	 * Description
	 * @method removeValue
	 * @param {string} name
	 * @return 
	 */
	removeValue: function ( name )
	{
		if ( ! name || typeof name !== 'string' )
		{
			throw new Error ( "Event.removeValue(): name must be a string." ) ;
		}
		var v = this.body[name] ;
		delete this.body[name] ;
		return v ;
	},
	/**
	 * Description
	 * @method getValue
	 * @param {string} name
	 * @return {any} value
	 */
	getValue: function ( name )
	{
		if ( ! name || typeof name !== 'string' )
		{
			throw new Error ( "Event.getValue(): name must be a string." ) ;
		}
		return this.body[name] ;
	},
	/**
	 * Description
	 * @method getUser
	 * @return MemberExpression
	 */
	getUser: function()
	{
		return this.user ;
	},
	/**
	 * Description
	 * @method setUser
	 * @param {} u
	 * @return 
	 */
	setUser: function ( u )
	{
		this.user = u ;
	},
	/**
	 * Description
	 * @method getControl
	 * @return MemberExpression
	 */
	getControl: function()
	{
		return this.control ;
	},
	/**
	 * Description
	 * @method setUniqueId
	 * @param {} uid
	 * @return 
	 */
	setUniqueId: function ( uid )
	{
		if ( ! this.control.uniqueId )
		{
			this.control.uniqueId = uid ;
		}
	},
	/**
	 * Description
	 * @method getUniqueId
	 * @return MemberExpression
	 */
	getUniqueId: function()
	{
		return this.control.uniqueId ;
	},
	isInUse: function()
	{
		return !! this.control.isInUse ;
	},
	setInUse: function()
	{
		return this.control.isInUse = true ;
	},
	/**
	 * Description
	 * @method isBad
	 * @return BinaryExpression
	 */
	isBad: function()
	{
		if ( ! this.control ) return false ;
		if ( ! this.control.status ) return false ;
		if ( this.control.status.code === 'undefined' ) return false ;
		return this.control.status.code !== 0 ;
	},
	/**
	 * Description
	 * @method getStatus
	 * @return MemberExpression
	 */
	getStatus: function()
	{
		if ( ! this.control ) return ;
		return this.control.status ;
	},
	/**
	 * Description
	 * @method getStatusReason
	 * @return MemberExpression
	 */
	getStatusReason: function()
	{
		if ( ! this.control ) return ;
		if ( ! this.control.status ) return ;
		return this.control.status.reason ;
	},
	getStatusName: function()
	{
		if ( ! this.control ) return ;
		if ( ! this.control.status ) return ;
		return this.control.status.name ;
	},
	getStatusCode: function()
	{
		if ( ! this.control ) return ;
		if ( ! this.control.status ) return ;
		return this.control.status.code ;
	},
	setStatus: function ( code, name, reason )
	{
		if ( ! this.control ) this.control = {} ;
		this.control.status = {} ;
		if ( code )
		{
			code = parseInt ( code ) ;
		}
		if ( ! code )
		{
			code = 0 ;
		}
		this.control.status.code = code ;
		if ( name )
		{
			this.control.status.name = name ;
		}
		if ( reason )
		{
			this.control.status.reason = reason ;
		}
	},
	sendBack: function()
	{
		var c = this._Client ;
		this._Client = null ;
		delete this._Client ;
		c.sendResult ( this ) ;
	},
	getClient: function()
	{
		return this._Client ;
	},
	_setHostname: function ( hostName )
	{
		if ( ! this.control.hostName )
		{
			this.control.hostname = hostName ;
		}
	},
	/**
	 * Description
	 * @method _getHostname
	 * @param {} hostName
	 * @return {string} hostname
	 */
	getHostname: function()
	{
		return this.control.hostname ;
	}
};
if ( _Event_isBrowser )
{
	gepard.serialize = gepard.Event.prototype.serialize ;
	gepard.deserialize = gepard.Event.prototype.deserialize ;
 	gepard.Event.prototype._classNameToConstructor["Event"] = gepard.Event ;
	gepard.Event.prototype._classNameToConstructor.User = gepard.User ;
}
else
{
	module.exports = gepard.Event ;
 	gepard.Event.prototype._classNameToConstructor["Event"] = gepard.Event ;
	gepard.Event.prototype._classNameToConstructor.User = require ( "./User" ) ;
	if ( require.main === module )
	{
		var e = new gepard.Event ( 'ALARM', "TEST" ) ;
		var User = require ( "./User" ) ;
		var u = new User ( "smith", 4711, "secret" ) ;
		u.addRight ( "CAN_READ_FILES", "*.docx" ) ;
		e.setUser ( u ) ;
		var b = new Buffer ( "ABCDE" ) ;
		e.getBody().binaryData = b ;
		var str = e.serialize() ;
		console.log ( "str=" + str ) ;
		var o = gepard.Event.prototype.deserialize ( str ) ;
		console.log ( o ) ;
	}
	// gepard = undefined ;
}
