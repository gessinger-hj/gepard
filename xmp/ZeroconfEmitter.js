#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var name   = gepard.getProperty ( "name", "ALARM" ) ;
var client = gepard.getClient ( 'test-gepard', function acceptService ( service )
{
	if ( service.getTopics().indexOf ( name ) < 0 )
	{
		return ;
	}
	client.emit ( name,
	{
	  write: function() // The event is sent -> end connection and exit
	  {
	    client.end() ;
	  }
	});
	return true ;
} ) ;
