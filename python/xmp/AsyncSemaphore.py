#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard
import time

# ==========================================================================

client = gepard.Client.getInstance()

def on_error ( err, info ):
	print ( err )

client.onError ( on_error )

name = "user:4711"

def on_acquired(sem):
	print ( sem )
	print ( "Sleep for 10 seconds" )
	time.sleep(10)
	print ( "sem released." )
	client.close()
	
print ( "Acquire semaphore=" + name )
print ( "  asynchronous mode" )

sem = gepard.Semaphore ( name )
sem.acquire ( on_acquired )
gepard.util.exitWithSIGINT()
