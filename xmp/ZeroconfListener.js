#!/usr/bin/env node

if ( require.main === module )
{
	var gepard = require ( "gepard" ) ;

	var name = gepard.getProperty ( "name", "ALARM,BLARM" ) ;
	if ( name.indexOf ( ',' ) > 0 )
	{
	  name = name.split ( ',' ) ;
	}
	else
	{
		name = [ name ] ;
	}
	var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service )
	{
		console.log ( "service.getTopics()=" + gepard.toString ( service.getTopics() ) ) ;
		console.log ( "service.getChannels()=" + gepard.toString ( service.getChannels() ) ) ;
		console.log ( "service.isLocalHost()=" + service.isLocalHost() ) ;
		if ( ! service.isReconnect() )
		{
			client.on ( name, (e) => { console.log ( e ) ; } ) ;
		}
		return true ;
	} ) ;
}
