#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service, isReconnect )
{
	console.log ( service.txt ) ;
	console.log ( "Listen for events with name=" + name ) ;
	client.emit ( name,
	{
	  write: function() // The event is sent -> end connection and exit
	  {
	    this.end() ;
	  }
	});
	return true ;
} ) ;
