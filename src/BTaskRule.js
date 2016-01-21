/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:21:07
* @Last Modified by:   hg02055
* @Last Modified time: 2016-01-21 17:44:39
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
	this.taskProlog ( event, originatorConnection ) ;
};
BTaskRule.prototype._stepReturned = function ( event, responderConnection, originatorConnection )
{
	this.stepReturned ( event, responderConnection, originatorConnection ) ;
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
module.exports = BTaskRule ;