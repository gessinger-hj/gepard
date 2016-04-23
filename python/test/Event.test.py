#!/usr/bin/env python

import os, sys, datetime
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

import json
import threading
import time
import types
import time

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# import ipaddress
# ==========================================================================

from glob import glob

e = gepard.Event ( "__FILE__" )
# e.setUser ( gepard.User ( "gess" ) )

e.putValue ( "STRING", "TEXT" )
e.putValue ( "BINARY", bytearray ( [ 64, 65, 66, 67 ] ) )
e.putValue ( "DATE", datetime.datetime.now() )
e.putValue ( "STRING/IN/PATH", "AAA" )
e.putValue ( "STRING/IN/PATH2", "BBB" )
e.setStatus ( 0, "success", "File accepted.")
e.setIsResult()
print ( e.getStatus() )
print ( e.getStatusReason() )
print ( e.getStatusName() )
print ( e.getStatusCode() )
print ( e.isBad() )
print ( "e.isResult()=" + str ( e.isResult() ) )


t = e.serialize()
print ( t )
ee = gepard.Event.deserialize ( t )
print ( ee.getStatus() )
print ( ee.getUser() )

