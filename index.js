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
		if ( a[i] === "LogFile.js" )
		{
			/*
			var cn = a[i].substring ( 0, a[i].length - 3 ) ;
console.log ( "cn=" + cn ) ;
			gepard[cn+"-INSTANCE"] = fname ;
			gepard.__defineGetter__( "Log", function()
      {
				if ( gepard[cn+"-INSTANCE"] )
				{
console.log ( "fname=" + fname ) ;
					gepard[cn+"-INSTANCE"] = require ( fname ) ;
				}
				return gepard[cn+"-INSTANCE"]
			});
			continue ;
			*/
		}
		if ( fs.statSync ( fname ).isDirectory() ) continue ;
		var res = require ( fname ) ;
		if ( ! res )
		{
			continue ;
		}
		if ( res.ignore ) continue ;
		if ( res.enumerate )
		{
			for ( var k in res )
			{
				if ( k === "enumerate" )
				{
					continue ;
				}
				target[k] = res[k] ;
			}
		}
		else
		{
			var n = a[i].substring ( 0, a[i].indexOf ( '.' ) ) ;
			target[n] = require ( fname ) ;
		}
	}
	a.length = 0 ;
}

gepard._vetoHash = {} ;
for ( var k in this )
{
	gepard._vetoHash[k] = true ;
}
gepard._packageNames = {} ;

collectFiles ( gepard, "", d ) ;

gepard._displayLoadedModules = function ()
{
	var util = require ( "util" ) ;
	
	for ( var k in this )
	{
		if ( this._vetoHash[k] ) continue ;
		if ( k.indexOf ( "_" ) === 0 ) continue ;
		var o = this[k] ;
		if ( typeof o === 'string' || typeof o === 'boolean' || typeof o === 'number' )
		{
			continue ;
		}
		if ( o && typeof o === 'object' )
		{
			if ( this._packageNames[k] )
			{
				for ( var kk in o )
				{
					var oo = o[kk] ;
					process.stdout.write ( k + "." + kk ) ;
					if ( typeof oo === 'object' )
					{
						process.stdout.write ( "={}" ) ;
					}
					else
					if ( typeof oo === 'function' )
					{
						if ( util.inspect ( oo.prototype, { showHidden: false, depth: 0 } ) === "{}" )
						{
							process.stdout.write ( "=(Function)" ) ;
						}
						else
						{
							process.stdout.write ( "=(Class)" ) ;
						}
					}
					else
					{
						process.stdout.write ( "=" + util.inspect ( oo, { showHidden: false, depth: 0 } ) ) ;
					}
					process.stdout.write ( "\n" ) ;
				}
				continue ;
			}
		}
		process.stdout.write ( k ) ;
		if ( typeof o === 'object' )
		{
			process.stdout.write ( "={}" ) ;
		}
		else
		if ( typeof o === 'function' )
		{
			if ( util.inspect ( o.prototype, { showHidden: false, depth: 0 } ) === "{}" )
			{
				process.stdout.write ( "=(Function)" ) ;
			}
			else
			{
				process.stdout.write ( "=(Class)" ) ;
			}
		}
		else
		{
			process.stdout.write ( "=" + util.inspect ( o, { showHidden: false, depth: 0 } ) ) ;
		}
		process.stdout.write ( "\n" ) ;
	}
}

module.exports = gepard ;
