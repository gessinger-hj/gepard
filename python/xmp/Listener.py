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
	client.setReconnect ( False )
	os._exit(0)
def on_reconnect ( err, success ):
	print ( "reconnect/" + err )
def on_disconnect ( err, success ):
	print ( "on_disconnect" )
	print ( err )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )
client.onReconnect ( on_reconnect )
client.onDisconnect ( on_disconnect )

def on_ABLARM ( event ):
	print	( "on_ABLARM" )
	print ( event )
	date = event.getValue ( "DATE" )
	print ( date )

print ( "Listening for ALARM and BLARM" )
client.on ( ["ALARM", "BLARM"], on_ABLARM )
time.sleep(int('0x7FFFFFFF',16))

