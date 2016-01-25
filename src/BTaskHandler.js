/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:13:13
* @Last Modified by:   gess
* @Last Modified time: 2016-01-24 16:58:12
*/

'use strict';

var fs    = require ( "fs" ) ;
var T     = require ( "./Tango" ) ;
var Log   = require ( "./LogFile" ) ;
var JSAcc = require ( "./JSAcc" ) ;

var BTaskHandler = function ( broker )
{
	this.broker     = broker ;
	this.conf       = null ;
	this.ruleName   = null ;
	this.ruleFile   = null ;
	this.rule       = null ;
	this.nameToRule = {} ;
	this.tasks ;
	this.taskList ;
	this.nameToTask = {} ;
};
BTaskHandler.prototype.getBroker = function()
{
	return this.broker ;
};
BTaskHandler.prototype.init = function ( configuration )
{
	var i, t ;
// T.log ( configuration ) ;
	this.conf = new JSAcc ( configuration ) ;
	this.tasks = configuration.tasks ;
	if ( ! this.tasks )
	{
		return ;
	}
	this.ruleName = this.tasks.rule ;
	if ( this.ruleName )
	{
    this.ruleFile = this.ruleName.replace ( /\\/g, "/" ) ;
    if ( this.ruleFile.indexOf ( "/" ) !== 0 )
    {
      this.ruleFile = configuration.dir + "/" + this.ruleFile ;
    }
    if ( ! this.ruleFile.toLowerCase().endsWith ( ".js" ) )
    {
    	this.ruleFile += ".js" ;
    }
    var Rule = require ( this.ruleFile ) ;
    this.rule = new Rule ( this ) ;
	}
  if ( ! this.tasks.list || ! this.tasks.list.length )
  {
  	return ;
  }
  this.taskList = this.tasks.list ;
  for ( i = 0 ; i < this.taskList.length ; i++ )
  {
  	t = this.taskList[i] ;
  	this.nameToTask[t.name] = t ;
  }
};
BTaskHandler.prototype._taskProlog = function ( event, originatorConnection )
{
	if ( ! this.tasks )
	{
		return ;
	}

	event.control.task = {} ;
	event.control.task.originalName = event.getName() ;
	event.control.task.stepIndex = -1 ;
	event.control.task.stepList = [] ;
	if ( ! this.nameToTask[event.getName()] )
	{
		event.control.task.auto = true ;
	}
	var ignore = this.rule._taskProlog ( event, originatorConnection ) ;
	if ( ignore === true )
	{
	  delete event.control["task"] ;
	  return ;
	}
};
BTaskHandler.prototype._taskEpilog = function ( event, originatorConnection )
{
	if ( ! event.control.task )
	{
		return ;
	}
	var task = event.control.task ;
	event.setName ( task.originalName ) ;
	this.rule._taskEpilog ( event, originatorConnection ) ;
	// delete event.control["task"] ;
};
BTaskHandler.prototype.stepReturned = function ( event, responderConnection, originatorConnection )
{
	if ( ! event.control.task )
	{
		return ;
	}
	delete event.control.task["step"] ;
	if ( this.rule )
	{
		try
		{
			if ( event.control.task.auto )
			{
			  event.control.task.stepList[event.control.task.stepIndex].status = event.getStatus() ;
			}
			this.rule._stepReturned ( event, responderConnection, originatorConnection ) ;
			if ( event.control.task.step )
			{
  			event.control._isResult = false ;
			}
			else
			{
  			event.control._isResult = true ;
			}
		}
		catch ( exc )
		{
			Log.log ( exc ) ;
		}
	}
};
module.exports = BTaskHandler ;