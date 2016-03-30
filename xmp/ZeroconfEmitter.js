#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service )
{
	console.log ( "service.getTopics()=" + gepard.toString ( service.getTopics() ) ) ;
	console.log ( "service.getChannels()=" + gepard.toString ( service.getChannels() ) ) ;
	console.log ( "service.isLocalHost()=" + service.isLocalHost() ) ;

	client.setReconnect ( false ) ;
	client.emit ( "ALARM",
	{
	  write: function() // The event is sent -> end connection and exit
	  {
	    client.end() ;
	  }
	});
	return true ;
} ) ;
