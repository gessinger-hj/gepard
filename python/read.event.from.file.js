var Event = require ( "Event.js")
var File = require ( "File.js")
var T = require ( "Tango.js")
if ( require.main === module )
{
  var fn = process.argv[2] ;
  var f = new File ( fn ) ;
  var json = f.getString() ;
// T.log ( json ) ;
	var e = new Event ( 'ALARM', "TEST" ) ;
	var b = new Buffer ( [1,2,3,4,5] ) ;
	e.getBody().binaryData = b ;
	var str = e.serialize() ;
	console.log ( "str=" + str ) ;
	var o = Event.prototype.deserialize ( json ) ;
	console.log ( o ) ; //.toString() ) ;
}
