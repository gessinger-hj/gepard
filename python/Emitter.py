#!/usr/bin/env python

from Gepard import Event, User, Client

# ==========================================================================

client = Client()
# client.setDaemon ( True )
def on_close ( err, info ):
	print ( err )
def on_error ( err, info ):
	print ( err )
def on_shutdown ( err, info ):
	print ( "shutdown called" )
	print ( err )

def failure ( event ):
	print ( event.getStatusReason() )
	event.getClient().close()
def status ( event ):
	print ( event.getStatusReason() )
	event.getClient().close()

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )

client.emit ( "ALARM", status=status )
# client.emit ( "ALARM", failure=failure )
