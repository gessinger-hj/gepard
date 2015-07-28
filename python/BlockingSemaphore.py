#!/usr/bin/env python

from Gepard import Client, Semaphore
import time

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

print ( "Acquire semaphore=user:4711" )
print ( "  blocking mode" )

sem = Semaphore ( "user:4711" )
sem.acquire()

if sem.isOwner():
	print ( sem )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	sem.release()
	print ( "sem released." )
else:
	print ( sem )
