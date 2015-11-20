#!/usr/bin/env node
if ( require.main === module )
{
  var gepard = require ( "gepard" ) ;
  var c = gepard.getClient() ;
  c.log ( "SYSTEM LOG TEST")
}
