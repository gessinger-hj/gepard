#!/usr/bin/env python

import os, sys, datetime
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
from gepard import Client, Event

client = Client.getInstance()
e = Event ( "ALARM" )
e.putValue ( "STRING", "TEXT" )
e.putValue ( "BINARY", bytearray ( [ 64, 65, 66, 67 ] ) )
e.putValue ( "DATE", datetime.datetime.now() )
client.emit ( e )
client.close()
