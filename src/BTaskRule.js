/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:21:07
* @Last Modified by:   hg02055
* @Last Modified time: 2016-01-25 17:52:03
*/

'use strict';

var T     = require ( "./Tango" ) ;
var JSAcc = require ( "./JSAcc" ) ;

var BTaskRule = function ( taskHandler )
{
	this.taskHandler = taskHandler ;
};
BTaskRule.prototype._taskProlog = function ( task, originatorConnection )
{
	return this.taskProlog ( task, originatorConnection ) ;
};
BTaskRule.prototype._stepReturned = function ( task, responderConnection, originatorConnection )
{
	this.stepReturned ( task, responderConnection, originatorConnection ) ;
};
BTaskRule.prototype._taskEpilog = function ( task, originatorConnection )
{
	this.taskEpilog ( task, originatorConnection ) ;
};
BTaskRule.prototype.taskProlog = function ( task, originatorConnection )
{
};
BTaskRule.prototype.stepReturned = function ( task, responderConnection, originatorConnection )
{
};
BTaskRule.prototype.taskEpilog = function ( task, originatorConnection )
{
};
module.exports = BTaskRule ;