#!/usr/bin/env python

from Gepard import Event, User, Client, Lock
import time

# ==========================================================================

client = Client.getInstance()

# client.setDaemon ( True )
def on_close ( err, info ):
	print ( err )
def on_error ( err, info ):
	print ( err )
def on_shutdown ( err, info ):
	print ( "shutdown called" )
	print ( err )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )

lock = Lock ( "user:4711" )
lock.acquire()

if lock.isOwner():
	print ( lock )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	print ( "release" )
	lock.release()
else:
	print ( lock )

lock.getClient().close() ;
