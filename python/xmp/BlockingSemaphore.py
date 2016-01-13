#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import time
sys.path.insert(0,"../")
import gepard

# ==========================================================================

client = gepard.Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

name = "user:4711"

print ( "Acquire semaphore=" + name )
print ( "  blocking mode" )

gepard.util.exitWithSIGINT()
sem = gepard.Semaphore ( name, client )

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
