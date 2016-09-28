#!/usr/bin/env node

var gepard = require ( "gepard" ) ;

if ( gepard.getProperty ( "help" ) )
{
	console.log (
		"Gepard Examples: Listener, listen to a given event.\n"
	+ "Usage: node Listener [Options]\n"
	+ "Options: -Dname=<event-name>, default <event-name>=ALARM,BLARM\n"
	+ "             use <event-name> to listen to\n"
	+ "         --help\n"
	+ "             print this text and exit.\n"
	) ;
	process.exit() ;
}

var name = gepard.getProperty ( "name" ) ;
if ( ! name )
{
	name = "ALARM,BLARM" ;
}
name = name.split ( ',' ) ;
var c = gepard.getClient() ;
c.setReconnect ( true ) ; // Reconnection requested
var tracePoint = c.registerTracePoint ( "BLARM_REMOVED" ) ;
c.on ( "reconnect", function on_reconnect ( e )
{
	console.log ( "reconnect/" + e.body.eventNameList ) ;
});
console.log ( "Listen for events with name=" + name ) ;
var func = function(e)
{
	if ( e.getName() === "BLARM" )
	{
		this.remove ( "BLARM" ) ;
		tracePoint.log ( "BLARM is removed." ) ;
	}
	console.log ( e ) ;
};
c.on ( name, func ) ;

c.on('end', function()
{
	console.log('socket disconnected');
});
c.on('shutdown', function()
{
	console.log('shutdown requested');
	this.setReconnect ( false ) ;
});
c.on('disconnect', function()
{
	console.log('disconnect: connection closed because heart-beat is missing' );
});
c.on('reconnect', function()
{
	console.log('reconnect: connection re-established');
});
c.on('error', function(e)
{
	// c.setReconnect ( false ) ; // if not to wait for starting Broker
	console.log(""+e);
});
c.onAction ( "kill", function ( cl, cmd )
{
	cmd.setResult ( "done") ;
	cl.end() ;
});
c.onAction ( "rmname", function ( cl, cmd )
{
	cmd.setResult ( "done") ;
	cl.remove ( name ) ;
});
c.onAction ( "rmfunc", function ( cl, cmd )
{
	cmd.setResult ( "done") ;
	cl.remove ( func ) ;
});
