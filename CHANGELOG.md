## 1.9.2
- handle env HOME under cygwin

## 1.9.1
- WebSocketEventProxy: do not remove error-eventlistener on socket to prevent unhandled event.

## 1.9.0
-	fix python indentation error
-	publish new PHP client

## 1.8.5
- fix broken README

## 1.8.4
- bugfix for python: ignore entry __className__ in json-decode if class does not exist.

## 1.8.3
- bugfix for python: module resource in windows does not exist.

## 1.8.2
- Tango.js: usage of __let__ not allowed without "use strict"
						let replaced by var
- rearrange readme.md
- Tango.js: toRFC3339String() format millis < 10
- JavaScript re-connect
- WebClient accepts fully qualified URL to use a http(s)-proxy
- HttpSimple discovers wether a proxy is present.
- Python: timer thread no daemon for reconnect

## 1.8.1
- client.setReconnect() is overwritten by option/env if this is not set
- zeroconf: published service-name contains port=0

## 1.8.0
- GPWebClient: emit event "reconnect"
- LogFile: new redirction mode.
- Java Client: if reconnect == true and the Broker is not yet startet the client tries to connect all 5 seconds until the Broker is up.

## 1.7.9
- GPWebClient: reconnect

## 1.7.8
- GPWebClient: protected event-names for method on ( name, callback):
  "open", "close", "error", "shutdown", "end"
- WebSocket: use protocol wss only for https:
- GPWebClient: new method: close().
	Can be used with the browser's event __onbeforeunload__ to close a connection.

## 1.7.6
- Enable GPWebClient to optional use another target domain (host).

## 1.7.5
- JavaScript: if reconnect == true and the Broker is not yet startet and zeroconf is not activated the client tries to connect all 5 seconds until the Broker is up.
- JavaScript: mDNS via environment variables now works for simple JavaScript emitter (Emitter.js) by setting up an intermediate pending event list during service-lookup

## 1.7.4
- User(.js,.java,.py) attributes/language

## 1.7.3 (2016-07-13)
- check browser / node / node webkit
- setConfig() if Broker is instantiated from a JS script
- rename: index.js -> main.js
- package.json version, missing index.js

## 1.7.2 (2016-06-29)
- system flag for tracepoints

## 1.7.1 (2016-05-23)
- Removing hardcoded debug output

## 1.7.0 (2016-05-23)
- Zeroconv Python.

## 1.6.0 (2016-04-11)
- Zeroconv JavaScript.

## 1.5.0 (2016-02-04)
- Channels.

## 1.4.5 (2016-01-10)
- Wildcards in Event-names.

## 1.4.4 (2016-01-10)
- Some bugs and typos

## 1.4.3 (2016-01-08)
- Access, create and edit JSON-objects in all language flavors with the class __JSAcc__.

## 1.4.3 (2015-12-06)
- Java, JavaScript: TracePoint concept on client side: EVENT_IN, EVENT_OUT. Configurable at runtime.
	Trace-output optional to central log-file on the Broker side.

## 1.4.3 (2015-12-4)
- Java, JavaScript, Python: Client.log() available for logging in a central log-file on Broker side.

## 1.4.3 (2015-12-2)
- Broker: TracePoint concept: EVENT_IN, EVENT_OUT. Configurable at runtime. 

## 1.4.0 (2015-11-15)
- Java, Python: Introduce re-connection and re-installation af all client's listeners in case Broker was down/not reachable and is available again.

- JavaScript, Java, Python: configure reconnection-policy for a client with either
	* option: --gepard.reconnect=true
	* environment variable: export GEPARD_RECONNECT=true
	* client.setReconnect ( true ) before any socket connection is active
	* gepard.setProperty ( 'gepard.reconnect', 'true' )

	Default is reconnect=off

## 1.4.0 (2015-11-10)
- Java: configure reconnection-policy for a client with either
	* option: --gepard.reconnect=true
	* environment variable: export GEPARD_RECONNECT=true
	* client.setRecconnect ( "true" ) before any socket connection is active

	Default is reconnect=off

## 1.4.0 (2015-11-06)
- Broker: configure heartbeat-interval with:

	1.	parameter: --gepard.heartbeat.millis=&lt;millis>
	1.	environment: variable GEPARD_HEARTBEAT_MILLIS=&lt;millis>
	1.	config entry: "heartbeatMillis": &lt;millis>

## 1.4.0 (2015-11-05)
- JavaScript: configure reconnection-policy for a client with either
	* option: --gepard.reconnect=true
	* environment variable: export GEPARD_RECONNECT=true
	* client.setRecconnect ( true ) before any socket connection is active

	Default is reconnect=off

## 1.4.0 (2015-11-02)
- Introduce TracePoint concept into the Broker.
	Trace by trace-point name
- Change tracing of events online without restart.
- Change heartbeat-interval times online.

## 1.3.3 (2015-10-09)
- JavaScript: Introduce re-connection and re-installation af all client's listeners in case Broker was down/not reachable and is available again.

## 1.3.3 (2015-10-02)
- Introduce Heartbeat for all flavours.

## 1.3.3 (2015-09-30)
- Java: USERNAME in client-info visible to broker
- Python, JavaScript, Java: default user object in event created from client.USERNAME

## 1.3.3 (2015-09-29)
- Python: USERNAME in client-info visible to broker
- JavaScript: USERNAME in client-info visible to broker
- ConnectionHook: getUSERNAME()

## 1.3.3 (2015-09-02)
- introduce the FileContainer class in Python for minimal load.
- Python: getProperty() with optional default

## 1.3.3 (2015-08-31)
- introduce the FileContainer class in JavaScript and Java for minimal load.
- fix issue for Buffer.toJSON in node version <= 0.10

## 1.3.1 (2015-08-18)
- bugfix in HttpSimple.js example for websockets.
- bugfix in Broker, load balancing not perfect.

## 1.3.0 (2015-08-14)
- Java and Python: introduce internal worker-threads for non-blocking execution of callback methods.
programming langauage.

## 1.3.0 (2015-08-13)
- enable date and byte-array/bytes/Buffer objects to be transferred and reconstructed as generic objects of the receiver
programming langauage.

## 1.3.0 (2015-08-11)
- full featured Python client

## 1.2.4 (2015-07-22)
- implement removeEventListener() in Java and Python
- implement the shorter remove() in all flavours

## 1.2.4 (2015-07-22)
- fix a class mismatch in Event.java
	com.google.gson.internal.LinkedTreeMap cannot be cast to java.util.HashMap
- implement new status info for emit: broker returns success or failure

## 1.2.4 (2015-07-21)
- implement client.emit(), client.on(), client.request(), client.sendBack()
- create python classes for gepard: Event, User, Client, MultiMap

## 1.2.4 (2015-07-19)
- implement Java client.on() with array of strings as event-names of interest.
	public void on ( String[] eventNameList, EventListener el )
	
## 1.2.3 (2015-06-25)
- Enable connection hooks for different actions with boolean values or Promises.

## 1.2.2 (2015-04-22)
Bugfixes:
- fix an invalid reference in index.js causing an exception in client callbacks if Broker is down.
