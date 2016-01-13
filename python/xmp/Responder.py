#!/usr/bin/env python

import os, sys
sys.path.insert ( 0, os.path.dirname(os.path.abspath(__file__) ) + "/../" )

import gepard

client = gepard.Client.getInstance()
# client.setDaemon ( True )
def on_close ( err, info ):
	print ( err )
def on_error ( err, info ):
	print ( err )
def on_shutdown ( err, info ):
	print ( "shutdown called" )

client.onClose ( on_close )
client.onError ( on_error )
client.onShutdown ( on_shutdown )

print ( "Listen for requests with name=getFileList" ) ;

fileList = [ "a.py", "b.py", "c.py" ] ;
def on_getFileList ( event ):
	print ( "Request in" ) ;
	print ( "File list out:" ) ;
	print ( fileList ) ;
	event.body["file_list"] = fileList ;
	event.sendBack() ;

client.on ( "getFileList", on_getFileList )

gepard.util.exitWithSIGINT()
