## 1.3.3 (2015-08-31)
- introduce the FileReference class in JavaScript and Java for minimal load.
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