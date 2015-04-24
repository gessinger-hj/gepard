#!/usr/bin/env python

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO
import json
import inspect
import time
import datetime
import socket
try:
  basestring
except NameError:
  basestring = str

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
		self.name    = None
		self.type    = None
		self.user    = None
		self.control = None
		self.body    = None
		if isinstance ( name, dict ):
			hh = name
			self.className = self.__class__.__name__ ;
			self.name = hh["name"]
			if 'user' in hh:
				self.user = User ( hh["user"] ) ;
			self.control = hh["control"]
			self.body = hh["body"]
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
		s.write("[name=" + self.name )
		s.write(",type=" + str(self.type) )
		s.write(",control=" + str(self.control) )
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

	@classmethod
	def to_json(cls,obj):
		if isinstance ( obj, bytes ):
			return { 'type': 'bytes',
							 'data': list(obj)
						 }
		if isinstance ( obj, bytearray ):
			return { 'type': 'Buffer',
							 'data': list(obj)
						 }
		if isinstance ( obj, datetime.datetime ):
			return { 'type': 'Date',
							 'value': obj.isoformat()
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
	@classmethod
	def from_json ( cls, obj ):
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
			hh = id
			self.className = self.__class__.__name__ ;
			self.id = hh["id"]
			self.key = hh["key"]
			self._pwd = hh["_pwd"]
			self.rights = hh["rights"]
			return

		self.className = "User" ;
		self.id        = id ;
		self.key       = key ;
		self._pwd      = pwd ;
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

# ==========================================================================
e = Event ("ALARM2")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
e.body["binaryData"] = binaryData ;

u = User ( "john", 999, "SECRET" )

u.addRight ( "CAN_READ_FILES", "*.docx" ) ;
e.setUser ( u ) ;

s = json.dumps ( e, default=Event.to_json ) #, indent=2 )
print ( "-------------------------------" )
print (s)

text_file = open ("event.python.json", "w")
text_file.write ( s )
text_file.close()

print ( "-------------------------------" )
obj = json.loads ( s, object_hook=Event.from_json )
# print (obj)
ee = Event ( obj )
print ( "================================================" )
# print ( ee )
print ( ee.getUser() )

# print	( ee.getUser() )
