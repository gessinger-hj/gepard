#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

client = gepard.Client.getInstance()
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

def on___FILE__ ( e ):
	data = e.removeValue ( "DATA" )
	print ( data.getName() + " received." ) ;
	fname = data.getName() + ".in"
	try:
		data.write ( fname ) ;
		print ( fname + " written.")
		e.setStatus ( 0, "success", "File accepted.")
	except Exception as exc:
		print ( exc )
		e.setStatus ( 1, "error", "File not accepted.")
	try:
		e.sendBack() ;
	except Exception as e:
		print ( e )

client.on ( "__FILE__", on___FILE__ )
gepard.util.exitWithSIGINT()
