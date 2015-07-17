#!/usr/bin/env python

from Gepard import Event, User, Client

import json
import time
# ==========================================================================

c = Client()

def on_close ( err, success ):
	print ( err )
def on_error ( err, success ):
	print ( err )
def on_shutdown ( err, success ):
	print ( "shutdown called" )
	print ( err )

def failure ( event ):
	print ( event )

c.onClose ( on_close )
c.onError ( on_error )
c.onShutdown ( on_shutdown )

e = Event ("ALARM")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
e.putValue ( "binaryData", binaryData ) ;
e.setFailureInfoRequested()
c.emit ( e ) #, failure )
# c.emit ( "ALARM" )
# c._startWorker()
# result = c.receive()
# print ( result )
print ( __file__ )
# if e.isBad():
# 	print ( e.getStatusReason() )
# else:
# 	print ( e )
time.sleep(10000)

