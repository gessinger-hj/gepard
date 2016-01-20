#!/usr/bin/env python

import os, sys, datetime
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
from gepard import Client

client = Client.getInstance()
client.emit ( "ALARM" )
client.close()
