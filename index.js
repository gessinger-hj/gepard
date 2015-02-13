var Path = require ( "path" ) ;
var fs = require ( "fs" ) ;

var d = Path.join ( __dirname, "/src/" ) ;
var gepard = require ( Path.join ( d, "./Tango" ) ) ;

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
		if ( a[i].indexOf ( ".js" ) !== a[i].length - 3 ) continue ;
		if ( fs.statSync ( fname ).isDirectory() ) continue ;

		var cn = a[i].substring ( 0, a[i].length - 3 ) ;
		var str = "x=function() { return require ( '" + fname + "' ) ; }" ;
		var fn = eval ( str ) ;
		target.__defineGetter__( cn, fn ) ;
	}
	a.length = 0 ;
}
gepard.exists = function ( name )
{
	console.log ( this[name] ) ;
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
