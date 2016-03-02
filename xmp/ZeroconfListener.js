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
	var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service, isReconnect )
	{
		console.log ( service.txt ) ;
		if ( ! isReconnect )
		{
			client.on ( name, (e) => { console.log ( e ) ; } ) ;
		}
		return true ;
	} ) ;
}
