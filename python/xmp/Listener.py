#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

from gepard import Event, User, Client

import json
import time
import sys
def __LINE__():
        try:
                raise Exception
        except:
                return sys.exc_info()[2].tb_frame.f_back.f_lineno
def __FILE__():
        return inspect.currentframe().f_code.co_filename
# ==========================================================================

c = Client.getInstance()
# c.setDaemon ( True )
def on_close ( err, success ):
	print ( err )
def on_error ( err, success ):
	print ( err )
def on_shutdown ( err, success ):
	print ( "shutdown called" )
	print ( err )

def failure ( event ):
	print ( event.getStatusReason() )
	c.close()
	sys.exit()

c.onClose ( on_close )
c.onError ( on_error )
c.onShutdown ( on_shutdown )

def on_ABLARM ( event ):
	print(__LINE__())
	print	( "on_ABLARM" )
	print ( event )

print ( "Listening for ALARM and BLARM" )
c.on ( ["ALARM", "BLARM"], on_ABLARM )

