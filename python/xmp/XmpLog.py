#!/usr/bin/env python

import os, sys, datetime, calendar

sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
from gepard import Client, util

client = Client.getInstance()

client.log ( "SYSTEM LOG TEST PYTHON" )
client.close()

date = datetime.datetime.now()
print ( util.formatDateAsRFC3339 ( date ) )
