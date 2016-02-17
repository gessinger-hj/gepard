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
	var s = findService ( {}, function cb ( service )
	{
// console.log ( service ) ;
		var port = service.port ;
		var host = service.host ;
		var txt = service.txt ;
		console.log ( "port=" + port ) ;
		console.log ( "host=" + host ) ;
		console.log ( txt ) ;
		execute ( port, host ) ;
		return true ;
	} ) ;
	// new gepard.Admin().isRunning ( function admin_is_running ( state )
	// {
	// 	if ( ! state )
	// 	{
	// 		console.log ( "Not running on " + this.getHostPort() ) ;
	// 		process.exit ( 1 ) ;
	// 	}
	// 	execute() ;
	// });
	function execute ( port, host )
	{
		var name = gepard.getProperty ( "name", "ALARM" ) ;
		var client = gepard.getClient ( port, host ) ;
		console.log ( "Listen for events with name=" + name ) ;
		client.on ( name, function(e)
		{
			console.log ( e ) ;
		});
	}
	function findService ( p, callback )
	{
		var Bonjour = require ( 'bonjour' ) ;

		if ( ! p ) p = {} ;
		if ( ! p.type ) p.type = 'gepard' ;

		var bonjour = new Bonjour()
		var browser = bonjour.find ( { type: p.type }, function cb_find ( service )
		{
			var rc = callback ( service ) ;
			if ( rc )
			{
			  browser.stop() ;
			}
		} ) ;
setTimeout ( function ()
{
	console.log ( "--------------------" ) ;
	browser.stop() ;
	bonjour.destroy() ;
},10000)
		// browser.on ( "up", function(service)
		// {
	 //  // if ( service.fqdn.indexOf ( "gepard" ) >= 0 )
	 //  	console.log('up:', service ) ;
		// });
		// browser.on ( "down", function(service)
		// {
		//   // if ( service.fqdn.indexOf ( "gepard" ) >= 0 )
		//   	console.log('down:', service.fqdn ) ;
		// });
	}
}
