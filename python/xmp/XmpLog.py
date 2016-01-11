#!/usr/bin/env python

import os, sys

sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

client = gepard.Client.getInstance()

client.log ( "SYSTEM LOG TEST PYTHON" )
client.close()
