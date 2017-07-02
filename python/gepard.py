#!/usr/bin/env python

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

from io import BytesIO

zeroconfExists = False
try:
	from zeroconf import ServiceBrowser, Zeroconf
	zeroconfExists = True
except Exception as e:
	# print ( e )
	zeroconfExists = False

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
resourceExists = True
try:
	import resource
except Exception as e:
	# print ( e )
	resourceExists = False

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

def isInt(i):
	try:
		int(i)
	except:
		return False
	return True

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
		self.name    = None
		self.type    = None
		self.user    = None
		self.control = None
		self.body    = None
		if isinstance ( name, dict ):
			obj = name
			self.className = self.__class__.__name__
			self.name = obj["name"]
			if 'type' in obj and obj["type"] != None:
				self.type = obj["type"]
			self.user = obj.get('user')
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
		self.user           = None
		self.control        = { "createdAt": datetime.datetime.now(), "hostname": socket.gethostname(), "plang": "python" }
		self.channel        = None
		self.sid            = None
	def jsa(self):
		if "_JSAcc" in self.__dict__:
			return self._JSAcc
		self._JSAcc = JSAcc ( self.__dict__ )
		return self._JSAcc

	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		s.write("[name='" + self.name + ",type='" + str(self.type) + "']\n" )
		s.write("  control:\n" )
		s.write("  " + str(self.control) )
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
	def setName ( self, name ):
		self.name = name
	def getType ( self ):
		return self.type
	def setType ( self, type ):
		self.type = type
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
		self._Client.sendResult ( self )

	def serialize(self):
		if "_Client" in self.__dict__:
			del self._Client
		if "_JSAcc" in self.__dict__:
			del self._JSAcc
		s = json.dumps ( self, default=self.toJSON )
		return s
	def setUniqueId ( self, uid ):
		if "uniqueId" in self.control and self.control["uniqueId"] != None:
			return
		self.control["uniqueId"] = uid
	def getUniqueId ( self ):
		return self.control.get ("uniqueId")

	def isBad ( self ):
		code = self.getStatusCode()
		if code == None: return False
		return code != 0
	def getStatus ( self ):
		return self.jsa().value ( "control/status" )
	def getStatusCode ( self ):
		return self.jsa().value ( "control/status/code" )
	def getStatusReason ( self ):
		return self.jsa().value ( "control/status/reason" )
	def getStatusName ( self ):
		return self.jsa().value ( "control/status/name" )
	def setStatus ( self, code=0, name="success", reason=""):
		self.jsa().add ( "control/status/code", code )
		self.jsa().add ( "control/status/name", name )
		self.jsa().add ( "control/status/reason", reason )
	def setIsResult ( self ):
		self.control["_isResult"] = True
	def isResult ( self ):
		return self.jsa().value ( "control/_isResult", False )
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
	def setChannel ( self, channel ):
		if self.control.get ( "channel" ) != None:
			return
		self.control["channel"] = channel
	def getChannel ( self ):
		return self.control.get ("channel")

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
			if obj.user != None:
				juser = obj.user.toJSON()
			ju = { 'className': obj.className
						, 'name':obj.name
						, "type":obj.type
						, "body":obj.body
						, "control":obj.control
						, "user":juser
						}
			return ju
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
			try:
				if className != "Event":
					clazz = globals()[className]
					u = clazz(obj)
					return u
			except Exception as exc:
				# print ( exc )
				pass
		return obj

class User ( object ):
	def __init__ ( self, id, key=None, pwd=None, rights=None ):
		if isinstance ( id, dict ):
			obj             = id
			self.className  = self.__class__.__name__
			self.id         = obj.get("id")
			self.key        = obj.get("key")
			self._pwd       = obj.get("_pwd")
			self.rights     = obj.get("rights")
			self.groups     = obj.get("groups")
			self.attributes = obj.get("attributes")
			return

		self.className  = "User"
		self.id         = id
		self.key        = key
		self._pwd       = pwd
		self.rights     = {}
		self.groups     = {}
		self.attributes = {}
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
		s.write("[id=" + str(self.id) )
		s.write(",_pwd=" + "******" )
		s.write(",key=" + str(self.key) )
		s.write(",rights=" + str(self.rights) )
		s.write(",groups=" + str(self.groups) )
		s.write("]")
		return s.getvalue()

	def toJSON(self):
		ju = { 'className': self.className
					, "id":self.id
					, "key":self.key
					, "_pwd":self._pwd
					, "rights":self.rights
					}
		return ju
	def addRight ( self, name, value ):
		self.rights[name] = value
	def getRight ( self, name ):
		return self.rights[name]
	def getAttributes(self):
		return self.attributes
	def getAttribute(self,name):
		return self.attributes[name]
	def getLanguage(self):
		return self.getAttribute("lang")
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
				callbackList = self.client.eventListenerFunctions.get ( e.getName() )
				if e.getChannel() != None:
					callbackList2 = self.client.eventListenerFunctions.get ( e.getChannel() + "::" + e.getName() )
					if callbackList2 != None:
						if callbackList != None:
							callbackList = callbackList2 + callbackList
						else:
							callbackList = callbackList2 + []
				found = False
				for function in callbackList:
					found = True
					function ( e )
					if e.isResultRequested():
						break
				for pc in self.client.patternContextList:
					if pc.matches ( e.getName() ):
						if e.isResultRequested():
							if not found:
								pc.cb ( e )
								found = True
								break
						else:
							pc.cb ( e )
							found = True
				if not found:
					print ( "listener function list for " + e.getName() + " not found." )
					print ( e )
			except Exception as exc:
				print ( exc )

def decoratedTimerCallback(_self):
	def deco ():
		_self._checkReconnect()
	return deco

def localTracer(t):
	print ( t )

def remoteTracer(_self):
	def log ( t ):
		try:
			_self.log ( t )
		except Exception as exc:
			print ( exc )
	return log

class ActionCmd:
	def __init__(self,parameter):
		self.parameter = parameter
		self.cmd       = parameter.get ( "cmd" )
		self.args      = parameter.get ( "args" )
		self.result    = ""
	def getCmd ( self ):
		return self.cmd
	def setResult(self,text):
		self.result = text
	def getArgs(self):
		return self.args

class ActionCmdCtx:
	def __init__ ( self, cmd, desc, cb ):
		self.cmd  = cmd
		self.desc = desc
		self.cb   = cb

import re
class PatternContext:
	def __init__ ( self, eventName, cb ):
		self.originalEventName = eventName
		if eventName[0] == '/' and eventName[-1] == '/':
			self.p = re.compile ( eventName[1:-2] ) ;
		elif eventName.find ( '.*' ) >= 0:
			self.p = re.compile ( eventName ) ;
		elif eventName.find ( '*' ) >= 0 or eventName.find ( '?' ) >= 0:
			self.eventName = eventName.replace ( ".", "\\." ).replace ( "*", ".*" ).replace ( '?', '.' )
			self.p = re.compile ( eventName ) ;
		else:
			self.p = re.compile ( eventName ) ;
		self.cb = cb ;
	def matches ( self, t ):
		return self.p.match ( t )
# -----------------------------------------------------------------------------------------
class ZeroconfFindServiceAdapter(object):
	def __init__(self,client,callback,first=True):
		self.client   = client
		self.callback = callback
		self.host     = None
		self.port     = None
		self.TOPICS   = None
		self.CHANNELS = None
		self.first    = first
	def remove_service(self, zeroconf, type, name):
		# print("Service %s removed" % (name,))
		pass
	def add_service(self, zeroconf, type, name):
			info = zeroconf.get_service_info(type, name)
			self.parse_fqdn ( name )
			if self.first:
				self.client.init2 ( self.port, self.host )
			answer = self.callback ( self.client, self )
			if answer:
				self.client.zeroconf.close()
				self.client.zeroconf = None
				self.client._condition.acquire()
				try:
					self.client._condition.notify_all()
				except Exception as e:
					raise
				finally:
					self.client._condition.release()
				return
			return
	def isLocalHost(self):
		return socket.gethostname() == self.host
	def parse_fqdn(self,fqdn):
		# print("Service found: %s" % (fqdn)) bn
		self.host     = self.extractFromPartFqdn ( fqdn, "H" )
		self.port     = self.extractFromPartFqdn ( fqdn, "P" )
		self.TOPICS   = self.extractFromPartFqdn ( fqdn, "T" )
		self.CHANNELS = self.extractFromPartFqdn ( fqdn, "C" )
	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")[host=")
		s.write(self.host)
		s.write(",port=" + str(self.port) )
		s.write(",TOPICS=" + str(self.TOPICS) )
		s.write(",CHANNELS=" + str(self.CHANNELS) )
		s.write("]" )
		return s.getvalue()
	def extractFromPartFqdn (self,name,tag):
		pos1 = name.find ( "[" + str(tag) + ":" )
		if pos1 < 0: return None
		pos2 = name.find ( "]", pos1 )
		part = name[pos1+3:pos2]
		if tag == "H":
			part = part.replace ( "-", "." )
		if tag == "T" or tag == "C":
			part = part.split ( ',' )
		return part
	def getChannels(self):
		return self.CHANNELS
	def getTopics(self):
		return self.TOPICS
	def topicExists(self,topic):
		return topic in self.TOPICS
	def channelExists(self,channel):
		return channel in self.CHANNELS
# -----------------------------------------------------------------------------------------
class Client:
	counter = 0
	_Instances = {}
	TPStore = None

	@classmethod
	def getInstance ( clazz, port=None, host=None ):
		if port == None and host == None:
			port = util.getProperty ( "gepard.zeroconf.type" )

		localhost = False
		if isinstance ( port, str ) and not isInt(port):
			port = { "type": port }
		if isinstance ( port, dict ) and not isinstance ( host, types.FunctionType ):
			if port["type"].find ( "localhost:" ) == 0:
				port["type"] = port["type"][ len("localhost:"):]
				localhost = True
      
			def auto_client_findService ( self, srv ):
				print ( srv )
				if localhost and not srv.isLocalHost():
					return False
				return True
			host = auto_client_findService

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
		self.zeroconf  = None
		self.connected = False
		self._lock     = None
		self.zeroconf_based_pending_list = None
		self.userServiceLookupParameter  = None
		self.userServiceLookupCallback   = None

		if port == None and host == None:
			port = util.getProperty ( "gepard.zeroconf.type" )

		localhost = False
		if isinstance ( port, str ) and not isInt(port):
			port = { "type": port }
		if isinstance ( port, dict ) and not isinstance ( host, types.FunctionType ):
			if port["type"].find ( "localhost:" ) == 0:
				port["type"] = port["type"][ len("localhost:"):]
				localhost = True
      
			def auto_client_findService ( self, srv ):
				print ( srv )
				if localhost and not srv.isLocalHost():
					return False
				return True
			host = auto_client_findService
		if isinstance ( port, dict ) and isinstance ( host, types.FunctionType ):
			self.zeroconf_based_pending_list = []
			self.userServiceLookupParameter = port
			self.userServiceLookupCallback  = host
			self.zeroconf_lookup()
		else:
			self.init2 ( port, host )

	def zeroconf_lookup(self,first=True):
		if not zeroconfExists:
			raise Exception ( "module zeroconf is not installed. Please execute: pip install zeroconf." )
		if self._lock == None:
			self._lock = threading.Lock()
			self._condition = threading.Condition ( self._lock )
		self._condition.acquire()
		self.zeroconf = Zeroconf()
		listener = ZeroconfFindServiceAdapter(self,self.userServiceLookupCallback,first)
		type = "_" + str(self.userServiceLookupParameter["type"]) + "._tcp.local."
		browser = ServiceBrowser(self.zeroconf, type, listener)
		try:
			self._condition.wait()
		except Exception as e:
			raise
		finally:
			self._condition.release()
		if listener.port != None:
			self.port = int(listener.port)
		self.host = listener.host

	def init2(self, port=None, host=None):
		if self.TPStore == None:
			self.TPStore = TracePointStore.getStore ( "client" )
			self.TPStore.add ( "EVENT_IN" ).setTitle ( "--------------------------- EVENT_IN ---------------------------" )
			self.TPStore.add ( "EVENT_OUT" ).setTitle ( "--------------------------- EVENT_OUT --------------------------" )


		self._first                 = False
		self.infoCallbacks          = MultiMap()
		self.eventListenerFunctions = MultiMap()
		self.patternContextList			= []
		self.connected              = False
		self.sock                   = None
		if host == None: host = util.getProperty ( "gepard.host", "localhost" )
		if port == None: port = util.getProperty ( "gepard.port", 17501 )
		port = int ( port )

		self.host = host
		self.port = port

		self.closing             = False
		self._workerIsDaemon     = False
		self.callbacks           = {}
		
		self._semaphores          = {}
		self._NQ_semaphoreEvents = NamedQueue()
		self._ownedResources     = {}
		self._NQ_lockEvents      = NamedQueue()
		self._CallbackIsolator   = SyncedQueue()
		self.numberOfCallbackWorker = 3
		if os.sep == '/':
			self.USERNAME = os.environ.get ( "LOGNAME" )
		else:
			self.USERNAME = os.environ.get ( "USERNAME" )

		if self.USERNAME == None:
			selfUSERNAME = "guest"
		self.user                     = User ( self.USERNAME )
		self._heartbeatIntervalMillis = 0
		self.version                  = 1
		self.brokerVersion            = 0
		self._reconnect               = util.getProperty ( "gepard.reconnect", "false" ) == "true"
		self._Timer                   = MutableTimer ( True )
		self._reconnectIntervalMillis = 5000
		cb = decoratedTimerCallback ( self )
		self._Timer.add ( self._reconnectIntervalMillis/1000, cb )
		self._callbackWorkerRunning = False
		self.nameToActionCallback   = MultiMap()
		self.TPStore.remoteTracer   = remoteTracer ( self )
		self.channels               = None
		self.mainChannel            = None
		self.setChannel ( util.getProperty ( "gepard.channel" ) )
		self.sid 											= None
	def setChannel ( self, channel ):
		if channel == None:
			return
		if channel.find ( ',' ) < 0:
			if channel[0] == '*': channel = channel[1:]
			self.mainChannel       = channel
			self.channels = {}
			self.channels[channel] = True
			return
		l = channel.split ( "," )
		for i in range ( 0, len(l) ):
			l[i] = l[i].strip()
			if len ( l[i] ) == 0: continue
			if i == 0: self.mainChannel = l[i]
			if l[i][0] == '*':
				l[i] = l[i][1:]
				if len ( l[i] ) == 0: continue
				self.mainChannel = l[i]
			if self.channels == None: self.channels = {}
			self.channels[l[i]] = True

	def getChannel ( self ):
		return self.channels
	def getSid ( self ):
		return self.sid
	def onAction ( self, cmd, desc, cb=None ):
		if isinstance ( desc, types.FunctionType ):
			cb = desc
			desc = cmd
		self.nameToActionCallback.put ( cmd, ActionCmdCtx ( cmd, desc, cb ) )

	def registerTracePoint ( self, tp, isActive=False ):
			return self.TPStore.add ( tp, isActive )
	def removeTracePoint ( self, name ):
			self.TPStore.remove ( name )
	def getTracePoint ( self, name ):
			return self.TPStore.points.get ( name )

	def _checkReconnect(self):
		try:
			self.closing = False
			fortest = True
			self.connect ( fortest )

			nameList = []
			keys = self.eventListenerFunctions.getKeys()
			for name in keys:
				nameList.append ( name )
			e = Event ( "system", "addEventListener" )
			e.body["eventNameList"] = nameList
			e.setUniqueId ( self.createUniqueId() )
			self._Timer.stop()
			self._emit ( "reconnect", str ( nameList ) )
			self._send ( e )
		except Exception as exc:
			self.sock = None
			# print ( exc )

	def setReconnect ( self, state ):
		self._reconnect = state == True
		return self

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
	def onReconnect ( self, icb ):
		self.infoCallbacks.put ( "reconnect", icb )
	def onDisconnect ( self, icb ):
		self.infoCallbacks.put ( "disconnect", icb )

	def on ( self, eventNameList, callback ):
		if isinstance ( eventNameList, str ):
			eventNameList = [ eventNameList ]
		elif isinstance ( eventNameList, collections.Sequence ):
			pass
		else:
			raise Exception ( "eventNameList must be a string or an array of strings." )
		if len ( eventNameList ) == 0:
			raise Exception ( "eventNameList must not be empty." )

		if not isinstance ( callback, types.FunctionType ):
			raise Exception ( "callback must be a function, not:" + str ( callback ) )

    # TDOO: synchronized ( "_LOCK" )
		for n in eventNameList:
			if n == "system":
				raise Exception ( "Client.on: eventName must not be 'system'" )
			self.eventListenerFunctions.put ( n, callback )
			if (  n.find ( '*' ) >= 0
				 or n.find ( '?' ) >= 0
				 or n.find ( '.*' ) >= 0
				 or ( n[0] == '/' and n[-1] == '/' )
				 ):
				self.patternContextList.append ( PatternContext ( n, callback ) )

		e = Event ( "system", "addEventListener" )
		e.body["eventNameList"] = eventNameList
		e.setUniqueId ( self.createUniqueId() )
		self._send ( e )
		return self
	def remove ( self, eventNameOrFunction ):
		self.removeEventListener ( eventNameOrFunction )
	def removeEventListener ( self, eventNameOrFunction ):
		if isinstance ( eventNameOrFunction, str ):
			eventNameOrFunction = [ eventNameOrFunction ]
		elif isinstance ( eventNameOrFunction, types.FunctionType ):
			eventNameOrFunction = [ eventNameOrFunction ]

		if isinstance ( eventNameOrFunction[0], str ):
			m = {}
			for name in eventNameOrFunction:
				self.eventListenerFunctions.remove ( name )
				m[name] = name
			toBeRemoved = []
			for pc in self.patternContextList:
				if pc.originalEventName in m: toBeRemoved.append ( pc )
			for pc in toBeRemoved:
				self.patternContextList.remove ( pc )
			toBeRemoved[:] = []

			e = Event ( "system", "removeEventListener" )
			e.body["eventNameList"] = eventNameOrFunction
			e.setUniqueId ( self.createUniqueId() )
			self._send ( e )
		elif isinstance ( eventNameOrFunction[0], types.FunctionType ):
			nameList = []
			toBeRemoved = []
			for el in eventNameOrFunction:
				keys = self.eventListenerFunctions.getKeysOf ( el )
				for name in keys:
					nameList.append ( name )
					self.eventListenerFunctions.removeValue ( el )
				for pc in self.patternContextList:
					if pc.cb == el:
						toBeRemoved.append ( pc )
			for pc in toBeRemoved:
				self.patternContextList.remove ( pc )
			toBeRemoved[:] = []
			e = Event ( "system", "removeEventListener" )
			e.body["eventNameList"] = nameList
			e.setUniqueId ( self.createUniqueId() )
			self._send ( e )
	def _emit ( self, event_name, err, value=None):
		if value == None: value = ""
		function_list = self.infoCallbacks.get ( event_name )
		for fn in function_list:
			try:
				fn(err,value)
			except Exception as e:
				print ( e )
				# raise e
		return

	def connect(self,fortest=False):
		if self.connected: return
		try:
			if self.sock == None:
				self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
			self.sock.connect((self.host, self.port))
			self.connected = True
			l_onoff = 1                                                                                                                                                           
			l_linger = 0                                                                                                                                                          
			self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER,                                                                                                                     
                 struct.pack('ii', l_onoff, l_linger))
			if self.sock.getpeername()[0] == self.sock.getsockname()[0]:
				FileContainer.targetIsLocalHost = True
			if not self._callbackWorkerRunning:
				self._startCallbackWorker()
				self._callbackWorkerRunning = True
			self._startWorker()
		except IOError as e:
			if not fortest:
				self.connected = False
				self.sock = None
				self._emit ( "error", e )
			raise
		client_info                        = Event ( "system", "client_info" )
		client_info.body["language"]       = "python"
		client_info.body["hostname"]       = socket.gethostname()
		client_info.body["connectionTime"] = datetime.datetime.now()
		client_info.body["application"]    = os.path.abspath(sys.argv[0])
		client_info.body["USERNAME"]    	 = self.USERNAME
		client_info.body["version"]    	   = self.version
		client_info.body["channels"]    	 = self.channels
		
		self._send ( client_info ) 

	def _send ( self, event ):
		self.connect()
		if event.getUser() == None:
			event.setUser ( self.user )
		event.setUniqueId ( self.createUniqueId() )
		event.setChannel ( self.mainChannel )
		self.sock.sendall ( event.serialize().encode ( "utf-8" ) )
		if event.getName() != "system":
			self.TPStore.points["EVENT_OUT"].log ( event )

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
		name = e.getName()
		pos  = name.find ( "::" )
		if pos > 0:
			channel = name[:pos]
			name    = name[pos+2:]
			e.setName ( name )
			e.setChannel ( channel )

		if map != None:
			callback = {}
			for key in map:
				if   key == "failure": e.setFailureInfoRequested()
				elif key == "status" : e.setStatusInfoRequested()
				elif key == "result" : e.setResultRequested()
				elif key == "error"  : e.setResultRequested()
				callback[key] = map.get ( key )
			if e.getName() == "system":
				raise Exception ( "Client.emit: eventName must not be 'system'" )

		self._send ( e )
		# print	( e )
		if callback != None:
			self.callbacks[e.getUniqueId()] = callback
		return self
	def _handleSystemClientMessages(self,e):
		try:
			info = {}
			e.putValue ( "info", info )
			if e.getType().find ( "client/action/" ) == 0:
				parameter = e.getValue ( "parameter" )
				if parameter == None:
					e.setStatus ( 1, "error", "missing 'parameter'" )
					e.setIsResult()
					self._send ( e )
					return
				e.removeValue ( "parameter" )
				actionName = parameter.get ( "actionName" )
				if "tp" == actionName:
					tracePointResult = self.TPStore.action ( parameter )
					info["tracePointStatus"] = tracePointResult
				elif actionName == "info":
					resultList = []
					info["actionInfo"] = resultList
					keys = self.nameToActionCallback.getKeys()
					for key in keys:
						list = self.nameToActionCallback.get ( key )
						m = {}
						resultList.append ( m )
						for i in range ( 0, len ( list ) ):
							m["ctx"] = list[i].cmd
							m["desc"] = list[i].desc
				elif actionName == "execute":
					cmd = ActionCmd ( parameter )
					if cmd.cmd == None:
						e.setStatus ( 1, "error", "missing 'cmd'" )
						e.setIsResult()
						self._send ( e )
						return
					resultList = []
					info["actionResult"] = resultList
					list = self.nameToActionCallback.get ( cmd.cmd )
					for i in range ( 0, len ( list ) ):
						ctx = list[i]
						ctx.cb ( self, cmd )
						resultList.append ( cmd.result )
				else:
					e.setStatus ( 1, "error", "invalid: " + e.getType() )
					e.setIsResult()
					self._send ( e )
					return
				e.setStatus ( 0, "success", "ack" )
				e.setIsResult()
				self._send ( e )
				return
			elif e.getType().find ( "client/info/" ) == 0:
				if e.getType().find ( "/where/" ) > 0:
					where = {}
					info["where"] = where
				elif e.getType().find ( "/tp/" ) > 0:
					tracePointResult = self.TPStore.action ( None )
					info["tracePointStatus"] = tracePointResult
				elif e.getType().find ( "/env/" ) > 0:
					env = {}
					info["env"] = env
					for k, v in os.environ.items():
						env[k] = v
				elif e.getType() == "client/info/":
					osys = {}
					info["os"] = osys
					osys["uname"] = os.uname()
					proc = {}
					info["process"] = proc
					mem = 0
					if resourceExists:
						mem = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
					proc["maxrss"] = mem
				else:
					e.setStatus ( 1, "error", "no " + e.getType() )
					e.setIsResult()
					self._send ( e )
					return
				e.setStatus ( 0, "success", "ack" )
				e.setIsResult()
				self._send ( e )
			else:
				e.setStatus ( 1, "error", "no " + e.getType() )
				e.setIsResult()
				self._send ( e )
		except Exception as exc:
			print ( exc )
			e.setStatus ( 1, "error", str ( exc ) )
			e.setIsResult()
			self._send ( e )

	def log(self, messageText):
		e = Event ( "system", "log" )
		message = {}
		message["text"] = str ( messageText )
		message["severity"] = "INFO"
		message["date"] = util.formatDateAsRFC3339()
		e.putValue ( "message", message )
		self._send ( e )

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
		self._semaphores         = {}
		self._NQ_semaphoreEvents.awakeAll()
		self._ownedResources     = {}
		self._NQ_lockEvents.awakeAll()

		# eventListenerFunctions.clear()
		key = str(self.port) + ":" + str(self.host)
		if key in self._Instances:
			del self._Instances[key]
		self.sock = None
		self._emit ( "close", None )

	def startReconnections(self):
		try:
			if self.sock != None:
				try:
					self.closing = True
					self.connected = False
					self.sock.shutdown ( socket.SHUT_RDWR )
					self.sock.close()
				except Exception as exc:
					# print ( exc )
					pass
			key = str(self.port) + ":" + str(self.host)
			if key in self._Instances:
				del self._Instances[key]
			self.callbacks = {}
			self._semaphores         = {}
			self._NQ_semaphoreEvents.awakeAll()
			self._ownedResources     = {}
			self._NQ_lockEvents.awakeAll()
			self.sock = None
			if self.userServiceLookupCallback != None:
				self.zeroconf_lookup(False)
				self._checkReconnect()
			else:
				self._Timer.start()
		except Exception as e:
			print ( e )

	def readNextJSON(self):
		uid = self.createUniqueId()
		bytes = BytesIO()
		k = 0
		lastWasBackslash = False
		q = 0
		pcounter = 0
		try:
			if self.brokerVersion > 0 and self._heartbeatIntervalMillis > 0 :
				self.sock.settimeout ( ( 3 * self._heartbeatIntervalMillis ) / 1000 )
		except Exception as exc:
			# print ( exc )
			raise

		while True:
			if self.closing:
				break
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
		if self.closing:
			return None
		s = bytes.getvalue().decode ( 'utf-8' )
		e = Event.deserialize ( s )
		e._Client = self
		# print ( e )
		return e

	def _worker(self):
		while True:
			try:
				e = None
				try:
					e = self.readNextJSON()
				except Exception as e:
					if not self.closing:
						print ( e )
					self._emit ( "disconnect", e )
					if self._reconnect:
						self.startReconnections()
					else:
						self._Timer.cancel()
					break
				if e.getName() != "system":
					self.TPStore.points["EVENT_IN"].log ( e )

				if e.getName() == 'system':
					if e.getType() != None and e.getType() == "shutdown":
						self._emit ( "shutdown", None, None )
						print ( "shutdown called" )
						if self._reconnect:
							self.startReconnections()
						else:
							self._Timer.cancel()
						break
					if e.getType().find ( "client/" ) == 0:
						self._handleSystemClientMessages ( e )
						continue
					if e.getType() != None and e.getType() == "PING":
						e.setType ( "PONG" )
						if e.__dict__["control"].get ( "_heartbeatIntervalMillis" ) != None:
							self._heartbeatIntervalMillis = e.__dict__["control"]["_heartbeatIntervalMillis"]
						self._send ( e )
						continue
					if e.getType() != None and e.getType() == "broker_info":
						body = e.__dict__["body"]
						if body.get ( "brokerVersion" ) != None:
							self.brokerVersion = body.get ( "brokerVersion" )
							self._heartbeatIntervalMillis = body.get ( "_heartbeatIntervalMillis" )
						continue
						self.sid = body.get ( "sid" )
					if e.getType() == "acquireSemaphoreResult":
						body = e.getBody()
						resourceId = body.get ( "resourceId" )
						sem = self._semaphores.get ( resourceId )
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
				del self._semaphores[sem.resourceId]
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
		if sem.resourceId in self._semaphores:
			s = self._semaphores.get ( sem.resourceId )
			if s.isOwner():
				print ( "Client.acquireSemaphore: already owner of resourceId=" + sem.resourceId )
			else:
				print ( "Client.acquireSemaphore: already waiting for ownership owner of resourceId=" + sem.resourceId )
			return

		self._semaphores[sem.resourceId] = sem
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
			if e != None:
				body = e.getBody()
				resourceId = body.get ( "resourceId" )
				sem._isSemaphoreOwner = body.get ( "isSemaphoreOwner" )
			else:
				sem._isSemaphoreOwner = False

	def releaseSemaphore ( self, sem ):
		if sem.resourceId not in self._semaphores:
			print ( "release semaphore: not owner of resourceId=" + sem.resourceId )
			return
		e = Event ( "system", "releaseSemaphoreRequest" )
		body = e.getBody()
		body["resourceId"] = sem.resourceId
		del self._semaphores[sem.resourceId]
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
			try:
				if self.client != None:
					self.client.close()
					self.client = None
			except Exception as exc:
				print ( exc )
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

	def clear(self):
		self._condition.acquire()
		try:
			pass
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
			name = name.upper()
			v = os.environ.get ( name )
		if v == None:
			return defaultProperty
		return v

	@classmethod
	def formatDateAsRFC3339 ( clazz, date=None ):
		if date == None:
			date = datetime.datetime.now()
		now = datetime.datetime.now()
		utc = datetime.datetime.utcnow()

		tdelta   = utc - now
		tzoffset = tdelta.days * 3600 * 24 + tdelta.seconds
		
		sdate    = ( "%04d-%02d-%02dT%02d:%02d:%02d.%03d" ) % ( date.year, date.month, date.day, date.hour, date.minute, date.second, date.microsecond//1000 )
		
		hours    = abs(tzoffset) // 3600
		minutes  = abs(tzoffset) % 3600 // 60
		sign     = (tzoffset < 0 and '+') or '-'
		rfc3339  = sdate + '%c%02d:%02d' % (sign, hours, minutes)
		return rfc3339

	@classmethod
	def exitWithSIGINT ( clazz ):
		import signal
		def signal_handler(signal, frame):
			# print('You pressed Ctrl+C!')
			os._exit(0)
		signal.signal(signal.SIGINT, signal_handler)

class FileContainer(object):
	"""docstring for FileContainer"""
	targetIsLocalHost = False
	def __init__(self, file=None):
		self.className = "FileContainer"
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

# MutableTimer

class MutableTimer:
	def __init__(self,isDaemon=None):
		self.maxperiod          = 24*3600
		self.period             = self.maxperiod
		self.isDaemon           = isDaemon == False
		self._lock              = threading.Lock()
		self._runnerlock        = threading.Lock()
		self._condition         = threading.Condition ( self._lock )
		self.runnerList         = []
		self.canceled           = False
		self.indexForNextAction = -1
		self.thread             = threading.Thread(target=self.run)
		self.thread.setDaemon ( self.isDaemon )
		self.thread.start()

	def run(self):
		while True:
			runContext = None
			self._condition.acquire()
			self._calculateTimes()
			if self.indexForNextAction == -1:
				self._condition.wait()
				if self.canceled:
					break
				self._condition.release()
			else:
				runContext = self.runnerList[self.indexForNextAction]
				period     = runContext.get ( "period" )
				lastTic    = runContext.get ( "lastTic" )
				nextTic    = lastTic + period
				waitsec    = nextTic - time.time()
				if waitsec < 0:
					waitsec = 0
				self._condition.wait ( waitsec )
				if self.canceled:
					break
				self._runnerlock.acquire()
				
				if self.indexForNextAction >= 0:
					runContext = self.runnerList[self.indexForNextAction]
					canceled   = runContext.get ( "canceled" )
					stopped    = runContext.get ( "stopped" )
					if canceled or stopped:
						continue
					runContext["lastTic"] = time.time()
				self._runnerlock.release()
				self._condition.release()
				runContext["runner"]()

	def start ( self, period=None, name=None, runner=None ):
		if runner == None and isinstance ( name, types.FunctionType ):
			runner = name
			name   = None
		if period == None and name == None and runner == None:
			self._runnerlock.acquire()
			for i in range ( 0, len ( self.runnerList ) ):
				runContext = self.runnerList[i]
				if runContext["canceled"]:
					continue
				runContext["stopped"] = False
				runContext["lastTic"] = time.time()
			self._runnerlock.release()
		elif period != None and runner != None:
			runContext = self.add ( period, name, runner )
			self._runnerlock.acquire()
			runContext["lastTic"] = time.time()
			runContext["stopped"] = False
			self._runnerlock.release()
		elif period != None:
			self.stop ( name )
			self._runnerlock.acquire()
			if name != None:
				for i in range ( 0, len ( self.runnerList ) ):
					runContext = self.runnerList[i]
					if runContext["canceled"]:
						continue
					if runContext["stopped"] != True:
						continue
					if runContext.get ( "name" ) == name:
						runContext["lastTic"] = time.time()
						runContext["stopped"] = False
			self._runnerlock.release()
		self._notify()

	def stop ( self, name=None ):
		if name == None:
			self._runnerlock.acquire()
			for i in range ( 0, len ( self.runnerList ) ):
				runContext = self.runnerList[i]
				runContext["stopped"] = True
			self._runnerlock.release()
			self._notify()
			return
		else:
			self._runnerlock.acquire()
			for i in range ( 0, len ( self.runnerList ) ):
				runContext = self.runnerList[i]
				if name == runContext.get ( "name" ):
					runContext["stopped"] = True
			self._runnerlock.release()
			self._notify()
			return
		self._notify()

	def add ( self, period=None, name=None, runner=None ):
		if runner == None and not isinstance ( name, str ):
			runner = name
			name   = None
		if name == None:
			name = ""
		runContext             = {}
		runContext["period"]   = period
		runContext["canceled"] = False
		runContext["stopped"]  = False
		runContext["lastTic"]  = time.time()
		runContext[name]     = name
		runContext["runner"] = runner
		self._runnerlock.acquire()
		self.runnerList.append ( runContext )
		self._runnerlock.release()
		return runContext

	def cancel(self,name=None):
		if name == None:
			self.canceled = True
			self._notify()
			return
		self._runnerlock.acquire()
		for i in range ( 0, len ( self.runnerList ) ):
			if name == runContext.get ( "name" ):
				runContext["canceled"] = True
		self._runnerlock.release()
		self._notify()
		
	def _calculateTimes(self):
		self.indexForNextAction = -1
		toBeRemoved = []
		min_nextTic = time.time() + self.maxperiod
		for i in range ( 0, len ( self.runnerList ) ):
			runContext = self.runnerList[i]
			canceled = runContext.get ( "canceled" )
			stopped = runContext.get ( "stopped" )
			if canceled:
				toBeRemoved.append ( runContext )
				continue
			if stopped:
				continue
			period  = runContext.get ( "period" )
			lastTic = runContext.get ( "lastTic" )
			nextTic = lastTic + period
			if nextTic < min_nextTic:
				min_nextTic = nextTic
				self.indexForNextAction = i
		self._runnerlock.acquire()
		for i in range ( 0, len ( toBeRemoved ) ):
			self.runnerList.remove ( toBeRemoved[i] )
		self._runnerlock.release()
		del toBeRemoved[:]

	def _notify(self):
		try:
			self._condition.acquire()
			self.indexForNextAction = -1
			self._condition.notify()
		except Exception as e:
			print ( e )
		finally:
			self._condition.release()


def __LINE__():
        try:
                raise Exception
        except:
                return sys.exc_info()[2].tb_frame.f_back.f_lineno
def __FILE__():
        return inspect.currentframe().f_code.co_filename

class TracePoint ( object ):
  def __init__ ( self, name="", active=False ):
    self.active = active
    self.name   = name
    self.mode   = "hb"
    self.store  = None
    self.title  = None
    self.tracer = None
  
  def setTitle ( self, title ):
    self.title = title

  def log ( self, value ):
    if not self.active:
      return
    tracer = self.tracer
    s = StringIO()
    if tracer == None:
      tracer = self.store.tracer
    if isinstance ( value, Event ):
      e = value
      if self.title != None:
      	s.write ( self.title )
      	s.write ( "\n" )
      mode = self.mode
      if mode == None:
        mode = 'hb'
      if mode == 'a':
        tracer ( e )
      if mode.find ( 'h' ) >= 0:
      	s.write ( e.getName() + "/" + e.getType() )
      	s.write ( "\n" )
      if mode.find ( 'u' ) >= 0:
      	s.write ( str ( e.user ) )
      	s.write ( "\n" )
      if mode.find ( 'c' ) >= 0:
      	s.write ( str ( e.control ) )
      	s.write ( "\n" )
      if mode.find ( 'b' ) >= 0:
      	s.write ( str ( e.body ) )
      	s.write ( "\n" )
    else:
      if self.title != None:
      	s.write ( self.title )
      	s.write ( "\n" )
      s.write ( str ( value ) )
    tracer ( s.getvalue() )
  def isActive ( self ):
    return self.active

class TracePointStore ( object ):
	_Instances = {}
	@classmethod
	def getStore ( clazz, name="" ):
		key = name
		store = clazz._Instances.get ( key )
		if store != None:
			return store
		store = TracePointStore ( name )
		clazz._Instances[key] = store
		return store
	def __init__ ( self, name="" ):
 		self.points       = {}
 		self.localTracer  = localTracer
 		self.remoteTracer = None
 		self.tracer       = self.localTracer
 		self.name         = name
	def getName ( self ):
		return self.name

	def add ( self, tp, isActive=False ):
		if isinstance ( tp, TracePoint ):
			self.points[tp.name] = tp
			tp.active = util.getProperty ( tp.name, tp.active )
		else:
			name              = tp
			tp                = TracePoint ( name, isActive )
			tp.active         = util.getProperty ( name, tp.active )
			self.points[name] = tp
			tp.store          = self
			return tp

	def getTracePoint ( self, name ):
		return self.points.get ( name )

	def remove( self, name ):
		if not isinstance ( name, basestring):
			return
		if name in self.points:
			del self.points[name]

	def action ( self, action=None ):
		if isinstance ( action, dict ):
			if "output" in action:
				output = action["output"]
				if output == "remote":
					self.tracer = self.remoteTracer
				else:
					self.tracer = self.localTracer

			if "points" in action:
				points = action["points"]
				for i in range ( 0, len ( points ) ):
					item = points[i]
					if not "name" in item:
						continue
					mode = item.get ( "mode" )
					name = item.get ( "name" )
					if name == "*":
						state = item.get ( "state" )
						if state == None:
							continue
						for k in self.points:
							point = self.points[k]
							if state == 'on': point.active = True
							if state == 'off': point.active = False
							if state == 'toggle': point.active = not point.active
							if mode != None:
								point.mode = mode
						continue

					tp = self.points[name]
					if tp == None:
						continue
					state = item.get ( "state" )
					if state == None:
						continue
					if state == 'on': tp.active = True
					if state == 'off': tp.active = False
					if state == 'toggle': tp.active = not tp.active
					if mode != None:
						point.mode = mode
		result = {}
		result["name"] = self.getName()
		if self.tracer == self.localTracer:
			result["output"] = "local"
		else:
			result["output"] = "remote"
		list = []
		result["list"] = list
		for k in self.points:
			point = self.points[k]
			list.append ( { "name":point.name, "active":point.active } )
		return result

class JSAcc:
	def __init__ ( self, map={} ):
		self.map = map
	def __str__(self):
		return str(self.map)
	def map(self):
		return self.map
	def value ( self, path, dflt=None ):
		if path.find ( "/" ) < 0:
			o = self.map.get ( path )
			return o == o if o != None else dflt
		plist = path.split ( "/" )
		mm = self.map
		for i in range ( 0, len(plist) ):
			p = plist[i]
			if len ( p ) == 0:
				continue
			o = mm.get ( p )
			if o == None:
				return dflt
			if i == len ( plist ) - 1:
				return o
			if isinstance ( o, dict ):
				mm = o
			continue
		return dflt

	def add ( self, path, obj={} ):
		if ( path.find ( "/" ) == -1 ):
			self.map[path] = obj
			return obj
		plist = path.split ( "/" )
		m = self.map
		for i in range ( 0, len(plist) ):
			p = plist[i]
			if ( len ( p ) == 0 ):
				continue
			o = m.get ( p )
			if i < len ( plist ) - 1:
				if not isinstance ( o, dict ):
					mm = {}
					m[p] = mm
					m = mm
				if isinstance ( o, dict ):
					m = o
					continue
			if i == len ( plist ) - 1:
				m[p] = obj
		return obj
	def remove ( self, path ):
		if ( path.find ( "/" ) == -1 ):
			o = self.map.get ( path )
			if o != None: del self.map[path]
			return o
		plist = path.split ( "/" )
		mm = self.map
		for i in range ( 0, len(plist) ):
			p = plist[i]
			if ( len ( p ) == 0 ):
				continue
			o = mm.get ( p )
			if o == None:
				return None
			if i == len ( plist ) - 1:
				del mm[p]
				return o
			if isinstance ( o, dict ):
				mm = o
				continue 
		return None
