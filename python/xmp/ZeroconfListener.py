#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard
import time
# ==========================================================================

gepard.util.exitWithSIGINT()

def acceptService ( client, service ):
	print ( service )
	return True

def on_ALARM ( event ):
	print ( event )

gepard.Client.getInstance('test-gepard',acceptService).setReconnect ( True ).on ( "ALARM", on_ALARM )

