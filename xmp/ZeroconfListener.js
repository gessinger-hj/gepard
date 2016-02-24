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
	}
	// var client = new gepard.Client ( { type: 'test-gepard' }, function acceptService ( service )
	// var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service )
	// {
	// 	console.log ( service.txt ) ;
 //  	return new Promise  ( function ( resolve, reject )
	//   {
	//     if ( false )
	//     {
	//       reject() ;
	//       return ;
	//     }
	//     resolve() ;
	// 		console.log ( "Listen for events with name=" + name ) ;
	// 		client.on ( name, function(e)
	// 		{
	// 			console.log ( e ) ;
	// 		});
	//   });
	// }) ;
	// var client = gepard.getClient ( { type: 'test-gepard', timeout: 20000 }, function acceptService ( service )
	var client = gepard.getClient ( { type: 'test-gepard' }, function acceptService ( service )
	{
		console.log ( service.txt ) ;
		console.log ( "Listen for events with name=" + name ) ;
		client.on ( name, (e) => { console.log ( e ) ; } ) ;
		return true ;
	} ) ;
	// client.onConnect ( () =>
	// {
	// 	console.log ( "Listen for events with name=" + name ) ;
	// 	client.on ( name, function(e)
	// 	{
	// 		console.log ( e ) ;
	// 	});
	// });
}
