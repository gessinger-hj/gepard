var util = require ( "util" ) ;
var gepard = require ( "gepard" ) ;
var BTaskRule = gepard.BTaskRule ;

var XmpTaskRule = function()
{
	XmpTaskRule.super_.call ( this, arguments ) ;
};
util.inherits ( XmpTaskRule, BTaskRule ) ;
XmpTaskRule.prototype.taskProlog = function ( event, originatorConnection )
{
	this.gotoStep ( event, "ack1" ) ;
};
XmpTaskRule.prototype.stepReturned = function ( event, responderConnection, originatorConnection )
{
	if ( event.getName() === "ack1" )
	{
		this.gotoStep ( event, "ack2" ) ;
	}
	// console.log ( event ) ;

//   if ( ! event.getName().startsWith ( "ack" ) )
//   {
//     return ;
//   }
//   console.log ( event.control ) ;
//   console.log ( "event.getName()=" + event.getName() ) ;
// T.lwhere (  ) ;
//   if ( event.getName() === "ack2" )
//   {
// T.lwhere (  ) ;
//     event.setName ( "ack" ) ;
//     return ;
//   }
// T.lwhere (  ) ;
//   var jsacc = new JSAcc ( event.control ) ;
//   jsacc.add ( "availableDecision/command", "goto" ) ;
//   jsacc.add ( "availableDecision/step", "ack2" ) ;
//   console.log ( event.control ) ;
//   return ;

	return true ;
};
module.exports = XmpTaskRule ;
