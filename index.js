var Path = require ( "path" ) ;
var fs = require ( "fs" ) ;
var util = require ( "util" ) ;

var d = Path.join ( __dirname, "/src/" ) ;
var gepard = require ( Path.join ( d, "./Tango" ) ) ;
gepard._Instances = {} ;

gepard.getClient = function ( port, host )
{
	var c ;
	if ( typeof port === 'object' && typeof host === 'function' )
	{
		var key = util.inspect ( port, { showHidden: false, depth: null } ) ;
		c = gepard._Instances[key] ;
		if ( c )
		{
			return c ;
		}
		c = new gepard.Client ( port, host ) ;
		gepard._Instances[key] = c ;
	}
	else
	{
		port = port ? port : undefined ;
		host = host ? host : undefined ;
		if ( ! port )
		{
			port = gepard.getProperty ( "gepard.port", "17501" ) ;
		}
		if ( ! host )
		{
			host = gepard.getProperty ( "gepard.host" ) ;
		}
		c = gepard._Instances["" + host + ":" + port] ;
		if ( c )
		{
			return c ;
		}
		c = new gepard.Client ( port, host ) ;
		gepard._Instances["" + host + ":" + port] = c 
	}
	var thiz = gepard ;
	c.on ( "end", function onend()
	{
		delete thiz._Instances["" + host + ":" + port] ;
	} ) ;
	c.on ( "disconnect", function ondisconnect()
	{
		delete thiz._Instances["" + host + ":" + port] ;
	} ) ;
	c.on ( "shutdown", function onend()
	{
		delete thiz._Instances["" + host + ":" + port] ;
	} ) ;
	c.on ( "error", function onend()
	{
		delete thiz._Instances["" + host + ":" + port] ;
	} ) ;

	return c ;
 }

function collectFiles ( target, packageName, dir )
{
	if ( packageName )
	{
		target[packageName] = {} ;
		target = target[packageName] ;
		gepard._packageNames[packageName] = true ;
	}
	var a = fs.readdirSync ( dir ) ;
	for ( var i = 0 ; i < a.length ; i++ )
	{
		if ( a[i] === "Tango.js" ) continue ;
		var fname = Path.join ( dir, a[i] ) ;
		if ( fs.statSync ( fname ).isDirectory() )
		{
			if ( a[i] !== "node_modules" )
			{
				collectFiles ( target, a[i], fname ) ;
				continue ;
			}
		}
		var proxyFunction = function ( fullName )
		{
			return function getterFunction () { return require ( fullName ) ; }
		};
		if ( a[i].indexOf ( ".js" ) !== a[i].length - 3 ) continue ;
		if ( fs.statSync ( fname ).isDirectory() ) continue ;

		var cn = a[i].substring ( 0, a[i].length - 3 ) ;
		var fn = proxyFunction ( fname ) ;
		target.__defineGetter__( cn, fn ) ;
	}
	a.length = 0 ;
}
gepard.exists = function ( name )
{
	return this[name] !== "undefined" ;
};

gepard._vetoHash = {} ;
for ( var k in this )
{
	gepard._vetoHash[k] = true ;
}
gepard._packageNames = {} ;

collectFiles ( gepard, "", d ) ;

module.exports = gepard ;
