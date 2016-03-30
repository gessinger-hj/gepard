#!/usr/bin/env node

var gepard = require ( "gepard" ) ;

var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service )
{
	console.log ( "service.getTopics()=" + gepard.toString ( service.getTopics() ) ) ;
	console.log ( "service.getChannels()=" + gepard.toString ( service.getChannels() ) ) ;
	console.log ( "service.isLocalHost()=" + service.isLocalHost() ) ;
	if ( ! service.isReconnect() )
	{
		client.on ( "ALARM", (e) => { console.log ( e ) ; } ) ;
	}
	return true ;
} ) ;
