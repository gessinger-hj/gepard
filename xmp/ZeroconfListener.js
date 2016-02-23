#!/usr/bin/env node

if ( require.main === module )
{
	var gepard = require ( "gepard" ) ;

	if ( gepard.getProperty ( "help" ) )
	{
		console.log (
			"Gepard Examples: Listener, listen to a given event.\n"
		+ "Usage: node Listener [Options]\n"
		+ "Options: -Dname=<event-name>, default <event-name>=ALARM,BLARM\n"
		) ;
		process.exit() ;
	}
	var name = gepard.getProperty ( "name", "ALARM,BLARM" ) ;
	if ( name.indexOf ( ',' ) > 0 )
	{
	  name = name.split ( ',' ) ;
	}
	else
	{
		name = [ name ] ;
		// var client = gepard.getClient ( port, host ) ;
	}
	var client = new gepard.Client ( { type: 'test-gepard' }, function acceptService ( service )
	{
		console.log ( "port=" + service.port ) ;
		console.log ( "host=" + service.host ) ;
		console.log ( service.txt ) ;
		execute ( service.port, service.host ) ;
		return true ;
	} ) ;
	function execute ( port, host )
	{
		console.log ( "Listen for events with name=" + name ) ;
		client.on ( name, function(e)
		{
			console.log ( e ) ;
		});
	}
}
