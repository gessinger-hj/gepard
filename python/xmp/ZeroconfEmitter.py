#!/usr/bin/env python

import os, sys, inspect
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

gepard.util.exitWithSIGINT()

def acceptService ( client, service ):
	print ( service )
	if service.isLocalHost():
		client.emit ( "ALARM" )
		client.close()
		return True
	return False

client = gepard.Client.getInstance ( 'test-gepard', acceptService )

