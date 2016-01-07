#!/usr/bin/env node
fs = require ( "fs" )

// s = fs.readFileSync ( "RSE_0_1-R6_Scenario5_2.xml", "utf-8" ) ;
s = fs.readFileSync ( "RSE_0_1-R6_Scenario5_2.xml" ) ;
// s = fs.readFileSync ( "RSE_0_1-R6_Scenario5_2.xml.gz" ) ;
// s = fs.readFileSync ( "FRSE_0_1-Barclays.xml" ) ; //, "utf-8" ) ;
var gepard = require ( "gepard" ) ;
var c = gepard.getClient() ;
var e = new gepard.Event ( "ALARM" ) ;
e.putValue ( "DATA", s ) ;
c.emit ( e
      , function()
        {
          this.setReconnect ( false ) ;
          this.end() ;
        }
      ) ;
