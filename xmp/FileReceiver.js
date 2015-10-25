#!/usr/bin/env node

if ( require.main === module )
{
	var gepard = require ( "gepard" ) ;

	if ( gepard.getProperty ( "help" ) )
	{
		console.log (
			"Gepard Examples: FileReceiver, listen to a __FILE__ request and save the incoming file.\n"
		+ "Usage: node FileReceiver\n"
		) ;
		process.exit() ;
	}

	new gepard.Admin().isRunning ( function admin_is_running ( state )
	{
		if ( ! state )
		{
			console.log ( "Not running on " + this.getHostPort() ) ;
			process.exit ( 1 ) ;
		}
		execute() ;
	});
	function execute()
	{
		var c = gepard.getClient() ;
		c.on ( "__FILE__", function(e)
		{
			var FR = e.removeValue ( "FR" ) ;
			console.log ( FR.getName() + " received." ) ;
			var fname = FR.getName() + ".in" ;
			try
			{
				FR.write ( fname ) ;
				console.log ( fname + " written." ) ;
			}
			catch ( exc )
			{
      	e.control.status = { code:1, name:"error", reason:"could not write: " + fname } ;
				console.log ( exc ) ;
			}
			e.sendBack() ;
		});
		c.on('end', function()
		{
			console.log('socket disconnected');
		});
		c.on('shutdown', function()
		{
			console.log('broker shut down');
		});
	}
}
