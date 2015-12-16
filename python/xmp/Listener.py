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
client.setReconnect ( True ) # // Reconnection requested
tp = client.registerTracePoint ( "BLARM_REMOVED" )

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
	print ( "disconnect" )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )
client.onReconnect ( on_reconnect )
client.onDisconnect ( on_disconnect )

def onActionInfo ( client, info ):
	info.add ( "kill", "Shut down this client." )
def onActionCmd ( client, cmd ):
	cmd.setResult ( "I don't " + str ( cmd.cmd ) + "!!")

client.onActionInfo ( onActionInfo )
client.onActionCmd ( onActionCmd )

def on_ABLARM ( event ):
	print	( "on_ABLARM" )
	if event.getName() == "BLARM":
		client.remove ( "BLARM" )
		tp.log ( "BLARM is removed." )
	print ( event )

print ( "Listening for ALARM and BLARM" )
client.on ( ["ALARM", "BLARM"], on_ABLARM )
time.sleep(int('0x7FFFFFFF',16))

