#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

import json
import time
import sys
# ==========================================================================

client = gepard.Client.getInstance()
# client.setDaemon ( True )
def on_close ( err, success ):
	print ( err )
def on_error ( err, success ):
	print ( err )
def on_shutdown ( err, success ):
	print ( "shutdown called" )
	print ( err )

def failure ( event ):
	print ( event.getStatusReason() )
	c.close()
	sys.exit()

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )

def on_ABLARM ( event ):
	print	( "on_ABLARM" )
	print ( event )
	date = event.getValue ( "DATE" )
	print ( date )

print ( "Listening for ALARM and BLARM" )
client.on ( ["ALARM", "BLARM"], on_ABLARM )

