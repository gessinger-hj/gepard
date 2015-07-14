#!/usr/bin/env python

from Gepard import Event, User, Client

import json

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# ==========================================================================

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

	def getList ( self, key ):
		if key in self._map:
			return self._map[key]
		return None

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
		list = self.getList ( key )
		if list == None:
			return
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

def xxx():
	return 2

mm = MultiMap()
mm.put ( "A", "11111" ) ;
mm.put ( "B", "33333" ) ;
mm.put ( "B", "4444444" ) ;
mm.put ( "B", "11111" ) ;
mm.put ( "A", "33333" ) ;
print ( mm )
print ( "--------------------------" )
mm.remove ( "B", "4444444" ) 
print ( "--------------------------" )
print ( mm )
mm.removeByValue ( "33333" )
print ( "--------------------------" )
print ( mm )
mm.put ( "FUNC", xxx )
print ( mm )
l = mm.getKeysOf ( "11111" )
print ( l )
mm.removeByValue ( xxx )
print ( mm )
