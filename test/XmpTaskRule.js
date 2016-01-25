var util = require ( "util" ) ;
var gepard = require ( "gepard" ) ;
var BTaskRule = gepard.BTaskRule ;

var XmpTaskRule = function()
{
	XmpTaskRule.super_.apply ( this, arguments ) ;
};
util.inherits ( XmpTaskRule, BTaskRule ) ;
XmpTaskRule.prototype.taskProlog = function ( task, originatorConnection )
{
	if ( task.getEventName() === "ack" )
	{
		task.goto ( "ack1" ) ;
	}
};
XmpTaskRule.prototype.stepReturned = function ( task, responderConnection, originatorConnection )
{
	if ( task.getEventName() === "ack1" )
	{
		task.goto ( "ack2" ) ;
	}
};
var clone = require ( "clone" ) ;
XmpTaskRule.prototype.taskEpilog = function ( task, originatorConnection )
{
	task.saveCurrentStatusInSteplist() ;
	task.sendAsNew ( "sink", { code:0, name:"success", "reason":"to-be-saved" } ) ;
};
module.exports = XmpTaskRule ;
