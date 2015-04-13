#!/usr/bin/env python

from cStringIO import StringIO
import json
import inspect
import time
import datetime

class Event ( object ):
	def __init__ (self,name,type=None,body=None):
		if not isinstance ( name, basestring):
			raise ValueError ( "name must be a non empty string, not: " + str(name) + "(" + name.__class__.__name__ + ")" )
		if type != None and not isinstance ( type, basestring):
			raise ValueError ( "type must be None or a non empty string, not: " + str(type) + "(" + type.__class__.__name__ + ")" )
		self.name = name
		self.type = type
		if body == None:
			self.body = {}
		elif isinstance ( body, dict ):
			self.body = body
		else:
			raise ValueError ( "body must be None or a dict, not: " + str(body) + "(" + name.__class__.__name__ + ")" )
		self.user = None
		self.control = { "createdAt": datetime.datetime.now().replace(microsecond=0) } ;
	def getName ( self ):
		return self.name
	def __str__(self):
		str = StringIO()
		str.write("(")
		str.write(self.__class__.__name__)
		str.write(")")
		return str.getvalue()

e = Event ("ALARM")
print datetime.datetime.now().replace(microsecond=0) #.isoformat()
print e.control["createdAt"]

def to_json(obj):
	if isinstance ( obj, bytes ):
		return { '__class__': 'bytes',
						 '__value__': list(obj)
					 }
	if isinstance ( obj, Event ):
		return { '__class__': 'Event',
						 '__value__': { 'name':obj.name, "type":obj.type }
					 }
	raise TypeError ( repr(obj) + ' is not JSON serializable' )

print json.dumps ( e, default=to_json, indent=2 )
print dir(e)
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
