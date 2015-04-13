#!/usr/bin/env python

from cStringIO import StringIO
import json
import jsonpickle

class Event ( object ):
	def __init__ (self,name,type=None):
		self.name = name
		self.type = type
		self.body = { "a": 1 }
	def __str__(self):
		str = StringIO()
		str.write("(")
		str.write(self.__class__.__name__)
		str.write(")")
		return str.getvalue()
	# def __repr__(self):
		# return '[{ "type":"Event", "value":{ "name":"' + repr(self.name) + '", "type":"' + repr(self.type) + '"}}]'
		# return '{"s": "instance value goes here", "__module__": "json_myobj", "__class__": "MyObj"}'
		# return "1"
x = 1
if x == 1:
  # indented four spaces
	print "x is 1."

import pprint

# def convert_to_builtin_type(obj):
#     print 'default(', repr(obj), ')'
#     # Convert objects to a dictionary of their representation
#     d = { '__class__':obj.__class__.__name__, 
#           '__module__':obj.__module__,
#           }
#     d.update(obj.__dict__)
#     return d

e = Event("ALARM")
print e
print e.__dict__

print repr(e.__dict__)
# print repr(e)
print json.dumps ( e.__dict__ )
print json.dumps ( e )
# json.encode ( e )
# pp = pprint.PrettyPrinter(indent=4)
# pp.pprint(e)
# print pp.pformat(e)

"""
"""