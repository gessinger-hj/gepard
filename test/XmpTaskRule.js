var util = require ( "util" ) ;
var gepard = require ( "gepard" ) ;
var BTaskRule = gepard.BTaskRule ;

var XmpTaskRule = function()
{
	XmpTaskRule.super_.apply ( this, arguments ) ;
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
		// this.gotoStep ( event, "ack2" ) ;
	}
};
var clone = require ( "clone" ) ;
XmpTaskRule.prototype.taskEpilog = function ( event, originatorConnection )
{
gepard.lwhere (  ) ;
console.log ( event ) ;
	var e = new gepard.Event ( "sink" ) ;
	e.control = clone ( event.control ) ;
	e.body = clone ( event.body ) ;
 	e.control._isResultRequested = false ;
 	e.control._isResult = false ;
console.log ( e.getStatus() ) ;
 	e.setStatus ( 0, "success", "to-be-saved" ) ;
console.log ( e ) ;
console.log ( "this.taskHandler=" + this.taskHandler ) ;
console.log ( "this.taskHandler.broker=" + this.taskHandler.broker ) ;
  this.taskHandler.broker._sendEventToClients ( null, e ) ;

};
module.exports = XmpTaskRule ;
