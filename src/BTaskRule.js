/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:21:07
* @Last Modified by:   gess
* @Last Modified time: 2016-01-24 18:16:03
*/

'use strict';

var T     = require ( "./Tango" ) ;
var JSAcc = require ( "./JSAcc" ) ;

var BTaskRule = function ( taskHandler )
{
	this.taskHandler = taskHandler ;
};
BTaskRule.prototype._taskProlog = function ( event, originatorConnection )
{
	return this.taskProlog ( event, originatorConnection ) ;
};
BTaskRule.prototype._stepReturned = function ( event, responderConnection, originatorConnection )
{
	this.stepReturned ( event, responderConnection, originatorConnection ) ;
	if ( ! event.control.task.step )
	{
	  event.control._isResult = true ;
	}
};
BTaskRule.prototype._taskEpilog = function ( event, originatorConnection )
{
	this.taskEpilog ( event, originatorConnection ) ;
};
BTaskRule.prototype.taskProlog = function ( event, originatorConnection )
{
T.lwhere (  ) ;
};
BTaskRule.prototype.stepReturned = function ( event, responderConnection, originatorConnection )
{
T.lwhere (  ) ;
};
BTaskRule.prototype.taskEpilog = function ( event, originatorConnection )
{
T.lwhere (  ) ;
};
BTaskRule.prototype.gotoStep = function ( event, stepName )
{
	event.setName ( stepName ) ;
	event.control.task.step = stepName ;

	if ( event.control.task.auto )
	{
		event.control.task.stepIndex++ ;
		event.control.task.stepList.push ( { name:event.getName() } ) ;
	}
	else
	{
		for ( var i = 0 ; i < event.control.task.stepList.length ; i++ )
		{
			if ( event.control.task.stepList[i].name === stepName )
			{
				event.control.task.stepIndex = i ;
				break ;
			}
		}
	}
};
BTaskRule.prototype.sendEvent = function ( event )
{
	// body...
};
module.exports = BTaskRule ;