#!/usr/bin/env python

from Gepard import Event, User, Client

import json

# ==========================================================================
e = Event ("ALARM")
# binaryData = BytesIO(b"ABCDE")
binaryData = bytearray([1,2,3,4,5])
e.putValue ( "binaryData", binaryData ) ;

u = User ( "john", 999, "SECRET" )

u.addRight ( "CAN_READ_FILES", "*.docx" ) ;
e.setUser ( u ) ;

# s = json.dumps ( e, default=Event.to_json ) #, indent=2 )
s = e.serialize() ;
print ( "-------------------------------" )
print (s)

text_file = open ("event.python.json", "w")
text_file.write ( s )
text_file.close()

print ( "-------------------------------" )
ee = Event.deserialize ( s )
# print (obj)
print ( "================================================" )
# print ( ee )
print ( ee.getUser() )

# print	( ee.getUser() )
