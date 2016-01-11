#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;
  var client = gepard.getClient() ;
  client.log ( "SYSTEM LOG TEST JAVASCRIPT"
        , function()
          {
            this.setReconnect ( false ) ;
            this.end() ;
          }
        ) ;
}
//
