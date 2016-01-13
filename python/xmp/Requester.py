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

def getFileList ( e ):
	print ( "callback for get getFileList" )
	if e.isBad():
		print ( e.getStatusReason() )
	else:
		print ( e.getValue ( "file_list" ) )
	e.getClient().close()

client.request ( "getFileList", getFileList )

