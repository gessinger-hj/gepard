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

s1 = "ABC12"
i = s1.find ( "C1 ")
print ( "i=" + i )
_NQ = gepard.NamedQueue() ;

def worker():
	"""thread worker function"""
	while True:
		o = _NQ._get() ;
		print ( o )
		time.sleep(2)
		_NQ._returnObj ( o )
	return

t = threading.Thread(target=worker)
t.setDaemon ( True )
t.start()

_NQ.put ( "ID17", "OOOOOOOOOOOOOOOOOOOO" )
_NQ.put ( "ID16", "OOOOOOOOOOOOOOOOOOOO" )
_NQ.put ( "ID15", "OOOOOOOOOOOOOOOOOOOO" )
_NQ.put ( "ID14", "OOOOOOOOOOOOOOOOOOOO" )
ret = _NQ.get ( "ID14" )
print ( "ret=" + ret )
ret = _NQ.get ( "ID15" )
print ( "ret=" + ret )
ret = _NQ.get ( "ID16" )
print ( "ret=" + ret )
ret = _NQ.get ( "ID17" )
print ( "ret=" + ret )