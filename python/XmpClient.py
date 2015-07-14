#!/usr/bin/env python

from Gepard import Event, User, Client

import json

# ==========================================================================

c = Client()

def on_close ( err, success ):
	print ( "on close called" )
def on_error ( err, success ):
	print ( "on error called" )

c.on ( "close", on_close )
c.on ( "error", on_error )

c.connect()

e = Event ("ALARM")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
e.putValue ( "binaryData", binaryData ) ;
# e.setFailureInfoRequested()
c.emit ( e )
# result = c.receive()
# print ( result )
e = c.readNextJSON()
if e.isBad():
	print ( e.getStatusReason() )
else:
	print ( e )
