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