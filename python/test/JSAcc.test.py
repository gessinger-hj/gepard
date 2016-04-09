#!/usr/bin/env python

import os, sys
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

from glob import glob

a = gepard.JSAcc()
a.add ( "M1/M2/N", 11 )
# print ( '1 ----------------------' )
print ( json.dumps ( a.value ( "M1/M2/N" ) ) )
print ( json.dumps ( a.value ( "M1/M2" ) ) )
a.add ( "A/B/C", [ "ABCD", "ABCE" ] )
a.add ( "A/B/D", "ABCD" )
a.add ( "A/AX", "AX" )
a.add ( "X", "X" )
# print ( '2 ----------------------' )
print ( json.dumps ( a.map ) )
# print ( '3 ----------------------' )
print ( json.dumps ( a.value ( "A/B" ) ) )
a.remove ( "X" )
# print ( '4 -- a.remove ( "X" )' )
print ( json.dumps ( a.map ) )
a.remove ( "A/B/D" )
# print ( '5 -- a.remove ( "A/B/D" )' )
print ( json.dumps ( a.map ) )
a.remove ( "A" )
# print ( '6 -- a.remove ( "A" )' )
print ( json.dumps ( a.map ) )
a.remove ( "M1/M2/N" )
# print ( '7 -- a.remove ( "M1/M2/N" )' )
print ( json.dumps ( a.map ) )
a.add ( "only/a/map" )
print ( json.dumps ( a.map ) )
