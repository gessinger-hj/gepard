#!/usr/bin/env python

from Gepard import Event, User, Client, MultiMap

import json
import threading
import time

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# ==========================================================================

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

def worker():
	"""thread worker function"""
	while True:
		print ( 'Worker' )
		time.sleep(2)
	return
t = threading.Thread(target=worker)
t.setDaemon ( True )
t.start()
t.join()