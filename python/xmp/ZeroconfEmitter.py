#!/usr/bin/env python

import os, sys, inspect
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard
current_line_no = inspect.stack()[0][2]
current_function_name = inspect.stack()[0][3]
print ( str(inspect.stack()[0][2]) + "(" + str(inspect.stack()[0][3]))
gepard.util.exitWithSIGINT()
def acceptService ( client, service ):
	print ( service )
	client.emit ( "ALARM" )
	client.close()
	return True

client = gepard.Client ( 'test-gepard', acceptService )

