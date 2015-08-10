#!/usr/bin/env python

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

# Using a name only
client.request ( "getFileList", getFileList )

# Using an Event for possibel additional data
# event = Event ( "getFileList" )
# client.request ( event, getFileList )

