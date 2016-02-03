#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

name   = gepard.util.getProperty ( "name", "ack" ) ;
client = gepard.Client.getInstance()

def fack ( e ):
	print ( "e.getChannel()=" + e.getChannel() ) ;
	e.setStatus ( 0, "ack" ) ;
	e.sendBack() ;

gepard.util.exitWithSIGINT()

client.on ( name, fack )
