#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

import json
import time
import sys
# ==========================================================================

name = gepard.util.getProperty ( "name" ) ;
if name == None:
	name = "ALARM,BLARM"
name = name.split ( ',' )

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

def on_ABLARM ( event ):
	print	( "on_ABLARM" )
	if event.getName() == "BLARM":
		client.remove ( "BLARM" )
		tp.log ( "BLARM is removed." )
	print ( event )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )
client.onReconnect ( on_reconnect )
client.onDisconnect ( on_disconnect )

def on_kill ( client, cmd ):
	cmd.setResult ( "Client killed!." )
	os._exit ( 0 )
client.onAction ( "kill", on_kill )
def on_rmfunc ( client, cmd ):
	cmd.setResult ( "function removed!." )
	client.remove ( on_ABLARM )
client.onAction ( "rmfunc", on_rmfunc )
def on_rmname ( client, cmd ):
	cmd.setResult ( "name removed!." )
	client.remove ( name )
client.onAction ( "rmname", on_rmname )

print ( "Listening for " + str ( name ) )
client.on ( name, on_ABLARM )

gepard.util.exitWithSIGINT()

