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
		return self.body[name]

	def serialize(self):
		s = json.dumps ( self, default=self.to_json )
		return s
	def setFailureInfoRequested(self):
		self.control["_isFailureInfoRequested"] = True
	def setUniqueId ( self, uid ):
		if ( uid in self.control ):
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
		return this.control["status"]
	def getStatusReason ( self ):
		if "control" not in self.__dict__: return None
		if "status" not in self.control: return None
		return self.control["status"]["reason"]

	@staticmethod
	def deserialize ( s ):
		obj = json.loads ( s, object_hook=Event.from_json )
		e = Event ( obj )
		return e

	@staticmethod
	def to_json(obj):
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
				juser = obj.user.to_json()
			return { 'className': obj.className
						 , 'name':obj.name
						 , "type":obj.type
						 , "body":obj.body
						 , "control":obj.control
						 , "user":juser
						 }
		raise TypeError ( repr(obj) + ' is not JSON serializable' )
	@staticmethod
	def from_json ( obj ):
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

	def to_json(self):
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

import socket

class Client:
	'''demonstration class only - coded for clarity, not efficiency
	'''

	counter = 0 ;
	def __init__(self, port=None, host=None):
		self._event_callbacks = []
		self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		if port is None:
			self.port = 17501
		else:
			self.port = port
		if host is None:
			self.host = "localhost"
		else:
			self.host = host

	def createUniqueId(self):
		self.counter = self.counter + 1
		millis = round(time.time()*1000)
		return socket.gethostname() + "_" + str(os.getpid()) + "_" + str(millis) + "_" + str(self.counter) ;

	def on ( self, eventName, callback ):
		self._event_callbacks.append ( callback )

	def _emit ( self, name, err, value=None):
		print	( "1 -------------")
		for fn in self._event_callbacks:
			print	( "2 -------------")
			fn(err,value)
		return

	def connect(self):
		try:
			self.sock.connect((self.host, self.port))
		except IOError as e:
			self._emit ( "error", e )
			raise
		einfo                        = Event ( "system", "client_info" )
		einfo.body["language"]       = "python"
		einfo.body["hostname"]       = socket.gethostname()
		einfo.body["connectionTime"] = datetime.datetime.now()
		einfo.body["application"]    = sys.argv[0]
		self.send ( einfo.serialize() ) 

	def send ( self, event ):
		if isinstance ( event, Event ):
			event.setUniqueId ( self.createUniqueId() )
			self.sock.sendall ( event.serialize().encode ( "utf-8" ) )
		else:
			self.sock.sendall(event.encode("utf-8"))

	def emit(self, event):
		self.send ( event )

	def receive(self):
		bytes_recd = 0
		bytes = BytesIO()
		while bytes_recd < 383:
			b = self.sock.recv(1)
			if chunk == b'':
				# raise RuntimeError("socket connection broken")
				for fn in self._event_callbacks:
					fn ( RuntimeError ( "socket connection broken" ), "socket closed" )
				return ;
			bytes.write ( b )
			bytes_recd = bytes_recd + len(b)
		result = bytes.getvalue().decode ( 'utf-8' )
		return result

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
				# raise IOError("socket connection broken")
				self._emit ( "error", IOError("socket connection broken") )
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
		return e ;