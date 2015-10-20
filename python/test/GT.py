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

# import ipaddress
# ==========================================================================

from glob import glob

from os import listdir
from os.path import isfile, join
onlyfiles = [ f for f in listdir('.') if isfile(join('.',f)) ]
print ( onlyfiles )

p = gepard.util.getProperty ( "l.anguage" )
print ( "pp=" + str ( p ) )

# fd = open ( "GT.py", "rb" )
# b = fd.read()
# print ( "type(b)=" + str(type(b)) )
# print ( "isinstance ( b, bytes )=" + str(isinstance ( b, str )) )
# ba = bytearray()
# print ( "type(b)=" + str(type(b)) )


fr = gepard.FileReference ( "data.bin" )
# print ( fr )

e = gepard.Event ( "__FILE__" )
e.putValue ( "FR", fr )

e.setUser ( gepard.User ( "gess" ) )

t = e.serialize()
print ( t )

# ee = gepard.Event.deserialize ( t )
# print ( ee )

# FR = ee.getValue ( "FR" )
# print ( str ( FR ) )


# print ( type(t) )

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