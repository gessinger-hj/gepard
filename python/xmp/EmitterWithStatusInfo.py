#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

from gepard import Event, Client

# ==========================================================================

client = Client.getInstance()

def on_error ( err, info ):
	print ( err )

def status ( event ):
	print ( "status=" + event.getStatusName() )
	print ( event.getStatusReason() )
	event.getClient().close()

client.onError ( on_error )

client.emit ( "ALARM", status=status )
