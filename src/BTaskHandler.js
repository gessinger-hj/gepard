/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-21 12:13:13
* @Last Modified by:   hg02055
* @Last Modified time: 2016-01-26 12:59:43
*/

'use strict';

var fs    = require ( "fs" ) ;
var T     = require ( "./Tango" ) ;
var Log   = require ( "./LogFile" ) ;
var JSAcc = require ( "./JSAcc" ) ;
var BTask = require ( "./BTask" ) ;

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
	this.conf  = new JSAcc ( configuration ) ;
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
BTaskHandler.prototype.prolog = function ( event, originatorConnection )
{
	if ( ! this.tasks )
	{
		return ;
	}

	var task = new BTask ( event, this ) ;
	task.prolog() ;
	var ignore = this.rule._prolog ( task, originatorConnection ) ;
	if ( ignore === true )
	{
		task.remove() ;
	  return ;
	}
};
BTaskHandler.prototype.epilog = function ( event, originatorConnection )
{
	if ( ! event.control.task )
	{
		return ;
	}
	var task = new BTask ( event, this ) ;
	task.epilog() ;
	this.rule._epilog ( task, originatorConnection ) ;
	// delete event.control["task"] ;
};
BTaskHandler.prototype.stepReturned = function ( event, responderConnection, originatorConnection )
{
	if ( ! event.control.task )
	{
		return ;
	}
	delete event.control.task["nextStep"] ;
	if ( this.rule )
	{
		try
		{
			var task = new BTask ( event, this ) ;
			task.saveCurrentStatusInSteplist() ;
			if ( ! task.isAuto() )
			{
				task.gotoNextStep() ;
			}
			this.rule._stepReturned ( task, responderConnection, originatorConnection ) ;
			if ( task.hasNextStepName() )
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