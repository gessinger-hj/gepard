#!/usr/bin/env python

import time, sys
sys.path.insert(0,"../")
from gepard import Client, Semaphore

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

name = "user:10000"

print ( "Acquire semaphore=" + name )
print ( "  blocking mode" )

sem = Semaphore ( name, client )

print ( "  acquire with timeout=5" )
sem.acquire ( 5 )

if sem.isOwner():
	print ( sem )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	sem.release()
	print ( "sem released." )
else:
	print ( sem )