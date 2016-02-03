#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

name   = gepard.util.getProperty ( "name", "ack" ) ;
client = gepard.Client.getInstance()

def freq ( e ):
	print ( e.getStatus() )
	e.getClient().close()

client.request ( name, freq )
