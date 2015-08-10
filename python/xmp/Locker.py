#!/usr/bin/env python

from gepard import Client, Lock
import time

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

lock = Lock ( "user:4711" )
lock.acquire()

if lock.isOwner():
	print ( lock )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	lock.release()
	print ( "Lock released." )
else:
	print ( lock )
