#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

from gepard import Event, Client

client = Client.getInstance()
# client.setDaemon ( True )
def on_close ( err, info ):
	print ( err )
def on_error ( err, info ):
	print ( err )
def on_shutdown ( err, info ):
	print ( "shutdown called" )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )

def on_mass_test_start ( event ):
	event.getClient().n = 0
	print ( "mass-test-start" )
client.on ( "mass-test-start", on_mass_test_start )

def on_mass_test_end ( event ):
	print ( "mass-test-end" )
	print ( "n=" + str(event.getClient().n) )
client.on ( "mass-test-end", on_mass_test_end )

def on_mass_test ( event ):
	event.getClient().n = event.getClient().n + 1
	event.sendBack() ;
client.on ( "mass-test", on_mass_test )

