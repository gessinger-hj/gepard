#!/usr/bin/env python

from gepard import Event, User, Client, MultiMap, NamedQueue

import json
import threading
import time

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# ==========================================================================

_NQ = NamedQueue() ;

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