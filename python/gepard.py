#!/usr/bin/env python

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

from io import BytesIO

import json
import inspect
import time
import datetime
import socket
import sys
import os
import threading
import types
import numbers
import collections

dateutil_exists = False
try:
	import dateutil.parser
	dateutil_exists = True
except ImportError:
	pass

try:
	basestring
except NameError:
	basestring = str

import inspect

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
		self.name		= None
		self.type		= None
		self.user		= None
		self.control = None
		self.body		= None
		if isinstance ( name, dict ):
			obj = name
			self.className = self.__class__.__name__
			self.name = obj["name"]
			if 'user' in obj and obj["user"] != None:
				self.user = User ( obj["user"] )
			if 'type' in obj and obj["type"] != None:
				self.type = obj["type"]
			self.control = obj["control"]
			self.body = obj["body"]
			return

		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		if type != None and not isinstance ( type, basestring):
			raise ValueError ( "type must be None or a non empty string, not: " + str(type) + "(" + type.__class__.__name__ + ")" )

		self.className = self.__class__.__name__
		self.name = name
		self.type = type
		if body == None:
			self.body = {}
		elif isinstance ( body, dict ):
			self.body = body
		else:
			raise ValueError ( "body must be None or a dict, not: " + str(body) + "(" + body.__class__.__name__ + ")" )
		self.user = None
		self.control = { "createdAt": datetime.datetime.now(), "hostname": socket.gethostname(), "plang": "python" }

	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		s.write("[name='" + self.name + ",type='" + str(self.type) + "']\n" )
		s.write("  control:\n" )
		s.write("  " + str(self.control) )
		# s.write(",user=" + str(self.user) )
		if isinstance ( self.user, User ):
			s.write("\n  user:\n    " + str(self.user) )
		s.write("\n  body:\n  " + str(self.body) )
		s.write("]")
		return s.getvalue()
	def getBody(self):
		return self.body
	def getCreatedAt(self):
		return self.control["createdAt"]
	def getName ( self ):
		return self.name
	def getType ( self ):
		return self.type
	def setUser ( self, user ):
		self.user = user
	def getUser ( self ):
		return self.user
	def setBody(self,body):
		if not isinstance ( body, dict ):
			raise ValueError ( "body must be a dict, not: " + str(body) )
		self.body = body
	def getHostname ( self ):
		return self.control["hostname"]
	def putValue ( self, name, value ):
		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		self.body[name] = value
	def getValue ( self, name ):
		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		if name not in self.body:
			return None
		return self.body[name]
	def removeValue ( self, name ):
		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		if name not in self.body:
			return None
		obj = self.body[name]
		del self.body[name]
		return obj
	def getClient(self):
		return self._Client
	def sendBack(self):
		c = self._Client
		self._Client = None
		del self._Client
		c.sendResult ( self )

	def serialize(self):
		s = json.dumps ( self, default=self.toJSON )
		return s
	def setUniqueId ( self, uid ):
		if "uniqueId" in self.control and self.control["uniqueId"] != None:
			return
		self.control["uniqueId"] = uid
	def getUniqueId ( self ):
		if ( "uniqueId" in self.control ):
			return self.control["uniqueId"]
		return None

	def isBad ( self ):
		if "control" not in self.__dict__: return False
		if "status" not in self.control: return False
		if "code" not in self.control["status"]: return False
		return self.control["status"]["code"] != 0
	def getStatus ( self ):
		if "control" not in self.__dict__: return None
		return self.control["status"]
	def getStatusReason ( self ):
		if "control" not in self.__dict__: return None
		if "status" not in self.control: return None
		return self.control["status"]["reason"]
	def getStatusName ( self ):
		if "control" not in self.__dict__: return None
		if "status" not in self.control: return None
		return self.control["status"]["name"]

	def setIsResult ( self ):
		self.control["_isResult"] = True
	def isResult ( self ):
		if "_isResult" not in self.control: return False
		return self.control["_isResult"]
	def setResultRequested ( self ):
		self.control["_isResultRequested"] = True
	def isResultRequested ( self ):
		if "_isResultRequested" not in self.control: return False
		return self.control["_isResultRequested"]
	def setFailureInfoRequested(self):
		self.control["_isFailureInfoRequested"] = True
	def isFailureInfoRequested(self):
		if "_isFailureInfoRequested" not in self.control: return False
		return self.control["_isFailureInfoRequested"]
	def setStatusInfoRequested(self):
		self.control["_isStatusInfoRequested"] = True
	def isStatusInfoRequested(self):
		if "_isStatusInfoRequested" not in self.control: return False
		return self.control["_isStatusInfoRequested"]
	def isStatusInfo(self):
		if "_isStatusInfo" not in self.control: return False
		return self.control["_isStatusInfo"]

	@staticmethod
	def deserialize ( s ):
		obj = json.loads ( s, object_hook=Event.fromJSON )
		e = Event ( obj )
		return e

	@staticmethod
	def toJSON(obj):
		if isinstance ( obj, bytes ):
			return { 'type': 'Buffer'
						 , 'data': list(obj)
						 }
		if isinstance ( obj, bytearray ):
			return { 'type': 'Buffer'
						 , 'data': list(obj)
						 }
		if isinstance ( obj, datetime.datetime ):
			return { 'type': 'Date'
						 , 'value': obj.isoformat()
						 }
		if isinstance ( obj, Event ):
			juser = None
			if obj.user:
				juser = obj.user.toJSON()
			return { 'className': obj.className
						 , 'name':obj.name
						 , "type":obj.type
						 , "body":obj.body
						 , "control":obj.control
						 , "user":juser
						 }
		if hasattr ( obj, "toJSON" ) and callable ( getattr ( obj, "toJSON" ) ):
			m = getattr ( obj, "toJSON" )
			if m != None:
				o = obj.toJSON()
				return o
		raise TypeError ( repr(obj) + ' is not JSON serializable' )
	@staticmethod
	def fromJSON ( obj ):
		if 'type' in obj:
			if obj['type'] == 'time.asctime':
				return time.strptime(obj['data'])
			if obj['type'] == 'Date':
				if dateutil_exists:
					return dateutil.parser.parse(obj['value'])
				return obj['value']
			if obj['type'] == 'bytes':
				return bytes(obj['data'])
			if obj['type'] == 'Buffer':
				return bytes(obj['data'])
		if 'className' in obj:
			className = obj['className']
			if className != "Event":
				clazz = globals()[className]
				return clazz(obj)
		return obj

class User ( object ):
	def __init__ ( self, id, key=None, pwd=None, rights=None ):
		if isinstance ( id, dict ):
			obj = id
			self.className = self.__class__.__name__
			self.id = obj.get("id")
			self.key = obj.get("key")
			self._pwd = obj.get("_pwd")
			self.rights = obj.get("rights")
			return

		self.className = "User"
		self.id        = id
		self.key       = key
		self._pwd      = pwd
		self.rights = {}
		if rights == None:
			self.rights = {}
		elif isinstance ( rights, dict ):
			self.rights = rights
		else:
			raise ValueError ( "rights must be None or a dict, not: " + str(rights) + "(" + rights.__class__.__name__ + ")" )

	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		s.write("[id=" + self.id )
		s.write(",_pwd=" + "******" )
		s.write(",key=" + str(self.key) )
		s.write(",rights=" + str(self.rights) )
		s.write("]")
		return s.getvalue()

	def toJSON(self):
		return { 'className': self.className
					 , "id":self.id
					 , "key":self.key
					 , "_pwd":self._pwd
					 , "rights":self.rights
					 }
	def addRight ( self, name, value ):
		self.rights[name] = value
	def getRight ( self, name ):
		return self.rights[name]

import socket, struct

class CallbackWorker:
	def __init__(self,client):
		self.counter = 0
		self.client = client
	def run(self):
		while True:
			e = None
			callback = None
			try:
				e = self.client._CallbackIsolator.get()
				# print ( "counter=" + str(self.counter) )
				if e == None:
					break
			except Exception as exc:
				print ( exc )
				break
			try:
				e._Client = self.client
				if e.isStatusInfo():
					callback = self.client.callbacks.get ( e.getUniqueId() )
					if callback == None:
						print ( "No callback found for:\n" + e )
						continue
					if "status" in callback:
						del self.client.callbacks[e.getUniqueId()]
						callback["status"] ( e )
					continue
				if e.isBad():
					if e.isResult():
						callback = self.client.callbacks.get ( e.getUniqueId() )
						if callback == None:
							print ( "No callback found for:\n" + e )
							continue
					del self.client.callbacks[e.getUniqueId()]
					if e.isFailureInfoRequested() and "failure" in callback:
						callback["failure"] ( e )
					elif "error" in callback:
						callback["error"] ( e )
					elif "result" in callback:
						callback["result"] ( e )
					continue
				if e.isResult():
					callback = self.client.callbacks.get ( e.getUniqueId() )
					if callback == None:
						print ( "No callback found for:\n" + e )
						continue
					del self.client.callbacks[e.getUniqueId()]
					if "result" in callback:
						callback["result"] ( e )
					else:
						print ( "No result callback found for:\n" + e )
					continue
				functionList = self.client.eventListenerFunctions.get ( e.getName() )
				found = False
				for function in functionList:
					found = True
					function ( e )
					if e.isResultRequested():
						break
				if not found:
					print ( "listener function list for " + e.getName() + " not found." )
					print ( e )
			except Exception as exc:
				print ( exc )
			finally:
				if "_Client" in e.__dict__:
					e._Client = None
					del e._Client

class Client:
	counter = 0
	_Instances = {}
	@classmethod
	def getInstance ( clazz, port=None, host=None ):
		if host == None: host = util.getProperty ( "gepard.host", "localhost" )
		if port == None: port = util.getProperty ( "gepard.port", 17501 )
		key = str(port) + ":" + str(host)
		client = clazz._Instances.get ( key )
		if client != None:
			return client
		client = Client ( port, host )
		clazz._Instances[key] = client
		client._first = True
		return client

	def __init__(self, port=None, host=None):
		self._first                 = False
		self.infoCallbacks          = MultiMap()
		self.eventListenerFunctions = MultiMap()
		self.connected              = False
		self.sock                   = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		if host == None: host = util.getProperty ( "gepard.host", "localhost" )
		if port == None: port = util.getProperty ( "gepard.port", 17501 )
		port = int ( port )

		self.host = host
		self.port = port

		self.user                = None
		self.closing             = False
		self._workerIsDaemon     = False
		self.callbacks           = {}
		
		self.semaphores          = {}
		self._NQ_semaphoreEvents = NamedQueue()
		self._ownedResources     = {}
		self._NQ_lockEvents      = NamedQueue()
		self._CallbackIsolator   = SyncedQueue()
		self.numberOfCallbackWorker = 3

	def setDaemon(self,status=True):
		self._workerIsDaemon = status
	def createUniqueId(self):
		self.counter = self.counter + 1
		millis = round(time.time()*1000)
		return socket.gethostname() + "_" + str(os.getpid()) + "_" + str(millis) + "_" + str(self.counter)

	def setNumberOfCallbackWorker ( self, n ):
		if n > 0 and n < 10:
			self.numberOfCallbackWorker = n

	def onShutdown ( self, callback ):
		self.infoCallbacks.put ( "shutdown", callback )
	def onClose ( self, callback ):
		self.infoCallbacks.put ( "close", callback )
	def onError ( self, callback ):
		self.infoCallbacks.put ( "error", callback )

	def on ( self, eventNameList, callback ):
		if isinstance ( eventNameList, str ):
			eventNameList = [ eventNameList ]
		elif isinstance ( eventNameList, collections.Sequence ):
			pass
		else:
			raise Exception ( "eventNameList must be a string or an array of strings." )
		if len ( eventNameList ) == 0:
			raise  Exception ( "eventNameList must not be empty." )

		if not isinstance ( callback, types.FunctionType ):
			raise Exception ( "callback must be a function, not:" + str ( callback ) )

    # TDOO: synchronized ( "_LOCK" )
		for n in eventNameList:
			self.eventListenerFunctions.put ( n, callback )

		e = Event ( "system", "addEventListener" )
		if self.user != None:
			e.setUser ( user )
		e.body["eventNameList"] = eventNameList
		e.setUniqueId ( self.createUniqueId() )
		self._send ( e )

	def remove ( self, eventNameOrFunction ):
		self.removeEventListener ( eventNameOrFunction )
	def removeEventListener ( self, eventNameOrFunction ):
		if isinstance ( eventNameOrFunction, str ):
			eventNameOrFunction = [ eventNameOrFunction ]
		elif isinstance ( eventNameOrFunction, types.FunctionType ):
			eventNameOrFunction = [ eventNameOrFunction ]

		if isinstance ( eventNameOrFunction[0], str ):
			for name in eventNameOrFunction:
				self.eventListenerFunctions.remove ( name )
			e = Event ( "system", "removeEventListener" )
			if self.user != None:
				e.setUser ( user )
			e.body["eventNameList"] = eventNameOrFunction
			e.setUniqueId ( self.createUniqueId() )
			self._send ( e )
		elif isinstance ( eventNameOrFunction[0], types.FunctionType ):
			nameList = []
			for el in eventNameOrFunction:
				keys = self.eventListenerFunctions.getKeysOf ( el )
				for name in keys:
					nameList.append ( name )
					self.eventListenerFunctions.removeValue ( el )
			e = Event ( "system", "removeEventListener" )
			if self.user != None:
				e.setUser ( user )
			e.body["eventNameList"] = nameList
			e.setUniqueId ( self.createUniqueId() )
			self._send ( e )

	def _emit ( self, event_name, err, value=None):
		if value == None: value = ""
		function_list = self.infoCallbacks.get ( event_name )
		for fn in function_list:
			fn(err,value)
		return

	def connect(self):
		if self.connected: return
		try:
			self.sock.connect((self.host, self.port))
			self.connected = True
			l_onoff = 1                                                                                                                                                           
			l_linger = 0                                                                                                                                                          
			self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER,                                                                                                                     
                 struct.pack('ii', l_onoff, l_linger))
			if self.sock.getpeername()[0] == self.sock.getsockname()[0]:
				FileReference.targetIsLocalHost = True
			self._startCallbackWorker()
			self._startWorker()
		except IOError as e:
			self.connected = False
			self._emit ( "error", e )
			raise
		event                        = Event ( "system", "client_info" )
		event.body["language"]       = "python"
		event.body["hostname"]       = socket.gethostname()
		event.body["connectionTime"] = datetime.datetime.now()
		event.body["application"]    = os.path.abspath(sys.argv[0])
		if os.sep == '/':
			event.body["USERNAME"]    	 = os.environ.get ( "LOGNAME" )
		else:
			event.body["USERNAME"]    = os.environ.get ( "USERNAME" )

		self._send ( event ) 

	def _send ( self, event ):
		self.connect()
		event.setUniqueId ( self.createUniqueId() )
		self.sock.sendall ( event.serialize().encode ( "utf-8" ) )

	def request ( self, event, callback ):
		if isinstance ( callback, types.FunctionType ):
			callback = { "result": callback }
		elif isinstance ( callback, dict ):
			if callback.get ( "result" ) == None or not isinstance ( callback.result, types.FunctionType ):
				raise ValueError ( "callback must be a function or a dict containing a key='result' for a function-value, not: " + str(callback) )
		else:
			raise ValueError ( "callback must be a function or a dict containing a key='result' for a function-value, not: " + str(callback) )
		self.emit ( event, callback )

	def sendResult(self,event):
		if not event.isResultRequested():
			print ( "No result requested" )
			print ( event )
			raise Exception ( "No result requested" )
		event.setIsResult()
		event._Client = None
		del event._Client
		self._send ( event )

	def emit ( self, event, type=None, **kwargs ):
		callback = None
		e = event
		map = kwargs
		if isinstance ( event, str ):
			if kwargs == None:
				e = Event ( event, type )
			elif isinstance ( type, str ):
				e = Event ( event, type )
			elif isinstance ( type, dict ):
				map = type
				e = Event ( event )
			elif "type" in kwargs:
				e = Event ( event, kwargs["type"] )
			else:
				e = Event ( event, type )
		elif isinstance ( event, Event ):
			if isinstance ( type, dict ):
				map = type
		if map != None:
			callback = {}
			for key in map:
				if   key == "failure": e.setFailureInfoRequested()
				elif key == "status" : e.setStatusInfoRequested()
				elif key == "result" : e.setResultRequested()
				elif key == "error"  : e.setResultRequested()
				callback[key] = map.get ( key )
		self._send ( e )
		# print	( e )
		if callback != None:
			self.callbacks[e.getUniqueId()] = callback

	def _startWorker ( self ):
		t = threading.Thread(target=self._worker )
		t.setDaemon ( self._workerIsDaemon )
		t.start()
		return

	def _startCallbackWorker(self):
		for i in range ( 0, self.numberOfCallbackWorker ):
			cr = CallbackWorker(self)
			cr.counter = i
			cr = threading.Thread(target=cr.run )
			cr.setDaemon ( True )
			cr.start()

	def close ( self ):
		if self.sock != None:
			try:
				self.closing = True
				self.connected = False
				self.sock.shutdown ( socket.SHUT_RDWR )
				self.sock.close()
			except Exception as exc:
				print ( exc )
		self.infoCallbacks.clear()
		# eventListenerFunctions.clear()
		key = str(self.port) + ":" + str(self.host)
		if key in self._Instances:
			del self._Instances[key]
		self.sock = None
		self._emit ( "close", None )

	def readNextJSON(self):
		uid = self.createUniqueId()
		bytes = BytesIO()
		k = 0
		lastWasBackslash = False
		q = 0
		pcounter = 0
		while True:
			c = self.sock.recv(1)
			if c == b'':
				self.connected = False
				exc = IOError ( "socket connection broken" )
				self._emit ( "close", exc )
				raise exc
			bytes.write ( c )
			if ( c == b'"' or c == b'\'' ):
				q = c
				while True:
					c = self.sock.recv(1)
					bytes.write ( c )
					if ( c == q ):
						if ( lastWasBackslash ):
							lastWasBackSlash = True
							continue
					break
			if ( c == b'{' ):
				pcounter = pcounter + 1
				continue
			if ( c == b'}' ):
				pcounter = pcounter - 1
				if ( pcounter == 0 ):
					break
			if ( c == b'\\' ):
				lastWasBackSlash = True
		s = bytes.getvalue().decode ( 'utf-8' )
		e = Event.deserialize ( s )
		# print ( e )
		return e

	def _worker(self):
		while True:
			try:
				e = self.readNextJSON()
				# print ( e )
				if e.getName() == 'system':
					if e.getType() != None and e.getType() == "shutdown":
						self._emit ( "shutdown", None, None )
						break
					if e.getType() == "acquireSemaphoreResult":
						body = e.getBody()
						resourceId = body.get ( "resourceId" )
						sem = self.semaphores.get ( resourceId )
						if sem.hasCallback():
							sem._isSemaphoreOwner = True
							sem.callback ( sem )
						else:
							if self._NQ_semaphoreEvents.isWaiting ( sem.resourceId ):
								self._NQ_semaphoreEvents._returnObj ( resourceId, e )
							else:
								sem.release()
						continue
					if e.getType() == "releaseSemaphoreResult":
						continue

					if e.getType() == "lockResourceResult":
						body = e.getBody()
						resourceId = body.get ( "resourceId" )
						self._NQ_lockEvents._returnObj ( resourceId, e )
						continue
					if e.getType() == "unlockResourceResult":
						continue
					continue
				self._CallbackIsolator.put ( e )
			except Exception:
				break

	def acquireLock ( self, lock ):
		if lock.resourceId in self._ownedResources:
			print ( "acquire lock: already owner of resourceId=" + lock.resourceId )
			return
		self._ownedResources[lock.resourceId] = lock
		e = Event ( "system", "lockResourceRequest" )
		body = e.getBody()
		body["resourceId"] = lock.resourceId
		e.setUniqueId ( self.createUniqueId() )
		self._send ( e )
		e = self._NQ_lockEvents.get ( lock.resourceId )
		body = e.getBody()
		resourceId = body.get ( "resourceId" )
		lock = self._ownedResources.get ( resourceId )
		lock._isLockOwner = body.get ( "isLockOwner" )
	def releaseLock ( self, lock ):
		if lock.resourceId not in self._ownedResources:
			print ( "release lock: not owner of resourceId=" + lock.resourceId )
			return
		del self._ownedResources[lock.resourceId]
		e = Event ( "system", "unlockResourceRequest" )
		body = e.getBody()
		body["resourceId"] = lock.resourceId
		e.setUniqueId ( self.createUniqueId() )
		self._send ( e )

	def semaphoreTimeoutCallback(self,sem):
		if self._NQ_semaphoreEvents.isWaiting ( sem.resourceId ):
			try:
				sem.release()
				del self.semaphores[sem.resourceId]
				e = Event ( "system", "acquireSemaphoreResult" )
				body = e.getBody()
				body["resourceId"] = sem.resourceId
				body["isSemaphoreOwner"] = False
				sem.timeoutSeconds = 0
				sem.timeoutOccurs = True
				self._NQ_semaphoreEvents._returnObj ( sem.resourceId, e )
			except Exception as e:
				print ( e )

	def acquireSemaphore ( self, sem ):
		if sem.resourceId in self.semaphores:
			s = self.semaphores.get ( sem.resourceId )
			if s.isOwner():
				print ( "Client.acquireSemaphore: already owner of resourceId=" + sem.resourceId )
			else:
				print ( "Client.acquireSemaphore: already waiting for ownership owner of resourceId=" + sem.resourceId )
			return

		self.semaphores[sem.resourceId] = sem
		e = Event ( "system", "acquireSemaphoreRequest" )
		body = e.getBody()
		body["resourceId"] = sem.resourceId
		self._send ( e )
		if not sem.hasCallback():
			if sem.timeoutSeconds > 0:
				sem._Timer = threading.Timer ( sem.timeoutSeconds, self.semaphoreTimeoutCallback, [ sem ] )
				sem._Timer.start()
			e = self._NQ_semaphoreEvents.get ( sem.resourceId )
			if sem._Timer != None:
				sem._Timer.cancel()
				sem._Timer = None
			body = e.getBody()
			resourceId = body.get ( "resourceId" )
			sem._isSemaphoreOwner = body.get ( "isSemaphoreOwner" )

	def releaseSemaphore ( self, sem ):
		if sem.resourceId not in self.semaphores:
			print ( "release semaphore: not owner of resourceId=" + sem.resourceId )
			return
		e = Event ( "system", "releaseSemaphoreRequest" )
		body = e.getBody()
		body["resourceId"] = sem.resourceId
		del self.semaphores[sem.resourceId]
		self._send ( e )

class Lock:
	def __init__ ( self, resourceId, port=None, host=None ):
		self.resourceId = resourceId
		self._isLockOwner = False
		if isinstance ( port, Client ):
			self.client = port
		else:
			self.client = Client.getInstance ( port, host )
	def getClient(self):
		return self.client
	def isOwner(self):
		return self._isLockOwner
	def acquire(self):
		self.client.acquireLock ( self )
		if not self.isOwner() and self.client._first:
			self.client.close()
			self.client = None
	def release(self):
		if self._isLockOwner:
			self.client.releaseLock ( self )
		if self.client._first:
			self.client.close()
			self.client = None
	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")[resourceId=")
		s.write(self.resourceId)
		s.write(",isOwner=" + str(self.isOwner()) + "]" )
		return s.getvalue()

class Semaphore:
	def __init__ ( self, resourceId, port=None, host=None ):
		self.resourceId = resourceId
		self._isSemaphoreOwner = False
		if isinstance ( port, Client ):
			self.client = port
		else:
			self.client = Client.getInstance ( port, host )
		self.callback = None
		self.timeoutSeconds = -1
		self._Timer = None
		self.timeoutOccurs = False
	def hasCallback(self):
		return self.callback != None

	def getClient(self):
		return self.client
	def isOwner(self):
		return self._isSemaphoreOwner
	def acquire(self, callback=None):
		if callback == None:
			self.callback = callback
		elif isinstance ( callback, types.FunctionType ):
			self.callback = callback
		elif isinstance ( callback, numbers.Number ):
			self.timeoutSeconds = callback
		self.client.acquireSemaphore ( self )
		if self.hasCallback():
			return
		if not self.isOwner() and self.client != None and self.client._first:
			self.client.close()
			self.client = None
	def release(self):
		if self._isSemaphoreOwner:
			self.client.releaseSemaphore ( self )
		if self.client._first:
			self.client.close()
			self.client = None
	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")[resourceId=")
		s.write(self.resourceId)
		s.write(",isOwner=" + str(self.isOwner()) + "]" )
		return s.getvalue()

class MultiMap:
	def __init__(self):
		self._map = {}

	def put(self,key,value):
		if key in self._map:
			list = self._map[key]
			list.append ( value )
		else:
			list = []
			self._map[key] = list
			list.append ( value )

	def get ( self, key ):
		if key in self._map:
			return self._map[key]
		return []

	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		first = True
		for key in self._map:
			if first:
				s.write ( "\n" )
			s.write ( key )
			s.write ( "=" )
			s.write ( "[" )
			s.write ( "\n" )
			for x in self._map[key]:
				s.write ( "  " )
				s.write ( str(x) )
				s.write ( "\n" )
			s.write ( "]" )
		return s.getvalue()

	def remove ( self, key, value=None ):
		if value == None:
			del self._map[key]
			return
		list = self.get ( key )
		# if list == None:
		# 	return
		if value in list: list.remove ( value )

	def getKeys ( self ):
		a = []
		for k in self._map:
			a.append ( k )
		return a

	def getKeysOf ( self, value ):
		a = []
		for key in self._map:
			list = self._map[key]
			if value in list: a.append ( key )
		return a

	def removeValue ( self, value ):
		keyList = self.getKeys()
		for k in keyList:
			list = self._map[k]
			if value in list: list.remove ( value )
			if len(list) == 0:
				del self._map[k]

	def clear(self):
		keyList = self.getKeys()
		for k in keyList:
			list = self._map[k]
			list[:] = []
			del self._map[k]

class NamedQueue:
	def __init__(self):
		self._Counter         = 0
		self._NamedObjects    = []
		self._WaitingNames    = {}
		self._ReturnedObjects = {}
		self._AwakeAll        = False
		self._lock = threading.Lock()
		self._condition = threading.Condition ( self._lock )

	def put ( self, name, obj=None ):
		v = None
		if isinstance ( name, str ) and obj != None:
			v = { "name":name, "obj":obj }
		elif isinstance ( name, dict ):
			obj = name
			self._Counter = self._Counter + 1
			name = "OID-" + str(self._Counter)
			v = { "name":name, "obj":obj }

		self._condition.acquire()
		self._NamedObjects.append ( v )
		self._condition.notify_all()
		self._condition.release()
		return name

	def get ( self, name ):
		self._condition.acquire()
		try:
			self._WaitingNames[name] = True
			while True:
				o = self._ReturnedObjects.get ( name )
				if o == None:
					self._condition.wait()
				o = self._ReturnedObjects.get ( name )
				if o != None:
					del self._WaitingNames[name]
					del self._ReturnedObjects[name]
					return o
				if self._AwakeAll:
					return None
		except Exception as e:
			raise
		finally:
			self._condition.release()

	def _get ( self ):
		self._condition.acquire()
		try:
			while True:
				if len ( self._NamedObjects ) == 0:
					self._condition.wait()
				if len ( self._NamedObjects ) > 0:
					o = self._NamedObjects[0]
					self._NamedObjects.remove ( o )
					return o
				if self._AwakeAll:
					return None
		except Exception as e:
			raise
		finally:
			self._condition.release()

	def awakeAll ( self ):
		self._AwakeAll = True
		self._condition.acquire()
		try:
			self._condition.notify_all()
		except Exception as e:
			raise
		finally:
			self._condition.release()

	def _returnObj ( self, name, obj=None ):
		self._condition.acquire()
		try:
			if isinstance ( name, dict ):
				self._ReturnedObjects[name["name"]] = name["obj"]
			else:
				self._ReturnedObjects[name] = obj
			self._condition.notify_all()
		except Exception as e:
			raise
		finally:
			self._condition.release()

	def probe ( self, name ):
		self._condition.acquire()
		try:
			o = self._ReturnedObjects.get ( name )
			if o != None:
				del self._ReturnedObjects[name]
			return o
		except Exception as e:
			raise
		finally:
			self._condition.release()

	def isWaiting ( self, name ):
		self._condition.acquire()
		try:
			return name in self._WaitingNames
		finally:
			self._condition.release()

class SyncedQueue:
	def __init__(self):
		self._list    = []
		self._AwakeAll        = False
		self._lock = threading.Lock()
		self._condition = threading.Condition ( self._lock )

	def put ( self, o ):
		self._condition.acquire()
		try:
			self._list.append ( o )
			self._condition.notify()
		except Exception as exc:
			print ( exc )
			raise
		finally:
			self._condition.release()

	def get ( self ):
		self._condition.acquire()
		try:
			if len ( self._list ) == 0:
				self._condition.wait()
			if self._AwakeAll:
				return None
			if len ( self._list ) > 0:
				return self._list.pop(0)
		except Exception as exc:
			print ( exc )
			raise
		finally:
			self._condition.release()

	def awakeAll ( self ):
		self._AwakeAll = True
		self._condition.acquire()
		try:
			self._condition.notify_all()
		except Exception as e:
			raise
		finally:
			self._condition.release()

class util ( object ):
	_globals = {}
	args_collected = False
	@classmethod
	def putProperty ( clazz, name, value ):
		clazz.setProperty ( name, value )
	@classmethod
	def setProperty ( clazz, name, value ):
		if not clazz.args_collected:
			clazz.argsToProperties()
			clazz.args_collected = True
		clazz._globals[name] = value
	@classmethod
	def argsToProperties ( clazz ):
		for i in range ( 0, len ( sys.argv ) ):
			if sys.argv[i].find ( "-D" ) == 0 or sys.argv[i].find ( "--" ) == 0:
				if len ( sys.argv[i] ) < 3 or sys.argv[i][2] == '=':
					print ( "Missing option name: " + sys.argv[i] )
					continue
				pos = sys.argv[i].find ( '=' )
				if pos < 0:
					v = sys.argv[i][2:]
					clazz._globals[v] = v
				else:
					clazz._globals[sys.argv[i][2:pos]]= sys.argv[i][pos+1:]
	@classmethod
	def getProperty ( clazz, name, defaultProperty=None ):
		if not clazz.args_collected:
			clazz.argsToProperties()
			clazz.args_collected = True
		v = clazz._globals.get ( name )
		if v != None:  return v
		v = os.environ.get ( name )
		if v != None: return v
		if name.find ( '.' ) > 0:
			name = name.replace ( '.', '_' )
			v = os.environ.get ( name )
			if v != None: return v
			name = name.upper() ;
			v = os.environ.get ( name )
		if v == None:
			return defaultProperty
		return v

class FileReference(object):
	"""docstring for FileReference"""
	targetIsLocalHost = False
	def __init__(self, file=None):
		self.className = "FileReference"
		self.path = ""
		self.name = ""
		self.data = None
		if isinstance ( file, dict ):
			obj = file
			self.className = self.__class__.__name__
			self.path = obj["path"]
			if 'name' in obj and obj["name"] != None:
				self.name = obj["name"]
			if 'data' in obj and obj["data"] != None:
				self.data = obj["data"]
			return
		if file != None:
			self.path = file.replace ( "\\", "/" )
			self.path = os.path.abspath ( self.path )
			self.path = self.path.replace ( "\\", "/" )
			self.name = os.path.basename ( self.path )
	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		s.write("[\n  path=" + str(self.path) + "\n  name=" + str(self.name) + "\n  data=" + str(self.data) + "\n]" )
		return s.getvalue()

	def getBytes(self):
		if self.data != None:
			return self.data
		fd = open ( self.path, "rb" )
		return fd.read()
	def getName(self):
		return self.name
	def getPath(self):
		return self.path
	def toJSON(self):
		data = self.data
		if data == None and not self.targetIsLocalHost:
			fd = open ( self.path, "rb" )
			data = bytearray ( fd.read() )

		obj = { "className": self.__class__.__name__
					, "path": self.path
					, "name": self.name
					, "data": data 
					}
		return obj

	def write ( self, name):
		data = self.getBytes()
		fd = open ( name, "wb" )
		fd.write ( data )
		fd.close()

def __LINE__():
        try:
                raise Exception
        except:
                return sys.exc_info()[2].tb_frame.f_back.f_lineno
def __FILE__():
        return inspect.currentframe().f_code.co_filename
