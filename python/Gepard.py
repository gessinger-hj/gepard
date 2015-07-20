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
import collections

try:
	basestring
except NameError:
	basestring = str

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
		self.name		= None
		self.type		= None
		self.user		= None
		self.control = None
		self.body		= None
		if isinstance ( name, dict ):
			obj = name
			self.className = self.__class__.__name__ ;
			self.name = obj["name"]
			if 'user' in obj and obj["user"] != None:
				self.user = User ( obj["user"] ) ;
			if 'type' in obj and obj["type"] != None:
				self.type = obj["type"] ;
			self.control = obj["control"]
			self.body = obj["body"]
			return

		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		if type != None and not isinstance ( type, basestring):
			raise ValueError ( "type must be None or a non empty string, not: " + str(type) + "(" + type.__class__.__name__ + ")" )

		self.className = self.__class__.__name__ ;
		self.name = name
		self.type = type
		if body == None:
			self.body = {}
		elif isinstance ( body, dict ):
			self.body = body
		else:
			raise ValueError ( "body must be None or a dict, not: " + str(body) + "(" + body.__class__.__name__ + ")" )
		self.user = None
		self.control = { "createdAt": datetime.datetime.now(), "hostname": socket.gethostname() }

	def __str__(self):
		s = StringIO()
		s.write("(")
		s.write(self.__class__.__name__)
		s.write(")")
		s.write("{ name: '" + self.name + "',\n" )
		s.write("  type: '" + str(self.type) + "',\n" )
		s.write("  control:\n" )
		s.write("  " + str(self.control) )
		# s.write(",user=" + str(self.user) )
		if isinstance ( self.user, User ):
			s.write(",user=" + str(self.user) )
		s.write(",body=" + str(self.body) )
		s.write("]")
		return s.getvalue()
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
	def getHostname ( self ):
		return self.control["hostname"] ;
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
		self.control["uniqueId"] = uid ;
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


	@staticmethod
	def deserialize ( s ):
		obj = json.loads ( s, object_hook=Event.fromJSON )
		e = Event ( obj )
		return e

	@staticmethod
	def toJSON(obj):
		if isinstance ( obj, bytes ):
			return { 'type': 'bytes'
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
		raise TypeError ( repr(obj) + ' is not JSON serializable' )
	@staticmethod
	def fromJSON ( obj ):
		if 'type' in obj:
			if obj['type'] == 'time.asctime':
				return time.strptime(obj['data'])
			if obj['type'] == 'Date':
				return obj['value']
			if obj['type'] == 'bytes':
				return bytearray(obj['data'])
			if obj['type'] == 'Buffer':
				return bytes(obj['data'])
		return obj

class User ( object ):
	def __init__ ( self, id, key=None, pwd=None, rights=None ):
		if isinstance ( id, dict ):
			obj = id
			self.className = self.__class__.__name__ ;
			self.id = obj["id"]
			self.key = obj["key"]
			self._pwd = obj["_pwd"]
			self.rights = obj["rights"]
			return

		self.className = "User" ;
		self.id				= id ;
		self.key			 = key ;
		self._pwd			= pwd ;
		self.rights = {} ;
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

class Client:
	counter = 0 ;
	def __init__(self, port=None, host=None):
		self.infoCallbacks = MultiMap()
		self.eventListenerFunctions = MultiMap()
		self.connected = False
		self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		if port is None:
			self.port = 17501
		else:
			self.port = port
		if host is None:
			self.host = "localhost"
		else:
			self.host = host
		self.user = None
		self.closing = False
		self._workerIsDaemon = False
		self.callbacks = {}

	def setDaemon(self,status=True):
		self._workerIsDaemon = status
	def createUniqueId(self):
		self.counter = self.counter + 1
		millis = round(time.time()*1000)
		return socket.gethostname() + "_" + str(os.getpid()) + "_" + str(millis) + "_" + str(self.counter) ;

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
			self._startWorker()
		except IOError as e:
			self.connected = False
			self._emit ( "error", e )
			raise
		event                        = Event ( "system", "client_info" )
		event.body["language"]       = "python"
		event.body["hostname"]       = socket.gethostname()
		event.body["connectionTime"] = datetime.datetime.now()
		event.body["application"]    = sys.argv[0]
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
		t = threading.Thread(target=self._worker ) #, args=(self,))
		t.setDaemon ( self._workerIsDaemon )
		t.start()
		return

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
		# eventListenerFunctions.clear() ;
  # 	_Instances.remove ( "" + this.host + ":" + this.port ) ;
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
				q = c ;
				while True:
					c = self.sock.recv(1)
					bytes.write ( c ) ;
					if ( c == q ):
						if ( lastWasBackslash ):
							lastWasBackSlash = True ;
							continue ;
					break ;
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
		return e ;

	def _worker(self):
		while True:
			try:
				e = self.readNextJSON()
				# print ( e )
				if e.getName() == 'system':
					if e.getType() != None and e.getType() == "shutdown":
						self._emit ( "shutdown", None, None )
						break
					continue
				if e.isBad():
					if e.isResult():
						callback = self.callbacks.get ( e.getUniqueId() )
						if callback == None:
							print ( "No callback found for:\n" + e )
							continue
					del self.callbacks[e.getUniqueId()]
					if e.isFailureInfoRequested() and "failure" in callback:
						callback["failure"] ( e )
					elif e.isStatusInfoRequested() and "status" in callback:
						callback["status"] ( e )
					elif "error" in callback:
						callback["error"] ( e )
					elif "result" in callback:
						callback["result"] ( e )
					continue
				if e.isResult():
					callback = self.callbacks.get ( e.getUniqueId() )
					if callback == None:
						print ( "No callback found for:\n" + e )
						continue
					if e.isStatusInfoRequested() and "status" in callback:
						callback["status"] ( e )
						continue
					del self.callbacks[e.getUniqueId()]
					if "result" in callback:
						try:
							e._Client = self
							callback["result"] ( e )
						except Exception as exc:
							print (exc)
						if "_Client" in e.__dict__:
							e._Client = None
							del e._Client
					else:
						print ( "No result callback found for:\n" + e )
					continue

				functionList = self.eventListenerFunctions.get ( e.getName() )
				found = False
				for function in functionList:
					found = True
					try:
						e._Client = self
						function ( e )
					except Exception as exc:
						print (exc)
					if "_Client" in e.__dict__:
						e._Client = None
						del e._Client
					if e.isResultRequested():
						break
				if not found:
					print ( "listener function list for " + e.getName() + " not found." )
					print ( e )
					continue

			except Exception:
				break

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
		return a ;

	def getKeysOf ( self, value ):
		a = [] ;
		for key in self._map:
			list = self._map[key]
			if value in list: a.append ( key )
		return a ;

	def removeByValue ( self, value ):
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