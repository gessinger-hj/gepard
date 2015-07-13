#!/usr/bin/env python

from Gepard import Event, User, Client

import json

# ==========================================================================

c = Client()
c.connect()

e = Event ("ALARM")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
e.putValue ( "binaryData", binaryData ) ;
e.setFailureInfoRequested()

c.send ( e.serialize() )
t = c.receive()