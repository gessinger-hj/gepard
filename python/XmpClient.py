#!/usr/bin/env python

from Gepard import Event, User, Client

import json
import time
import sys
# ==========================================================================

c = Client()
# c.setDaemon ( True )
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

c.onClose ( on_close )
c.onError ( on_error )
c.onShutdown ( on_shutdown )

def on_ALARM ( event ):
	print	( "----------------- on_ALARM ----------")
	print ( event )

# e = Event ("ALARM")
# binaryData = BytesIO(b"ABCDE")
# binaryData = bytearray([1,2,3,4,5])
# e.putValue ( "binaryData", binaryData ) ;
# c.emit ( e )
# c.emit ( "ALARM", type="XXX", failure=failure )

c.on ( ["ALARM", "BLARM"], on_ALARM )

# def getFileList ( e ):
# 	print ( "---------- callback for get getFileList" )
# 	print ( e )

# c.request ( "getFileList", getFileList )

