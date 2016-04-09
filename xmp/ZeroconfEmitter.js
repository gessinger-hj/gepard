#!/usr/bin/env node
var gepard = require ( "gepard" ) ;
var client = gepard.getClient ( 'test-gepard', function acceptService ( service )
{
	if ( service.getTopics().indexOf ( "ALARM" ) < 0 )
	{
		return ;
	}
	client.emit ( "ALARM",
	{
	  write: function() // The event is sent -> end connection and exit
	  {
	    client.end() ;
	  }
	});
	return true ;
} ) ;
