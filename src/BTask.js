/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-25 16:20:34
* @Last Modified by:   hg02055
* @Last Modified time: 2016-01-25 19:25:50
* File-name: BTask
*/

'use strict';

var Event = require ( "./Event" ) ;
var clone = require ( "clone" ) ;

var BTask = function ( event, taskHandler )
{
	this.jsClassName = "BTask" ;
	this.event       = event ;
	this.taskHandler = taskHandler ;
};
BTask.prototype.toString = function()
{
	return "(" + this.jsClassName + ")" ;
};
BTask.prototype.prolog = function()
{
	var i ;
	this.event.control.task = {} ;
	this.event.control.task.originalName = this.event.getName() ;
	this.event.control.task.stepIndex = -1 ;
	this.event.control.task.stepList = [] ;
	var taskConfigData = this.taskHandler.nameToTask[this.event.getName()] ;
	if ( ! taskConfigData )
	{
		this.setAuto ( true ) ;
	}
	else
	{
		for ( i = 0 ; i < taskConfigData.stepList.length ; i++)
		{
			this.event.control.task.stepList.push ( taskConfigData.stepList[i] ) ;
		}
		var stepName = this.event.control.task.stepList[0].name ;
		this.goto ( stepName ) ;
	}
};
BTask.prototype.epilog = function ()
{
	var task = this.event.control.task ;
	this.event.setName ( this.event.control.task.originalName ) ;
	delete task["nextStep"] ;
	delete task["originalName"] ;
};
BTask.prototype.isAuto = function()
{
	return this.event.control.task.auto ;
};
BTask.prototype.setAuto = function ( state )
{
	this.event.control.task.auto = !! state ;
};
BTask.prototype.saveCurrentStatusInSteplist = function()
{
  this.event.control.task.stepList[this.event.control.task.stepIndex].status = this.event.getStatus() ;
};
BTask.prototype.hasNextStepName = function()
{
	return !! this.event.control.task.nextStep ;
};
BTask.prototype.getEventName = function()
{
	return this.event.getName() ;
};
BTask.prototype.remove = function()
{
  delete this.event.control["task"] ;
};
BTask.prototype.gotoNextStep = function()
{
  this.event.control.task.stepIndex++ ;
  if ( this.event.control.task.stepIndex >= this.event.control.task.stepList.length )
  {
  	this.event.control.task.stepIndex = this.event.control.task.stepList.length - 1 ;
  	return ;
  }
  this.goto ( this.event.control.task.stepList[this.event.control.task.stepList.length-1].name ) ;
};
BTask.prototype.goto = function ( stepName )
{
	this.event.setName ( stepName ) ;
	this.event.control.task.nextStep = stepName ;
	if ( this.event.control.task.auto )
	{
		this.event.control.task.stepIndex++ ;
		this.event.control.task.stepList.push ( { name:this.event.getName() } ) ;
	}
	else
	{
		for ( var i = 0 ; i < this.event.control.task.stepList.length ; i++ )
		{
			if ( this.event.control.task.stepList[i].name === stepName )
			{
				this.event.control.task.stepIndex = i ;
				break ;
			}
		}
	}
};
BTask.prototype.sendAsNew = function ( nuName, nuStatus )
{
	var e = new Event ( nuName ) ;
	e.control = clone ( this.event.control ) ;
	e.body = clone ( this.event.body ) ;
 	e.control._isResultRequested = false ;
 	e.control._isResult = false ;
 	e.setStatus ( nuStatus.code, nuStatus.name, nuStatus.reason ) ;
  this.taskHandler.broker._sendEventToClients ( null, e ) ;
};
module.exports = BTask ;

if ( require.main === module )
{
  var T = require ( "./Tango" ) ;
}