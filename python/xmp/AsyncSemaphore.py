#!/usr/bin/env python

from gepard import Client, Semaphore
import time

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

name = "user:10000"

def on_acquired(sem):
	print ( sem )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	sem.release()
	print ( "sem released." )

print ( "Acquire semaphore=" + name )
print ( "  asynchronous mode" )

sem = Semaphore ( name )
sem.acquire ( on_acquired )
