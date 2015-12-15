#!/usr/bin/env python

try:
  from cStringIO import StringIO
except ImportError:
  from io import StringIO

from io import BytesIO

import json
import inspect
import time
import datetime
import socket
import sys
import os
import threading
import types
import numbers
import collections
import resource

from gepard import Event, util

def localTracer(t):
  print ( t )

class TracePoint ( object ):
  def __init__ ( self, name="", active=False ):
    self.active = active
    self.name   = name
    self.mode   = "hb"
    self.store  = None
    self.title  = None
    self.tracer = None
  
  def setTitle ( self, title ):
    self.title = title

  def log ( self, value ):
    if not self.active:
      return
    tracer = self.tracer
    if tracer == None:
      tracer = self.store.tracer
    if isinstance ( value, Event ):
      e = value
      if self.title != None:
        tracer ( self.title )
      mode = self.mode
      if mode == None:
        mode = 'hb'
      if mode == 'a':
        tracer ( e )
      if mode.find ( 'h' ) >= 0: tracer ( e.getName() + "/" + e.getType() )
      if mode.find ( 'u' ) >= 0: tracer ( e.user )
      if mode.find ( 'c' ) >= 0: tracer ( e.control )
      if mode.find ( 'b' ) >= 0: tracer ( e.body )
    else:
      t = str ( value ) ;
      if self.title != None:
        tracer ( self.title )
      tracer ( t )
  def isActive ( self ):
    return self.active

class TracePointStore ( object ):
  def __init__ ( self, name="" ):
    self.points       = {}
    self.localTracer  = localTracer
    self.remoteTracer = None
    self.tracer       = self.localTracer
    self.name         = name
  def getName ( self ):
    return self.name

  def add ( self, tp, isActive=False ):
    if isinstance ( tp, TracePoint ):
      self.points[tp.name] = tp
      tp.active = util.getProperty ( tp.name, tp.active )
    else:
      name              = tp
      tp                = TracePoint ( name, isActive )
      tp.active         = util.getProperty ( name, tp.active )
      self.points[name] = tp
      tp.store          = self
      return tp

  def getTracePoint ( self, name ):
    return self.points.get ( name )

  def remove( self, name ):
    if not isinstance ( name, basestring):
      return
    if name in self.points:
      del self.points[name]

  def action ( self, action=None ):
    if isinstance ( action, dict ):
      if "output" in action:
        output = action["output"]
        if output == "remote":
          self.tracer = self.remoteTracer
        else:
          self.tracer = self.localTracer

      if "points" in action:
        points = action["points"]
        for i in range ( 0, len ( points ) ):
          item = points[i]
          if not "name" in item:
            continue
          mode = item.get ( "mode" )
          name = item.get ( "name" )
          if name == "*":
            state = item.get ( "state" )
            if state == None:
              continue
            for k in self.points:
              point = self.points[k]
              if state == 'on': point.active = True
              if state == 'off': point.active = False
              if state == 'toggle': point.active = not point.active
              if mode != None:
                point.mode = mode
            continue

          tp = self.points[name] ;
          if tp == None:
            continue
          state = item.get ( "state" )
          if state == None:
            continue
          if state == 'on': tp.active = True
          if state == 'off': tp.active = False
          if state == 'toggle': tp.active = not tp.active
          if mode != None:
            point.mode = mode
    result = {}
    result["name"] = self.getName()
    list = []
    result["list"] = list
    for k in self.points:
      point = self.points[k]
      list.append ( { "name":point.name, "active":point.active } )
    return result
