#!/usr/bin/env python

import os, sys, datetime
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

client = gepard.Client.getInstance()

event = gepard.Event ( "__FILE__" )

fileName = gepard.util.getProperty ( "file", "data.bin" )
print ( "fileName=" + str ( fileName ) )
fr = gepard.FileReference ( fileName )
event.putValue ( "FR", fr )

def result ( e ):
	print ( "callback for __FILE__" )
	FR = e.getValue ( "FR" )
	print ( type(FR["data"]) )
	# print ( e )
	# if e.isBad():
	# 	print ( e.getStatusReason() )
	# else:
	# 	print ( e.getValue ( "file_list" ) )
	e.getClient().close()

# Using a name only
client.request ( event, result )
