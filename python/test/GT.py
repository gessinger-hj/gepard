#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

import json
import threading
import time

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# ==========================================================================

from glob import glob

from os import listdir
from os.path import isfile, join
onlyfiles = [ f for f in listdir('.') if isfile(join('.',f)) ]
print ( onlyfiles )

_globals = {}

def putProperty ( name, value ):
	setProperty ( name, value )

def setProperty ( name, value ):
	_globals[name] = value

def argsToProperties():
	for i in range ( 0, len ( sys.argv ) ):
		if sys.argv[i].find ( "-D" ) == 0 or sys.argv[i].find ( "--" ) == 0:
			if len ( sys.argv[i] ) < 3 or sys.argv[i][2] == '=':
				print ( "Missing option name: " + sys.argv[i] )
				continue
			pos = sys.argv[i].find ( '=' )
			if pos < 0:
				v = sys.argv[i][2:]
				setProperty ( v, v )
			else:
				setProperty ( sys.argv[i][2:pos], sys.argv[i][pos+1:] )

def getProperty ( name ):
	v = _globals.get ( name )
	if v != None:  return v
	v = os.environ.get ( name )
	if v != None: return v
	if name.find ( '.' ) > 0:
		name = name.replace ( '.', '_' )
		v = os.environ.get ( name )
		if v != None: return v
		name = name.upper() ;
		print ( "name=" + name )
		v = os.environ.get ( name )
		print ( "3 v=" + str(v) )
	return v

# argsToProperties()
# print ( _globals )

# p = getProperty ( "l.anguage" )
# print ( "p=" + str ( p ) )

p = gepard.util.getProperty ( "l.anguage" )
print ( "pp=" + str ( p ) )
print ( gepard.util._globals )
# _NQ = gepard.NamedQueue() ;

# def worker():
# 	"""thread worker function"""
# 	while True:
# 		o = _NQ._get() ;
# 		print ( o )
# 		time.sleep(2)
# 		_NQ._returnObj ( o )
# 	return

# t = threading.Thread(target=worker)
# t.setDaemon ( True )
# t.start()

# _NQ.put ( "ID17", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID16", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID15", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID14", "OOOOOOOOOOOOOOOOOOOO" )
# ret = _NQ.get ( "ID14" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID15" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID16" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID17" )
# print ( "ret=" + ret )