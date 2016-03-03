#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service, isReconnect )
{
	console.log ( service.txt ) ;
	client.setReconnect ( false ) ;
	client.emit ( name,
	{
	  write: function() // The event is sent -> end connection and exit
	  {
	    client.end() ;
	  }
	});
	return true ;
} ) ;
