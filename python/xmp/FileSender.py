#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

client = gepard.Client.getInstance()

event = gepard.Event ( "__FILE__" )

file = gepard.util.getProperty ( "file", "FileSender.py" )
event.putValue ( "DATA", gepard.FileContainer ( file ) )

def result ( e ):
	if e.isBad():
		print ( e.getStatus() )
	else:
		print ( e.getStatus() )
		print ( "File " + file + " sent successfully." )
	e.getClient().close()

print ( "Sending " + file )
client.request ( event, result )
