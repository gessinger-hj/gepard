# gepard
General purpose communucation and synchronization layer for distributed applications / events, semaphores and messages

Gepard is a system consisting of a broker and connected clients.
The communication is done via sockets or web-sockets.
The sockets are always open so that any partner of a connection my be informed if this connection ended.
This is very useful in the area of semaphores and locks.

Up to now a client is a standalone JavaScript program or a JavaScript app inside a browser.
In the next step clients for other languages like Java, Python etc are planned.

The broker can be instantiated from a JavaScript program but the most common and simples way to use it is to
start it detached as a daemon.
The appropriate command is:
```bash
node_modules/.bin/gp.broker
```
There is a separate program for administration purposes:
```bash
node_modules/.bin/gp.info
```
or
```bash
node_modules/.bin/gp.admin
```

## Examples

### Event listener

var G = require ( "gepard" ) ;

var c = new G.Client() ;

var eventName = "ALARM" ;
	var c = new Client() ;
	console.log ( "Listen for events with name=" + name ) ;
	c.on ( name, function(e)
	{
	  console.log ( e ) ;
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



## Contributors
- Hans-Jürgen Gessinger
- Paul Gessinger

## Features
* High performance
* Minimal configuration with
	- GEPARD_PORT
	- [GEPARD_HOST]
* All client features like event listener, event emitter, semaphores, locks and messages
	are available in any web-browser apps.