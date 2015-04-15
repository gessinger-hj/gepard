#!/usr/bin/env python3

# from cStringIO import StringIO
try:
	from io import StringIO
except ImportError:
	from cStringIO import StringIO
# import BytesIO
import json
import inspect
import time
import datetime

try:
  basestring
except NameError:
  basestring = str

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
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
			raise ValueError ( "body must be None or a dict, not: " + str(body) + "(" + name.__class__.__name__ + ")" )
		self.user = None
		self.control = { "createdAt": datetime.datetime.now() } #.replace(microsecond=0) }
	def getName ( self ):
		return self.name
	def __str__(self):
		str = StringIO()
		str.write("(")
		str.write(self.__class__.__name__)
		str.write(")")
		return str.getvalue()
	def getCreatedAt(self):
		return self.control["createdAt"]


e = Event ("ALARM2")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
print ( binaryData )
e.body["binaryData"] = binaryData ;
print ( datetime.datetime.now().replace(microsecond=0) ) #.isoformat()
print ( e.control["createdAt"] )

def to_json(obj):
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
		return { 'className': obj.className
					 , 'name':obj.name
					 , "type":obj.type
					 , "body":obj.body
					 , "control":obj.control
					 }
	raise TypeError ( repr(obj) + ' is not JSON serializable' )

def from_json ( json_object ):
	if 'type' in json_object:
		if json_object['type'] == 'time.asctime':
			return time.strptime(json_object['data'])
		if json_object['type'] == 'Date':
			# return time.strptime(json_object['data'])
			return json_object['value']
		if json_object['type'] == 'bytes':
			return bytearray(json_object['data'])
		if json_object['type'] == 'Buffer':
			return bytes(json_object['data'])
	return json_object

str = json.dumps ( e, default=to_json ) #, indent=2 )
print (str)

text_file = open ("event.python.json", "w")
text_file.write ( str )
text_file.close()

obj = json.loads ( str, object_hook=from_json )
print (obj)
# print inspect.getmembers ( e )
# def convert_to_builtin_type(obj):
#     print 'default(', repr(obj), ')'
#     # Convert objects to a dictionary of their representation
#     d = { '__class__':obj.__class__.__name__, 
#           '__module__':obj.__module__,
#           }
#     d.update(obj.__dict__)
#     return d

# print json.dumps ( e )
print e.getCreatedAt()
