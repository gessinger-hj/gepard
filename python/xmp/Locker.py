#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

from gepard import Client, Lock
import time

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

print ( "Try to lock resource='resid:main'" )
lock = Lock ( "resid:main" )
lock.acquire()

if lock.isOwner():
	print ( lock )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	lock.release()
	print ( "Lock released." )
else:
	print ( lock )
