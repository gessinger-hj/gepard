/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:21:07
* @Last Modified by:   hg02055
* @Last Modified time: 2016-01-26 13:00:40
*/

'use strict';

var T     = require ( "./Tango" ) ;
var JSAcc = require ( "./JSAcc" ) ;

var BTaskRule = function ( taskHandler )
{
	this.taskHandler = taskHandler ;
};
BTaskRule.prototype._prolog = function ( task, originatorConnection )
{
	return this.prolog ( task, originatorConnection ) ;
};
BTaskRule.prototype._stepReturned = function ( task, responderConnection, originatorConnection )
{
	this.stepReturned ( task, responderConnection, originatorConnection ) ;
};
BTaskRule.prototype._epilog = function ( task, originatorConnection )
{
	this.epilog ( task, originatorConnection ) ;
};
BTaskRule.prototype.prolog = function ( task, originatorConnection )
{
};
BTaskRule.prototype.stepReturned = function ( task, responderConnection, originatorConnection )
{
};
BTaskRule.prototype.epilog = function ( task, originatorConnection )
{
};
module.exports = BTaskRule ;