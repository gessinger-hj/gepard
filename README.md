# gepard
General purpose communication and synchronization layer for distributed applications / events, semaphores, locks and messages for JavaScript, Java and Python


<!-- MarkdownTOC -->

- [Overview](#overview)
- [What is new](#what-is-new)
  - [Release 1.4.0 New Heartbeat Protocol to ensure the Availability of Connections](#release-140-new-heartbeat-protocol-to-ensure-the-availability-of-connections)
  - [Release 1.3.3 New FileContainer class for JavaScript and Java to simplify file-transfer.](#release-133-new-filecontainer-class-for-javascript-and-java-to-simplify-file-transfer)
  - [Release 1.3.0 Let's talk about Python](#release-130-lets-talk-about-python)
  - [Controlling Connections and Actions with a Hook](#controlling-connections-and-actions-with-a-hook)
  - [Perfect load balanced message handling.](#perfect-load-balanced-message-handling)
  - [Java bindings for all features:](#java-bindings-for-all-features)
- [Install](#install)
- [Getting Started](#getting-started)
  - [Base](#base)
  - [JavaScript](#javascript)
  - [Java](#java)
  - [Python](#python)
- [Configuration](#configuration)
- [Use Cases](#use-cases)
  - [Configuration Changes (Events)](#configuration-changes-events)
  - [Concurrent editing of a Dataset (Semaphores)](#concurrent-editing-of-a-dataset-semaphores)
  - [Synchronization of file processing (Locks)](#synchronization-of-file-processing-locks)
  - [A Nice Exotic Mixture of Programming Languages](#a-nice-exotic-mixture-of-programming-languages)
- [The Event Body](#the-event-body)
- [Examples](#examples)
  - [Examples Short](#examples-short)
    - [Event listener](#event-listener)
    - [Event Emitter](#event-emitter)
    - [Locks](#locks)
    - [Semaphores](#semaphores)
    - [Request / Result](#request--result)
      - [Send request](#send-request)
      - [Send result](#send-result)
  - [Examples Long](#examples-long)
    - [Event listener](#event-listener-1)
      - [In Application](#in-application)
      - [In Browser](#in-browser)
    - [Event Emitter](#event-emitter-1)
      - [In Application](#in-application-1)
      - [In Browser](#in-browser-1)
- [File Transfer with the FileContainer Class](#file-transfer-with-the-filecontainer-class)
  - [FileSender](#filesender)
  - [ileReceiver](#ilereceiver)
- [Heartbeat and Reconnection Capability Parameterization](#heartbeat-and-reconnection-capability-parameterization)
  - [Broker Side](#broker-side)
  - [Client Side](#client-side)
- [Technical Aspects of the Client](#technical-aspects-of-the-client)
- [Found a bug? Help us fix it...](#found-a-bug-help-us-fix-it)
- [https://github.com/gessinger-hj/gepard/blob/master/CHANGELOG.md](#httpsgithubcomgessinger-hjgepardblobmasterchangelogmd)
- [Contributors](#contributors)
- [Features](#features)
- [Changelog](#changelog)

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
import org.gessinger.gepard.Client ;
Client client = Client.getInstance ( [ port [, host ] ] ) ;

```

* Python:

```py
import gepard
client = gepard.Client.getInstance ( [ port [, host ] ] ) ;

```

Up to now a client is a standalone JavaScript program, a JavaScript app inside a browser, a Java program or a Python program.
In the next step clients for other languages like Php, Perl etc are planned.

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

## Release 1.4.0 New Heartbeat Protocol to ensure the Availability of Connections

Gepard is based on fast communication by means of always-open sockets. Therefore it is crucial to monitor these connections.
This is achieved by a mechanism which exchanges packets between the broker and all connected clients in fixed time intervals defined
by the broker. This interval is transmitted to clients as they connect.

<br/>
The broker sends a __PING__ message to the connected clients in each interval to which all clients are expected to respond with a __PONG__
message within the three next intervals. If no such response is received by the end of the third interval, the broker closes the connection-socket.

<br/>
On the other end, after dispatching a __PONG__ message, the client waits for the next __PING__ from the broker to arrive within 3 intervals.
In case the subsequent __PING__ is not received, the client closes the connection socket and emits a __"disconnect"__ event to signal the status to the application.

<br/>
If the client is configured to re-connect, it will try to establish a new connection to the broker in a pre-defined interval. On success, the client
will emit a __"reconnect"__ event to the application. All gepard-event-listeners which had been registered at the time of disconnect will then automatically be registered
with the broker again.

Example time-out conditions are:

- Broker restart after maintenance
- Backup time of a virtual machine
- Restart of a firewall

[Parameter and details](#heartbeat-and-reconnection-capability-parameterization)

## Release 1.3.3 New FileContainer class for JavaScript and Java to simplify file-transfer.

An instance of the __FileContainer__ class may be inserted at any place inside the body of an Event.
<br/>
If the client runs on the same machine as the broker only the full path-name of the file will be transferred.
<br/>
If the broker runs on a different machine the content of the file is read in as a byte-array and transferred as payload to the broker.
<br/>
If the broker detects a target on a different machine the file is read in and put into the event's body before sending the data.
<br/>
This is done on a per connection basis.
<br/>
[Details](#file-transfer-with-the-filecontainer-class)

## Release 1.3.0 Let's talk about Python

In this release a full featured Python client is included. The implementation is __pure generic Python code__.
The features are:

* emit event
* listen to events
* request / result ( messages )
* semaphores ( synchronously / asynchronously )
* locks

## Controlling Connections and Actions with a Hook

In order to control connections and actions a default hook class is provided:
[ConnectionHook](https://github.com/gessinger-hj/gepard/blob/master/src/ConnectionHook.js)

This class contains several methods which are called in appropriate cases:

```js
connect ( connection )
shutdown ( connection, event )
getInfoRequest ( connection, event )
addEventListener ( connection, eventNameList )
sendEvent ( connection, eventName )
lockResource ( connection, resourceId )
acquireSemaphore ( connection, resourceId )
```
Each of these methods must return an answer wether to allow or reject the corresponding action.
<br/>
The answer must be either a boolean value or a __Thenable__ which means a __Promise__ object of any kind.
<br/>
The default for shutdown is to return a __false__ value if the incoming connection is not from localhost.
In all other cases the default returns a __true__
<br/>
The parameter can be used to test the allowance in a deeper way.
<br/>
For example using a Promise for shutdown enables an asynchronous check with help of a database configuration.
<br/>
To configure this hook a __subclass__ of __ConnectionHook__ must be implemented and defined as user-hook in an JSON configuration file:

```json
{
  "connectionHook": "<path-to-javascript-code>/XmpConnectionHook"
}
```
This hook file is __require'd__ with the start of the broker.
<br/>
In this case the command to start the broker is:
<br/>
__<pre>gp.broker --config=&lt;full-config-file-name&gt;</pre>__

An example for a user defined hook is the [XmpConnectionHook.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/XmpConnectionHook.js) file:

```js
var util = require ( "util" ) ;
var ConnectionHook = require ( "gepard" ).ConnectionHook ;
var XmpConnectionHook = function()
{
  XmpConnectionHook.super_.call ( this ) ;
};
util.inherits ( XmpConnectionHook, ConnectionHook ) ;
XmpConnectionHook.prototype.connect = function ( connection )
{
  console.log ( "connection.getRemoteAddress()=" + connection.getRemoteAddress() ) ;
  return true ;
};
module.exports = XmpConnectionHook ;
```
If you prefer to start the broker from within your own JavaScript-program the configuration object can be set like:
```js
  var b = new Broker() ;
  b.setConfig ( <config-object or path to config-json-file> ) ;
  b.listen() ;
```
The parameter __connection__ in the above method-signatures is an internal used object with mainly the public useful methods:

1.  connection.isLocalHost()
1.  connection.getRemoteAddress()
1.  connection.getHostName()
1.  connection.getLanguage()
1.  connection.getApplicationName()
1.  connection.getApplication()
1.  connection.getId()

## Perfect load balanced message handling.

The use-case for request/respond is enhanced to a perfect load balancing.
<br/>
Suppose there are __n__ message-listeners offering the same service-name ( event-name )
<br/>
__m__ messages come in to the broker with __m__ = __n + 1__
<br/>
The following is done:

1.  the first __n__ messages are sent to the __n__ free listener for processing the request.
1.  the __m-th__ message is stored inside the broker waiting for any of the listeners sending back the response.
1.  after receiving the first message-response from any listener the waiting __m-th + 1__ message is sent to the now free listener.

As long as a sent message is not returned the Broker stores it in relation to the worker connection.
If this connection dies the stored message is sent back to the originator marked with the fail state and appropriate text.
The status can be tested with event.isBad() which returns true or false.

## Java bindings for all features:

* emit event
* listen to events
* request / result ( messages )
* semaphores
* locks

With this it is very easy to communicate or synchronize between JavaScript programs or webapps in a browser with a Java server or Java program.

The conversion from JSON to Java and vice versa is done with the Gson Google library for Java.

If you need special serialization / deserialization you may set the appropriate Gson instance in the Event-class statically with the method Event.setGson() ;

The Event-class may convert the json to map Java's byte[]-array to NodeJS's Buffer and vice versa.
This can be set statically by Event.mapByteArrayToJavaScriptBuffer ( boolean state ).
The default is true.


# Install

__npm install gepard__

or the newest stable but development version:

npm install git+https://github.com/gessinger-hj/gepard

# Getting Started

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

1.  __gp.emit --name=hello__ [--body='{"City":"Frankfurt"}']
    emit an event with name __hello__

1.  __gp.sem__<br/>
    Acquire a semaphore

1.  __gp.lock__<br/>
    Acquire a lock

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

<br/>
In order to try out the examples goto node_modules/gepard/xmp.
<br/>
The following examples exist:

* Listener.js
* Emitter.js
* EmitterWithBody.js
* EmitterWithStatusInfo.js
* Requester.js
* Responder.js
* Locker.js
* AsyncSemaphore.js

## Java

In order to try out the examples goto node_modules/gepard/java.
All examples are included in lib/Gepard.jar.
With the following command all examples can be executed:

```bash
java [-D<name>=<value>] -cp lib/Gepard.jar:lib/gson-2.3.1.jar org/gessinger/gepard/xmp/Listener
```

__Listener__ may be replaced by:

* Listener
* Emitter
* EmitterWithBody
* EmitterWithStatusInfo
* Requester
* Responder
* Locker
* AsyncSemaphore
* BlockingSemaphore

The class-version in the existing Gepard.jar is 1.6, so you need to have at least java 1.6 installed.
There is an ant file to build your own jar.

Options, e.g. for the event-name must be set in the common Java format: -Dname=hello

## Python

In order to try out the examples goto node_modules/gepard/python/xmp.

The following examples exist:

* Listener.py
* Emitter.py
* EmitterWithBody.py
* EmitterWithStatusInfo.py
* Requester.py
* Responder.py
* Locker.py
* AsyncSemaphore.py
* BlockingSemaphore.py

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

## Configuration Changes (Events)

Suppose you have 1 program that changes configuration-entries in a database-table.
After the new entries are committed the program sends an event with:

```js
client.emit ( "CONFIG-CHANGE" ) ;
```

Several clients do their work based on these data.<br/>

All clients including web-clients setup a listener for example with

```js
client.on ( "CONFIG-CHANGE", function callback(e) {} ) ;
```

## Concurrent editing of a Dataset (Semaphores)
Two users with their web browser want to edit the same user-data in a database.
In this case a Semaphore is very useful.

<br/>
Both do

```js
gepard.port = 17502 ;
var sem = new gepard.Semaphore ( "user:4711" ) ;
this.sem.acquire ( function sem_callback ( err )
{
  // we are owner
  fetch data, edit and save

  then:

  this.release() ; // with this statement the second user's browser app is callbacked
}) ;
```

## Synchronization of file processing (Locks)

Suppose there are many files in a directory waiting to be processed.
<br/>
Let's name the directory: foo/bar/input
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
## A Nice Exotic Mixture of Programming Languages

Suppose the following: There are a couple of JavaScript and Python programs to interact with a database. The database changes.
And it would be nice to not change modules for database access.
<br/>
Especially if the new database is an Oracle database. Perhaps on Linux.
<br/>
Everybody who had ever tried to install the appropriate NodeJS or Python module ended up in a mess of build, configuration and installation problems.
<br/>
One of the nicest Java features is the total abstraction of the database handling via the JDBC api.
<br/>
It is clear what to do: Use a Java Gepard client connected to a database and execute all simple REST kind of actions
via request/respond on the basis of Gepard.
<br/>
In this combination changing a database vendor is only a 10 second job changing the connection url and restart the Java client. Ok: another 5 seconds. But that's it.
<br/>
No compilation, no installation no problems.

# The Event Body
This member of an event is the holder for all payload-data. In all languages this is a hashtable with the restriction that the key must be
of type string.
<br/>
* Java: __Map&lt;String,Object&gt;__
* JavaScript: __{}__ or in long form: __Object__
* Python: __{}__ which is in fact an object of type __dict__

Setter and getter are the appropriate methods __Event.putValue(name,value)__ and __Event.getValue(name)__.
<br/>
__value__ is either a scalar type, a hashtable with strings as keys and valid object types, a list containing valid object types or a a combination of all valid types.
Thus a set of data like a tree can be used.
<br/>
__Note: Gepard's data exchange mechanism is NOT intended to transport serialized objects between clients.__
<br/>
The valid types are:
* scalar type objects: string, int, double, number
* array type objects:
  - Array ( [] )
  - List ( [] )
* hashtable type objects:
  - Java: Map&lt;String,Object&gt;
  - Python: dict ( {} )
  - JavaScript: Object ( {} )

There are 2 type of objects which are treated by gepard in a special way:
* dates
  - JavaScript: Date
  - Java: Date
  - Python: datetime.datetime
* bytes
  - JavaScript: Buffer
  - Java: byte[]
  - Python: bytearray, bytes ( bytes should not be used to send because in python < 3 bytes is a subclass of str, typeof byte == 'str'
    and thus cannot be detected by this mechanism)

In these cases an object is transferred from a generic class of a sender to the generic class of the receiver which means it is reconstructed in the target programming language.
<br/>
__Note on Python:__
<br/>
The built-in date class in python is not able to parse or format ISO date strings. In order to enable full interoperability related to dates
the gapard module tries to import the well known __dateutils__ module. This in turn imports the __six__ module. If these modules are in
python's module path the generic python date class can be used.
<br/>
Details in:

* JavaScript: [gepard/xmp/EmitterWithBody.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/EmitterWithBody.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/EmitterWithBody.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/EmitterWithBody.java)
* Python: [gepard/python/xmp/EmitterWithBody.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/EmitterWithBody.py)

# Examples

Ready to use examples for JavaScript are located in __.../gepard/xmp__
<br/>
Ready to use examples for Java are located in __.../gepard/gepard/java/org.gessinger/gepard/xmp__ and compiled in
__.../gepard/java/lib/Gepard.jar__
<br/>
Ready to use examples for Python are located in __.../gepard/python/xmp__

## Examples Short

### Event listener

Adding a event-listener with the __on()__ method may be done with a single event-name or a list of event-names.

__JavaScript__: client.on ( "ALARM", callback )
   <br/> or client.on ( [ "ALARM", "BLARM" ], callback )

__Java__: client.on ( "ALARM", callback )
 <br/>or client.on ( new String[] { "ALARM", "BLARM" }, callback )

__Python__: client.on ( "ALARM", callback )
<br/>or client.on ( [ "ALARM", "BLARM" ], callback )

The callback will be called with an Event object of the appropriate name ( e.getName() )


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
import org.gessinger.gepard.Client ;
import org.gessinger.gepard.EventListener ;
import org.gessinger.gepard.Event ;
Client client = Client.getInstance() ;

client.on ( "ALARM", new EventListener()
{
  public void event ( Event e )
  {
    System.out.println ( e ) ;
  }
} ) ;
```

Python

```python
import gepard
client = gepard.Client.getInstance()

def on_ABLARM ( event ):
  print ( "on_ALARM" )
  print ( event )

client.on ( "ALARM", on_ABLARM )
```

Details in:

* JavaScript: [gepard/xmp/Listener.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Listener.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Listener.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Listener.java)
* Python: [gepard/python/xmp/Listener.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/Listener.py)

### Event Emitter

Application

```js
var gepard = require ( "gepard" ) ;
var client = gepard.getClient() ;
client.emit ( "ALARM",
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
client.emit ( "CONFIG-CHANGED" ) ;
```

Java

```java
import org.gessinger.gepard.Client ;
Client client = Client.getInstance() ;
client.emit ( "ALARM" ) ;
```

Python

```python
import gepard
client = gepard.Client.getInstance()
client.emit ( "ALARM" )
```

Details in:

* JavaScript: [gepard/xmp/Emitter.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Emitter.js)
* JavaScript: [gepard/xmp/EmitterWithStatusInfo.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/EmitterWithStatusInfo.js)
* JavaScript: [gepard/xmp/EmitterWithBody.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/EmitterWithBody.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Emitter.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Emitter.java)
* Java: [gepard/java/org.gessinger/gepard/xmp/EmitterWithStatusInfo.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/EmitterWithStatusInfo.java)
* Java: [gepard/java/org.gessinger/gepard/xmp/EmitterWithBody.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/EmitterWithBody.java)
* Python: [gepard/python/xmp/Emitter.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/Emitter.py)
* Python: [gepard/python/xmp/EmitterWithStatusInfo.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/EmitterWithStatusInfo.py)
* Python: [gepard/python/xmp/EmitterWithBody.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/EmitterWithBody.py)

### Locks

Application

```js
  var gepard = require ( "gepard" ) ;
  var lock = new gepard.Lock ( "resid:main" ) ;
```
Browser

```js
gepard.port = 17502 ;
var lock = new gepard.Lock ( "resid:main" ) ;
```
Code

```js
lock.acquire ( function ( err )
{
  console.log ( this.toString() ) ;
  if ( this.isOwner() )
  {
    .........
    this.release() ;
  }
} ) ;
```

Java

```java
import org.gessinger.gepard.Lock ;
Lock lock = new Lock ( "resid:main" ) ;
lock.acquire() ;
if ( lock.isOwner() )
{
  .........
  lock.release() ;
}
```

Python

```python
import gepard

lock = gepard.Lock ( "resid:main" )
lock.acquire()

if lock.isOwner():
  ......................
  lock.release()

```

Details in:

* JavaScript: [gepard/xmp/Locker.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Locker.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Locker.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Locker.java)
* Python: [gepard/python/xmp/Locker.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/Locker.py)


### Semaphores

Application

```js
  var gepard = require ( "gepard" ) ;
  var sem = new gepard.Semaphore ( "user:4711" ) ;
```
Browser

```js
gepard.port = 17502 ;
var sem = new gepard.Semaphore ( "user:4711" ) ;
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

Asynchronously

```java
import org.gessinger.gepard.Semaphore ;
import org.gessinger.gepard.SemaphoreCallback ;
final Semaphore sem = new Semaphore ( "user:4711" ) ;
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

Synchronously

```java
import org.gessinger.gepard.Semaphore ;
final Semaphore sem = new Semaphore ( "user:4711" ) ;
// with or without a timeout
sem.acquire(5000) ;

if ( sem.isOwner() ) // if not timeout occured
{
    .....................
  sem.release() ;
}
```

Python

Asynchronously

```python
import gepard

def on_owner(sem):
  ................
  sem.release()

sem = gepard.Semaphore ( "user:4711" )
sem.acquire ( on_owner )
```

Synchronously

```python

import gepard

sem = gepard.Semaphore ( name )

sem.acquire ( 5 ) # with or without a timeout

if sem.isOwner():
  ...........
  sem.release()
```

Details in:

* JavaScript: [gepard/xmp/AsyncSemaphore.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/AsyncSemaphore.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/AsyncSemaphore.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/AsyncSemaphore.java)
* Java: [gepard/java/org.gessinger/gepard/xmp/AsyncSemaphore.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/BlockingSemaphore.java)
* Python: [gepard/python/xmp/AsyncSemaphore.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/AsyncSemaphore.py)
* Python: [gepard/python/xmp/BlockingSemaphore.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/BlockingSemaphore.py)

### Request / Result

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
import org.gessinger.gepard.Client ;
import org.gessinger.gepard.ResultCallback ;
import org.gessinger.gepard.Util ;
import java.util.List ;
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

Python

```python
import gepard

client = gepard.Client.getInstance()

def getFileList ( e ):
  if e.isBad():
    print ( e.getStatusReason() )
  else:
    print ( e.getValue ( "file_list" ) )
  e.getClient().close()

client.request ( "getFileList", getFileList )

```

Details in:

* JavaScript: [gepard/xmp/Requester.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Requester.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Requester.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Requester.java)
* Python: [gepard/python/xmp/Requester.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/Requester.py)

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
import org.gessinger.gepard.Client ;
import org.gessinger.gepard.EventListener ;
import org.gessinger.gepard.Event ;
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

Python

```python
import gepard
client = gepard.Client.getInstance()

fileList = [ "a.py", "b.py", "c.py" ] ;
def on_getFileList ( event ):
  print ( "Request in" ) ;
  print ( "File list out:" ) ;
  print ( fileList ) ;
  event.body["file_list"] = fileList ;
  event.sendBack() ;

client.on ( "getFileList", on_getFileList )
```

Details in:

* JavaScript: [gepard/xmp/Responder.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/Responder.js)
* Java: [gepard/java/org.gessinger/gepard/xmp/Responder.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/Responder.java)
* Python: [gepard/python/xmp/Responder.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/Responder.py)

## Examples Long

### Event listener

#### In Application

```js
var gepard = require ( "gepard" ) ;
var c = gepard.getClient() ;

var eventName = "ALARM" ;
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
c.emit ( event,
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
wc.emit ( event ) ;
```

# File Transfer with the FileContainer Class

The basic usage of this class is as follows:

## FileSender

JavaScript:
<br/>See also: [gepard/xmp/FileSender.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/FileSender.js)


```js
var gepard  = require ( "gepard" ) ;
var client = gepard.getClient() ;
var event = new gepard.Event ( "__FILE__" ) ;
var file = "<full-file-name>" ;
event.putValue ( "DATA", new gepard.FileContainer ( file ) ) ;
client.request ( event, function ( e )
{
  if ( e.isBad() )
  {
    console.log ( e.getStatus() ) ;
  }
  else
  {
    console.log ( "File " + file + " sent successfully." )
  }
  this.end() ;
}) ;
```

Python:
<br/>See also: [gepard/python/xmp/FileSender.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/FileSender.py)

```python
client = gepard.Client.getInstance()

event = gepard.Event ( "__FILE__" )

file = "<full-file-name>" ;
event.putValue ( "DATA", gepard.FileContainer ( file ) )

def result ( e ):
  if e.isBad():
    print ( e.getStatusReason() )
  else:
    print ( "File " + file + " sent successfully." )
  e.getClient().close()

print ( "Sending " + file )
client.request ( event, result )
```
Java:
<br/>See also: [gepard/java/org.gessinger/gepard/xmp/FileSender.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/FileSender.java)

```java
    final Client client = Client.getInstance() ;

    Event event = new Event ( "__FILE__" ) ;
    final String file = "<full-file-name>"
    event.putValue ( "DATA", new FileContainer ( file ) ) ;
    client.request ( event, new ResultCallback()
    {
      public void result ( Event e )
      {
        if ( e.isBad() )
        {
          System.out.println ( e ) ;
        }
        else
        {
          System.out.println ( "File " + file + " sent successfully." ) ;
          System.out.println ( "code: " + e.getStatusCode() );
          System.out.println ( "name: " + e.getStatusName() );
          System.out.println ( "reason: " + e.getStatusReason() );
        }
        client.close() ;
      }
    }) ;
```

##FileReceiver

JavaScript:
<br/>See also: [gepard/xmp/FileReceiver.js](https://github.com/gessinger-hj/gepard/blob/master/xmp/FileReceiver.js)

```js
  var client = gepard.getClient() ;
  client.on ( "__FILE__", function(e)
  {
    var data = e.removeValue ( "DATA" ) ;
    console.log ( data.getName() + " received." ) ;
    var fname = data.getName() + ".in" ;
    try
    {
      data.write ( fname ) ;
      console.log ( fname + " written." ) ;
    }
    catch ( exc )
    {
      e.control.status = { code:1, name:"error", reason:"could not write: " + fname } ;
      console.log ( exc ) ;
    }
    e.sendBack() ;
  });
```

Python:
<br/>See also: [gepard/python/xmp/FileReceiver.py](https://github.com/gessinger-hj/gepard/blob/master/python/xmp/FileReceiver.py)

```py
client = gepard.Client.getInstance()

def on___FILE__ ( e ):
  data = e.removeValue ( "DATA" )
  print ( data.getName() + " received." ) ;
  fname = data.getName() + ".in"
  try:
    data.write ( fname ) ;
    print ( fname + " written.")
  except Exception as exc:
    print ( exc )
  e.sendBack() ;

client.on ( "__FILE__", on___FILE__ )
```
Java:
<br/>See also: [gepard/java/org.gessinger/gepard/xmp/FileReceiver.java](https://github.com/gessinger-hj/gepard/blob/master/java/src/org/gessinger/gepard/xmp/FileReceiver.java)

```java
final Client client = Client.getInstance() ;
client.on ( "__FILE__", new EventListener()
{
  public void event ( Event e )
  {
    try
    {
      FileContainer fileContainer = (FileContainer) e.removeValue ( "DATA" ) ;
      String fname = fileContainer.getName() + ".in" ;
      fileContainer.write ( fname ) ;
      System.out.println ( fname + " written." );
      e.setStatus ( 0, "success", "File accepted." ) ;
    }
    catch ( Exception exc )
    {
      e.setStatus ( 1, "error", "File not saved." ) ;
      System.out.println ( Util.toString ( exc ) ) ;
    }
    try
    {
      e.sendBack() ;
    }
    catch ( Exception exc )
    {
      System.out.println ( Util.toString ( exc ) ) ;
    }
  }
} ) ;

```

# Heartbeat and Reconnection Capability Parameterization

## Broker Side

The default ping interval for the broker is 180000 milli-sec or 3 minutes. This value can be changed in three ways:

1.  Startup parameter: --gepard.heartbeat.millis=&lt;nnn>
1.  Evironment variable: GEPARD_HEARTBEAT_MILLIS=&lt;nnn>
1.  Variable in configuration-file: { "heartbeatMillis":&lt;nnn>

## Client Side

# Technical Aspects of the Client

NodeJS clients use the powerful but simple framework for asynchronously callbacks.
<br/>
In Java and Python this asynchronicity is modeled by threads. There is a single thread reading from the socket connected to the Broker.
Incoming events are dispatched and the appropriate callbacks are executed. The main thread is not affected.
<br/>
Thus any number of event listener may be registered or removed in the main thread.
<br/>
Synchronous callbacks are needed with Locks and Semaphores. In this case an id-based blocking message queue
is used for communication between the threads.
<br/>
Incoming events for asynchronous processing are propagated to separate running worker threads via a blocking fifo queue. Thus callbacks do not block each other. This applies to Java and Python.
<br/>
By default 2 threads are running. This can be changed with the method Client.setNumberOfCallbackWorker(). Maximum is 10.
<br/>
From this it is clear that all callback methods run in the context of one of the internal worker-threads and __not__ in the context of the main thread.
<br/>
Per default the internal thread is not a daemon thread. If needed this can be changed by calling the method
- Python: Client.setDaemon([True|False])
- Java: Client.setDaemon([true|false])

before the first action on a Client instance because the internal thread is started when the first connection is needed.

# Found a bug? Help us fix it...

We are trying our best to keep Gepard as free of bugs as possible, but if you find a problem that looks like a bug to you please follow these steps to help us fix it...

* Update Gepard and make sure that your problem also appears with the latest version of Gepard.

* Goto the [issue tracker](https://github.com/gessinger-hj/gepard/issues) to see if your problem has been reported already.
  If there is no existing bug report, feel free to create a new one. If there is an existing report, but you can give additional information,
  please add your data to this existing issue. If the existing issue report has already been closed,
  please only re-open it or comment on it if the same (or a closely related issue) re-appears,
  i.e., there is a high chance that the very same bug has re-appeared. Otherwise, create a new issue report.

* Whenever you create a new issue report in our issue tracker, please make sure to include as much information as possible like
  exceptions with text and stack trace or other log information.
  <br/>
  Having all the required information saves a lot of work.

#
https://github.com/gessinger-hj/gepard/blob/master/CHANGELOG.md

# Contributors
- Hans-Jürgen Gessinger
- Paul Gessinger

# Features
* High performance
* Minimal configuration with
  - __GEPARD_PORT__ 
	- __GEPARD_HOST__
* All JavaScript client features like event listener, event emitter, semaphores, locks and messages
	are available in any web-browser apps.
* All client features are also available for Java and Python

# Changelog
See [change log details](https://github.com/gessinger-hj/gepard/blob/master/CHANGELOG.md)