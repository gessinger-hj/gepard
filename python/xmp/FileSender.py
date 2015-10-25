#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

client = gepard.Client.getInstance()

event = gepard.Event ( "__FILE__" )

file = gepard.util.getProperty ( "file", "FileSender.py" )
fr = gepard.FileContainer ( file )
event.putValue ( "FR", fr )

def result ( e ):
	if e.isBad():
		print ( e.getStatusReason() )
	else:
		print ( "File " + file + " sent successfully." )
	e.getClient().close()

print ( "Sending " + file )
client.request ( event, result )
