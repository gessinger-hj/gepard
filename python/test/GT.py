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

# import ipaddress
# ==========================================================================

from glob import glob

# def remoteTracer(t):
#   print ( "----------REMOTE-----------" )
#   print ( t )


# tps = gepard.TracePointStore.getStore ( "client" )
# tps.remoteTracer = remoteTracer

# tps.tracer = tps.remoteTracer
# tp = tps.add ( "EVENT_IN" ) #TracePoint()

# tp.active = True
# e = gepard.Event ( "AAA", "BBB" )
# tp.log ( e )

# result = tps.action ( { "output":"local" })
# print ( result )
# tp.log ( e )

# list = [ {"name":"EVENT_IN","state":"off"} ]
# result = tps.action ( { "points":list } )
# print ( result )
# tp.log ( e )

# from os import listdir
# from os.path import isfile, join
# onlyfiles = [ f for f in listdir('.') if isfile(join('.',f)) ]
# print ( onlyfiles )

# p = gepard.util.getProperty ( "l.anguage" )
# print ( "pp=" + str ( p ) )

# fd = open ( "GT.py", "rb" )
# b = fd.read()
# print ( "type(b)=" + str(type(b)) )
# print ( "isinstance ( b, bytes )=" + str(isinstance ( b, str )) )
# ba = bytearray()
# print ( "type(b)=" + str(type(b)) )


# fr = gepard.FileContainer ( "data.bin" )
# # print ( fr )

# e = gepard.Event ( "__FILE__" )
# e.putValue ( "FR", fr )

# e.setUser ( gepard.User ( "gess" ) )

# t = e.serialize()
# print ( t )

# ee = gepard.Event.deserialize ( t )
# print ( ee )

# FR = ee.getValue ( "FR" )

# print ( type(t) )
# print ( str ( FR ) )


#------------------------ MutableTimer ---------------------------
# mt = gepard.MutableTimer ( )

# i = 0
# def runner():
# 	global i
# 	i = i + 1
# 	print ( "i=" + str ( i ) )
# 	if i >= 5:
# 		global mt
# 		mt.stop()
# 		return
# 	print ( "I am the runner" )

# mt.start ( 1, runner )
# time.sleep(10)
# i = 0
# mt.start() ;
# time.sleep(10)
# mt.cancel()

# _NQ = gepard.NamedQueue() ;

# def worker():
# 	"""thread worker function"""
# 	while True:
# 		o = _NQ._get() ;
# 		print ( o )
# 		time.sleep(2)
# 		_NQ._returnObj ( o )
# 	return

# t = threading.Thread(target=worker)
# t.setDaemon ( True )
# t.start()

# _NQ.put ( "ID17", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID16", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID15", "OOOOOOOOOOOOOOOOOOOO" )
# _NQ.put ( "ID14", "OOOOOOOOOOOOOOOOOOOO" )
# ret = _NQ.get ( "ID14" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID15" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID16" )
# print ( "ret=" + ret )
# ret = _NQ.get ( "ID17" )
# print ( "ret=" + ret )

import socket
print(socket.gethostname())
print(socket.gethostbyname(socket.gethostname()))


