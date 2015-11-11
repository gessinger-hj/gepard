#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

import json
import threading
import time
import types

try:
	from cStringIO import StringIO
except ImportError:
	from io import StringIO

# import ipaddress
# ==========================================================================

from glob import glob

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


# MutableTimer

def runner():
	print ( "I am the runner" )

class MutableTimer:
	def __init__(self,deamon=None):
		self.maxperiod = 24*3600
		self.period     = self.maxperiod
		self.daemon     = deamon == True
		self._lock      = threading.Lock()
		self._condition = threading.Condition ( self._lock )
		self.runnerList = []
		self.stopped = False
		self.indexForNextAction = -1
		self.thread = threading.Thread(target=self.run)
		self.thread.setDaemon ( self.daemon )
		self.thread.start()
	def run(self):
		while True:
			self._condition.acquire()
			self._condition.wait ( self.period )
			if self.indexForNextAction >= 0:
				runContext = self.runnerList[self.indexForNextAction]
				print ( runContext )
				runContext["runner"]()
			self._condition.release()

	def start ( self, period=None, name=None, runner=None ):
		if period == None:
			self._start()
			return
		runContext = {}
		runContext["period"] = period
		runContext["active"] = True
		if isinstance ( name, str ):
			runContext[name] = name
			runContext["runner"] = runner
		elif isinstance ( name, types.FunctionType ):
			runContext["name"] = ""
			runContext["runner"] = name
		self.runnerList.append ( runContext )
		self._start()

	def _start(self):
		self.indexForNextAction = -1
		min_period = self.maxperiod
		for i in range ( 0, len ( self.runnerList ) ):
			runContext = self.runnerList[i]
			period = runContext.get ( "period" )
			active = runContext.get ( "active" )
			if not active:
				continue
			if period < min_period:
				min_period = period
				self.indexForNextAction = i
		if self.indexForNextAction == -1:
			self.period = self.maxperiod
		else:
			self.period = min_period
		try:
			self._condition.acquire()
			self._condition.notify()
		except Exception as e:
			pass
		finally:
			self._condition.release()

mt = MutableTimer ( )
mt.start ( 5, runner )

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