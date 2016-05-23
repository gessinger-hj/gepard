/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-03-01 12:48:16
* @Last Modified by:   Hans Jürgen Gessinger
* @Last Modified time: 2016-04-09 13:07:13
*/

var Service = function ( srv )
{
	this.name     = srv.name ;
	if ( this.name.indexOf ( '-' ) > 0 )
	{
		this.name = srv.name.substring ( 0, srv.name.indexOf ( '-' ) ) ;
	}
	this.type     = srv.type ;
	this.port     = srv.port ;
	this.host     = srv.host ;
	this.fqdn     = srv.fqdn ;
	this.topics   = srv.txt["topics"] ? srv.txt["topics"].split ( ',' ) : [] ;
	this.channels = srv.txt.channels ? srv.txt.channels.split ( ',' ) : [] ;
	this._isReconnect = false ;
};
Service.prototype.getName = function() { return this.name ; } ;
Service.prototype.getType = function() { return this.type ; } ;
Service.prototype.getPort = function() { return this.port ; } ;
Service.prototype.getHost = function() { return this.host ; } ;
Service.prototype.getTopics = function() { return this.topics ; } ;
Service.prototype.getChannels = function() { return this.channels ; } ;
Service.prototype.topicExists = function ( channel ) { return this.channels.indexOf ( channel ) >= 0 }
Service.prototype.topicExists = function ( topic ) { return this.topics.indexOf ( topic ) >= 0 }
Service.prototype.isReconnect = function() { return this._isReconnect ; } ;
Service.prototype.setIsReconnect = function ( state ) { this._isReconnect = state ; } ;
Service.prototype.toString = function()
{
	return "(Service)[name=" + this.name + ",type=" + this.type + ",host=" + this.host + ",port=" + this.port + "]" ;	
} ;
Service.prototype.isLocalHost = function()
{
	var os = require ( "os" ) ;
  if ( this.host.toUpperCase() === os.hostname().toUpperCase() )
  {
    return true ;
  }
  return false ;
};

module.exports = Service ;
