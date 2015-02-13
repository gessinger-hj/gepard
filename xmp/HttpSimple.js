#!/usr/bin/env node

"use strict";

if ( require.main === module )
{
  var mime = null ;
  try
  {
    mime = require ( "mime" ) ;
  }
  catch ( exc )
  {
    // console.log ( exc ) ;
  }
  var T      = require ( "../src/Tango" ) ;
  var Log    = require ( "../src/LogFile" ) ;
  var Gepard = require ( "../src/Gepard" ) ;
  
  var http   = require ( 'http') ;
  var fs     = require ( 'fs') ;
  var Path   = require ( 'path') ;
  var url    = require ( 'url' ) ;
  
  var root   = process.cwd() ; //__dirname
  root       = T.getProperty ( "root", root ) ;
  root       = Path.resolve ( root ) ;
  var port   = T.getInt ( "port", 8888 ) ;
  var index  = T.getProperty ( "index", "index.html" ) ;
  var logDir = Gepard.getLogDirectory() ;
  
  Log.init ( "level=info,Xedirect=3,file=%GEPARD_LOG%/%APPNAME%.log:max=1m:v=4") ;

  try
  {
    var stat = fs.statSync ( root ) ;
    if ( ! stat.isDirectory() )
    {
      throw new Error ( "Not a directory: " + root + "\nshutdown." ) ;
    }
    try
    {
      stat = fs.statSync ( Path.join ( root, index ) ) ;
      if ( ! stat.isFile() )
      {
        throw new Error ( "Not a file: " + Path.join ( root, index ) + "\nshutdown." ) ;
      }
    }
    catch ( exc )
    {
      Log.log ( exc.toString() ) ;
      console.log ( exc ) ;
      // process.exit ( 1 ) ;
      return ;
    }
  }
  catch ( exc )
  {
    Log.log ( exc.toString() ) ;
    console.log ( exc ) ;
    // process.exit ( 1 ) ;
    return ;
  }
  try
  {
    http.createServer ( function ( req, res )
    {
      var requestUrl  = url.parse ( req.url ) ;
      var urlPathName = decodeURIComponent ( requestUrl.pathname ) ;

      var path = Path.join ( root, urlPathName ) ;
      var isDir = false ;
      try
      {
        var stat = fs.statSync ( path ) ;
        if ( stat.isFile() )
        {
        }
        else
        {
          path = Path.join ( path, index ) ;
          stat = fs.statSync ( path ) ;
        }
      }
      catch ( exc )
      {
        res.writeHead ( 500 ) ;
        res.end() ;
        return ;
      }
      try
      {
        Log.logln ( path ) ;
        if ( mime )
        {
          res.writeHead ( 200, { "Content-Type": mime.lookup ( path ) } ) ;
        }
        else
        {
          res.writeHead ( 200 ) ;
        }
        var ins = fs.createReadStream ( path ) ;
        ins.pipe ( res ) ;
        ins.on ( "end", function onend_in()
        {
          res.end() ;
        });
      }
      catch ( exc )
      {
        res.end()
        Log.log ( exc ) ;
      }
    }).listen ( port )
    console.log ( "Startet with\n  port=" + port + "\n  log=" + Log._fileName + "\n  root=" + root ) ;
  }
  catch ( exc )
  {
    console.log ( exc ) ;
  }
}