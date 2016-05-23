#!/usr/bin/env python

import os, sys, datetime
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )
import gepard

gepard.Client.getInstance().emit ( "ALARM" ).close()
