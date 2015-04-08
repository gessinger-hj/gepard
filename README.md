# gepard
General purpose communication and synchronization layer for distributed applications / events, semaphores, locks and messages


<!-- MarkdownTOC -->

- [Overview](#overview)
- [What is new](#what-is-new)
- [Install](#install)
- [Getting Startet](#getting-startet)
  - [Base](#base)
  - [JavaScript](#javascript)
  - [Java](#java)
- [Configuration](#configuration)
- [Use Cases](#use-cases)
  - [Configuration Changes ( Events )](#configuration-changes--events-)
  - [Concurrent editing of a Dataset ( Semaphores )](#concurrent-editing-of-a-dataset--semaphores-)
  - [Synchronization of file processing ( Locks )](#synchronization-of-file-processing--locks-)
- [Examples](#examples)
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
- [Found a bug? Help us fix it...](#found-a-bug-help-us-fix-it)
  - [Contributors](#contributors)
  - [Features](#features)

<!-- /MarkdownTOC -->

# Overview
Gepard is a system consisting of a broker and connected clients.
The communication is done via sockets or web-sockets.
The sockets are always open so that any partner of a connection may be informed if this connection ended.
This is very useful in the area of semaphores and locks.
<br/>
A client uses only one socket for all interactions with the broker. Thus a program needs only 1 client for all features.
In order to use only 1 Client instance it is suggested to use the static method

* JavaScript: 

```js
gepard = require  ( "gepard" )  :
var client = gepard.getClient ( [ port [, host ] ] ) ;
```

* Java:

```java
Client client = Client.getInstance ( [ port [, host ] ] ) ;

```

Up to now a client is a standalone JavaScript program, a JavaScript app inside a browser or a Java programm.
In the next step clients for other languages like Python, Php etc are planned.

The broker can be instantiated from a JavaScript program but the most common and simplest way to use it is to start it detached as a daemon.

The appropriate command is:
```bash
node_modules/.bin/gp.broker
```
This starts the Broker and the corresponding web-socket-proxy
<br/>
If you want to start the broker alone:

```bash
node_modules/.bin/gp.broker.no.web
```

There is a separate program for administration purposes:
```bash
node_modules/.bin/gp.info
```
or
```bash
node_modules/.bin/gp.admin [ --help ]
```
# What is new

Java bindings for all features:

* emit event
* listen to events
* request / result ( messages )
* semaphores
* locks

With this it is very easy to communicate or synchronize between JavaScript programs or webapps in a browser with a Java server or Java program.

The conversion from JSON to Java and vica versa is done with the Gson Google library for Java.

If you need special serialization / deserialization you may set the appropriate Gson instance in the Event-class statically with the method Event.setGson() ;

The Event-class may convert the json to map Java's byte[]-array to NodeJS's Buffer and vica versa.
This can be set statically by Event.mapByteArrayToJavaScriptBuffer ( boolean state ).
The default is true.


# Install

__npm install gepard__

or the newest stable but development version:

npm install git+https://github.com/gessinger-hj/gepard

# Getting Startet

Here are some kind of "Hello World" examples.

All commands are in the directory: __node_modules/.bin__ or __node_modules/.bin/gepard__

Up to now the JavaScript and the Java classes are implemented.
<br/>
The examples show the nice and easy interaction between programs written in these different languages.

## Base
1.  __gp.broker<br/>__
    Start the gepard broker with websocket proxy

1.  __gp.shutdown<br/>__
    Stop the broker

1.  __gp.info<br/>__
    Show basic information from the broker

## JavaScript

1.  __gp.listen --name=hello<br/>__
    Start a listener for events named __hello__
    <br/>
    If you want to listen to all events with name starting with hello use a wildcard:
    <br/>
    __gp.listen "--name=hello*"__

1.  __gp.emit --name=hello<br/>__ [--body='{"City":"Frankfurt"}']
    emit an event with name __hello__

1.  If you want to play with the web-client implementation use the appropriate files in:
    __node_modules/gepard/xmp/webclient__
<br/>
To simplyfy this the command


```bash
gp.http.simple [options]
```

is supplied starting a simple js webserver detached.
Options are:

* --port=<port&gt;, default=8888
* --root=<web-root&gt;, default=node_modules/gepard/xmp/webclient
* --index=<index-file&gt;, default=index.html

Start your browser and go to: __localhost:8888__

1.  __gp.http.simple.shutdown__<br/>
    Stop the simple webserver.

1.  __gp.http.simple.is.running__<br/>
    Check if the simple webserver is running.

## Java

In order to try the examples goto node_modules/gepard/java.
All examples are included in lib/Gepard.jar.
With the following command all examples can be executed:

```bash
java [-D<name>=<value>] -cp lib/Gepard.jar:lib/gson-2.3.1.jar org/gessinger/gepard/xmp/Listener
```

__Listener__ may be replaced by:

* Listener
* Emitter
* Requester
* Responder
* Locker
* AsyncSemaphore
* BlockingSemaphore

The class-version in the existing Gepard.jar is 1.8, so you need to hava java 1.8 installed.
There is an ant file to build your own jar.

Options, e.g. for the event-name must be set in the common Java format: -Dname=hello

# Configuration

The communication is based on sockets. Thus only the port and optional the host must be specified to use Gepard.
The defaults are:

* port=17501
* host=localhost
* web-socket port=17502

The port, host and logging directory can be set either by
supplying these items

1. within creating an instance of Client or Broker in your code.

2. as startup arguments of your program as:
	- -Dgepard.port=<port&gt;
	- -Dgepard.host=<host&gt;
	- -Dgepard.log=<log-dir&gt;

3. with environmant variables of the form:
	- export ( or set ) GEPARD_PORT=<port&gt;
	- export ( or set ) GEPARD_HOST=<host&gt;
	- export ( or set ) GEPARD_LOG=<log-dir&gt;

# Use Cases

## Configuration Changes ( Events )

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

## Concurrent editing of a Dataset ( Semaphores )
Two user with their web browser want to edit the same user-data in a database.
In this case a Semaphore is very useful.

<br/>
Both do

```js
gepard.port = 17502 ;
var sem = new gepard.Semaphore ( "user:id:admin" ) ;
this.sem.acquire ( function sem_callback ( err )
{
  // we are owner
  fetch data, edit and save

  then:

  this.release() ; // with this statement the second user's browser app is callbacked
}) ;
```

## Synchronization of file processing ( Locks )

Suppose ther are many files in a directory waiting to be processed.
<br/>
Lets name the directory: foo/bar/input
<br/>
In order to speed up the overall processing several identical programs should work together.
<br/>
In this case Locks are very useful.
The following should be done:

```js
var fs     = require ( "fs" ) ;
var gepard = require ( "gepard" ) ;
var lock ;

var array = fs.readdirSync ( "foo/bar/input" ) ;
for ( var i = 0 ; i < array.length ; i++ )
{
	lock = new gepard.Lock ( array[i], function()
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

# Examples

Ready to use examles for JavaScript are located in __.../gepard/xmp__

## Examples Short

### Event listener

Application

```js
  var gepard = require ( "gepard" ) ;
  var client = gepard.getClient() ;
```
Browser

```js
  var client = gepard.getWebClient ( 17502 ) ;
```


Code

```js
client.on ( "ALARM", function event_listener_callback(e)
{
  console.log ( e.toString() ) ;
});
```

Java

```java
Client client = Client.getInstance() ;

client.on ( "ALARM", new EventListener()
{
  public void event ( Event e )
  {
    System.out.println ( e ) ;
  }
} ) ;
```

Details in:

* JavaScript: [gepard/xmp/Listener.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Listener.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Listener.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Listener.java)

### Event Emitter

Application

```js
var gepard = require ( "gepard" ) ;
var client = gepard.getClient() ;
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
var client = gepard.getWebClient ( 17502 ) ;
client.fire ( "CONFIG-CHANGED" ) ;
```

Java

```java
Client client = Client.getInstance() ;
client.emit ( "ALARM" ) ;
client.close() ;
```

Details in:

* JavaScript: [gepard/xmp/Emitter.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Emitter.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Emitter.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Emitter.java)

### Locks

Application

```js
  var gepard = require ( "gepard" ) ;
  var lock = new gepard.Lock ( "user:4711" ) ;
```
Browser

```js
gepard.port = 17502 ;
var lock = new gepard.Lock ( "user:4711" ) ;
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

Java

```java
Lock lock = new Lock ( "user:4711" ) ;
lock.acquire() ;
if ( lock.isOwner() )
{
  .........
  lock.release() ;
}
```

Details in:

* JavaScript: [gepard/xmp/Locker.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Locker.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Locker.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Locker.java)

### Semaphores

Application

```js
  var gepard = require ( "gepard" ) ;
  var sem = new gepard.Semaphore ( "user:10000" ) ;
```
Browser

```js
gepard.port = 17502 ;
var sem = new gepard.Semaphore ( "user:10000" ) ;
```

Code

```js
sem.acquire ( function ( err )
{
  console.log ( this.toString() ) ;

    .....................

  this.release() ;
} ) ;
```

Java

Asynchronous

```java
final Semaphore sem = new Semaphore ( "user:10000" ) ;
sem.acquire ( new SemaphoreCallback()
{
  public void acquired ( Event e )
  {
    System.out.println ( sem ) ;
    .....................
    sem.release() ;
  }
}) ;
```

or synchronous

```java

final Semaphore sem = new Semaphore ( "user:10000" ) ;
sem.acquire(5000) ;

if ( sem.isOwner() ) // if not timeout occured
{
    .....................
  sem.release() ;
}
```

Details in:

* JavaScript: [gepard/xmp/AsyncSemaphore.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/AsyncSemaphore.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/AsyncSemaphore.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/AsyncSemaphore.java)

### Request / result

#### Send request

Application:

```js
  var gepard = require ( "gepard" ) ;
  var client = gepard.getClient() ;
```
Browser:

```js
  var client = gepard.getWebClient ( 17502 ) ;
```
Code:

```js
client().request ( "getFileList"
, function result(e)
  {
    console.log ( e.getBody().list ) ;
    this.end() ;
  });
```

Java

```java
final Client client = Client.getInstance() ;
client.request ( "getFileList", new ResultCallback()
{
  public void result ( Event e )
  {
    if ( e.isBad() )
    {
      System.out.println ( "e.getStatusReason()=" + e.getStatusReason() ) ;
    }
    else
    {
      List<String> list = (List<String>) e.getBodyValue ( "file_list" ) ;
      System.out.println ( Util.toString ( list ) ) ;
    }
    client.close() ;
  }
}) ;

```

Details in:

* JavaScript: [gepard/xmp/Requester.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Requester.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Requester.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Requester.java)

#### Send result

Application:

```js
  var gepard = require ( "gepard" ) ;
  var client = gepard.getClient() ;
```
Browser:

```js
  var client = gepard.getWebClient ( 17502 ) ;
```
Code:

```js
var list = [ "one.js", "two.js", "three.js" ] ;
client.on ( "getFileList", function ( e )
{
  e.getBody().list = list ;
  e.sendBack() ;
});
```

Java

```java
final Client client = Client.getInstance() ;
client.on ( name, new EventListener()
{
  public void event ( Event e )
  {
    String[] fileList = new String[] { "a.java", "b.java", "c.java" } ;
    e.putBodyValue ( "file_list", fileList ) ;
    e.sendBack() ;
  }
} ) ;
```

Details in:

* JavaScript: [gepard/xmp/Responder.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Responder.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Responder.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Responder.java)

## Examples Long

### Event listener

#### In Application

```js
var gepard = require ( "gepard" ) ;
var c = gepard.getClient() ;

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
    var wc = gepard.getWebClient ( 17502 ) ;
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
var gepard  = require ( "gepard" ) ;
var c = gepard.getClient() ;

var event = new gepard.Event ( "CONFIG-CHANGED" ) ;
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
var wc = gepard.getWebClient ( 17502 ) ;
var event = new gepard.Event ( "CONFIG-CHANGED" ) ;
event.setBody ( { "config-name" : "app.conf" } ) ;
wc.fire ( event ) ;
```
# Found a bug? Help us fix it...

We are trying our best to keep Gepard as free of bugs as possible, but if you find a problem that looks like a bug to you please follow these steps to help us fix it...

* Update Gepard and make sure that your problem also appears with the latest version of Gepard.

* Goto the [issue tracker](https://github.com/gessinger-hj/gepard/issues) to see if your problem has been reported already.
  If there is no existing bug report, feel free to create a new one. If there is an existing report, but you can give additional information,
  please add your data to this existing issue. If the existing issue report has already been closed,
  please only re-open it or comment on it if the same (or a closely related issue) re-appears,
  i.e., there is a high chance that the very same bug has re-appeared. Otherwise, create a new issue report.

* Whenever you create a new issue report in our issue tracker, please make sure to include as much information as possible like
  exceptions with text and stack trace or other log informations.
  <br/>
  Having all the required information saves a lot of work.

## Contributors
- Hans-Jürgen Gessinger
- Paul Gessinger

## Features
* High performance
* Minimal configuration with
  - __GEPARD_PORT__ 
	- __GEPARD_HOST__
* All JavaScript client features like event listener, event emitter, semaphores, locks and messages
	are available in any web-browser apps.
* All client features are also available for Java