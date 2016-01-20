/* 
* @Author: Hans Jürgen Gessinger
* @Date:   2016-01-19 12:50:43
*/

'use strict';

var ActionCmd = function ( cmd )
{
  this.cmd = cmd ;
  this.parameter = {} ;
  this.result = "" ;
};
ActionCmd.prototype =
{
  setResult: function ( text )
  {
    this.result = text ;
  },
  getCmd: function()
  {
    return this.cmd ;
  },
  getArgs: function()
  {
    return this.parameter.args ;
  }
};

module.exports = ActionCmd ;
