# gepard
General purpose communucation and synchronization layer for distributed applications / events, semaphores and messages

<!-- MarkdownTOC -->

- [Overview](#overview)
  - [Install](#install)
  - [Hello World](#hello-world)
  - [Configuration](#configuration)
  - [Use Cases](#use-cases)
    - [Configuration Changes ( Events )](#configuration-changes--events-)
    - [Concurrent editing of a Dataset ( Semaphores )](#concurrent-editing-of-a-dataset--semaphores-)
    - [Synchronization of file processing ( Locks )](#synchronization-of-file-processing--locks-)
  - [Examples Short](#examples-short)
    - [Event listener](#event-listener)
    - [Event Emitter](#event-emitter)
      - [Locks](#locks)
    - [Semaphores](#semaphores)
    - [Request / result](#request--result)
      - [Send request](#send-request)
      - [Send result](#send-result)
  - [Examples Long](#examples-long)
    - [Event listener](#event-listener-1)
      - [In Application](#in-application)
      - [In Browser](#in-browser)
    - [Event Emitter](#event-emitter-1)
      - [In Application](#in-application-1)
      - [In Browser](#in-browser-1)
  - [Contributors](#contributors)
  - [Features](#features)

<!-- /MarkdownTOC -->

# Overview
Gepard is a system consisting of a broker and connected clients.
The communication is done via sockets or web-sockets.
The sockets are always open so that any partner of a connection my be informed if this connection ended.
This is very useful in the area of semaphores and locks.

Up to now a client is a standalone JavaScript program or a JavaScript app inside a browser.
In the next step clients for other languages like Java, Python etc are planned.

The broker can be instantiated from a JavaScript program but the most common and simplest way to use it is to start it detached as a daemon.

The appropriate command is:
```bash
node_modules/.bin/gp.broker
```
or if you want to start the web-socket-proxy too:
```bash
node_modules/.bin/gp.broker.web
```

There is a separate program for administration purposes:
```bash
node_modules/.bin/gp.info
```
or
```bash
node_modules/.bin/gp.admin [ --help ]
```

## Install

npm install git+https://github.com/gessinger-hj/gepard

## Hello World
Here is the most loved "Hello World" example.

All commands are in the directory: node_modules/.bin

1.  __gp.broker<br/>__
    start the gepard broker
1.  __gp.listen --name=hello<br/>__
    start a listener for events named __hello__
1.  __gp.emit --name=hello<br/>__
    emit an event with name __hello__
1.  __gp.info<br/>__
    show basic information from the broker

If you want to play with the web-client implementation use the appropriate files in:
__node_modules/gepard/xmp/webclient__

## Configuration

The communication is based on sockets. Thus only the port and optional the host must be specified to use Gepard.
The defaults are:

* port=17501
* host=localhost
* web-socket port=17502

The port, host and logging directory can be set either by
supplying these items

1. within creating an istance of Client or Broker in your code.

2. as startup arguments of your program as:
	- -Dgepard.port=<port&gt;
	- -Dgepard.host=<host&gt;
	- -Dgepard.log=<log-dir&gt;

3. with environmant variables of the form:
	- export ( or set ) GEPARD_PORT=<port&gt;
	- export ( or set ) GEPARD_HOST=<host&gt;
	- export ( or set ) GEPARD_LOG=<log-dir&gt;

## Use Cases

### Configuration Changes ( Events )

Suppose you have 1 program that changes configuration-entries in a database-table.
After the new entries are committed the program sends an event with:

```js
client.fire ( "CONFIG-CHANGE" ) ;
```

Several clients do their work based on these data.<br/>

All clients including web-clients setup a listener for example with
```js
client.on ( "CONFIG-CHANGE", function callback(e) {} ) ;
```

### Concurrent editing of a Dataset ( Semaphores )
Two user with their web browser want to edit the same user-data in a database.
In this case a Semaphore is very useful.

<br/>
Both do

```js
var wc = tangojs.gp.getWebClient ( 17502 ) ;
var sem = wc.getSemaphore ( "user:id:admin" ) ;
this.sem.acquire ( function sem_callback ( err )
{
  if ( this.isOwner() )
  {
  	fetch data, edit and save

  	then:
    this.release() ; // with this statement the second user's browser app is callbacked
  }
}) ;
```

### Synchronization of file processing ( Locks )

Suppose ther are many files in a directory waiting to be processed.
<br/>
Lets name the directory: foo/bar/input
<br/>
In order to speed up the overall processing several identical programs should work together.
<br/>
In this case Locks are very useful.
The following should be done:

```js
var fs = require ( "fs" ) ;
var G  = require ( "gepard" ) ;
var lock ;

var array = fs.readdirSync ( "foo/bar/input" ) ;
for ( var i = 0 ; i < array.length ; i++ )
{
	lock = new G.Lock ( array[i], function()
	{
		try
		{
			if ( ! this.isOwner() ) return ;
			.............. process file ................
		}
		finally
		{
			this.release() ;
		}
	} ) ;
}

```

## Examples Short

### Event listener

Application

```js
  var G = require ( "gepard" ) ;
  var c = new G.Client() ;
```
Browser

```js
  var client = tangojs.gp.getWebClient ( 17502 ) ;
```

Code

```js
c.on ( "ALARM", function event_listener_callback(e)
{
  console.log ( e.toString() ) ;
});
```

### Event Emitter

Application

```js
var G = require ( "gepard" ) ;
var client = new G.Client() ;
client.fire ( "ALARM",
{
  var thiz = this ;
  write: function()
  {
    thiz.end() ; // close connection after written
  }
});
```

Browser

```js
var client = tangojs.gp.getWebClient ( 17502 ) ;
client.fire ( "CONFIG-CHANGED" ) ;
```

#### Locks

Application

```js
  var G = require ( "gepard" ) ;
  var lock = new G.Lock ( "user:4711" ) ;
```
Browser

```js
  var client = tangojs.gp.getWebClient ( 17502 ) ;
  var lock = client.getLock ( "user:4711" ) ;
```
Code

```js
lock.acquire ( function ( err )
{
  console.log ( this.toString() ) ;
  if ( this.isOwner() )
  {
    .........
    .........
    .........
    this.release() ;
  }
} ) ;
```

### Semaphores

Application

```js
  var G = require ( "gepard" ) ;
  var sem = new G.Semaphore ( "user:10000" ) ;
```
Browser

```js
var client = tangojs.gp.getWebClient ( 17502 ) ;
var sem = client.getSemaphore ( "user:10000" ) ;
```

Code

```js
sem.acquire ( function ( err )
{
  console.log ( this.toString() ) ;
  console.log ( "Is owner: " + this.isOwner() ) ;
  if ( this.isOwner() )
  {
    .....................
    .....................
    .....................
    this.release() ;
  }
} ) ;
```
### Request / result

##### Send request

Application:

```js
  var G = require ( "gepard" ) ;
  var client = new G.Client()
```
Browser:

```js
  var client = tangojs.gp.getWebClient ( 17502 ) ;
```
Code:

```js
client().request ( "getList"
, function result(e)
  {
    console.log ( e.getBody().list ) ;
    this.end() ;
  });
```

##### Send result

Application:

```js
  var G = require ( "gepard" ) ;
  var client = new G.Client()
```
Browser:

```js
  var client = tangojs.gp.getWebClient ( 17502 ) ;
```
Code:

```js
var list = [ "one", "two", "three" ] ;
client.on ( "getList", function ( e )
{
  e.getBody().list = list ;
  this.sendResult ( e ) ;
});
```

## Examples Long

### Event listener

#### In Application

```js
var G = require ( "gepard" ) ;

var c = new G.Client() ;

var eventName = "ALARM" ;
var c = new Client() ;
console.log ( "Listen for events with name=" + eventName ) ;
c.on ( eventName, function(e)
{
  console.log ( e ) ;
});
c.on('end', function()
{
  console.log('socket disconnected');
});
c.on('error', function ( event)
{
  console.log( event );
});
c.on('shutdown', function()
{
  console.log('broker shut down');
});
```

#### In Browser

```html
<script type="text/javascript" src="Event.js" ></script>
<script type="text/javascript" src="MultiHash.js" ></script>
<script type="text/javascript" src="GPWebClient.js" ></script>
```

```js
    var wc = tangojs.gp.getWebClient ( 17502 ) ;
    this.wc.on ( "open", function onopen()
    {
    }) ;
    this.wc.on ( "error", function onerror()
    {
    }) ;
    this.wc.on ( "close", function onclose()
    {
    }) ;
		wc.on ( "ALARM", function event_listener_callback ( e )
		{
		  console.log ( e.toString() ) ;
		}) ;
```

### Event Emitter

#### In Application

```js
var G  = require ( "gepard" ) ;

var c = new G.Client() ;

var event = new G.Event ( "CONFIG-CHANGED" ) ;
event.setBody ( { "config-name" : "app.conf" } ) ;
c.fire ( event,
{
  write: function() // close connection after write
  {
    c.end() ;
  }
});
```
#### In Browser

```html
<script type="text/javascript" src="Event.js" ></script>
<script type="text/javascript" src="MultiHash.js" ></script>
<script type="text/javascript" src="GPWebClient.js" ></script>
```
```js
var wc = tangojs.gp.getWebClient ( 17502 ) ;
var event = new tangojs.gp.Event ( "CONFIG-CHANGED" ) ;
event.setBody ( { "config-name" : "app.conf" } ) ;
wc.fire ( event ) ;
```


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