#!/usr/bin/env node

/* 
* @Author: gess
* @Date:   2016-01-31 17:36:23
* @Last Modified by:   HG02055
* @Last Modified time: 2016-02-02 18:18:10
*/

'use strict';
var gepard = require ( "gepard" ) ;
var os = require ( "os" ) ;

var _networkAddresses                   = [] ;
var networkInterfaces                    = os.networkInterfaces() ;
for ( var kk in networkInterfaces )
{
  var ll = networkInterfaces[kk]
  for ( var ii = 0 ; ii < ll.length ; ii++ )
  {
    var oo = ll[ii] ;
    _networkAddresses.push ( oo["address"] ) ;
  }
}

var isLocalHost = function ( addr )
{
  if ( typeof _isLocalHost === 'boolean' )
  {
    return _isLocalHost ;
  }
  for ( i = 0 ; i < _networkAddresses.length ; i++ )
  {
    var index = addr.indexOf ( _networkAddresses[i] ) ;
    if ( index < 0 )
    {
      continue ;
    }
    if ( addr.indexOf ( this.broker._networkAddresses[i] ) === addr.length - _networkAddresses[i].length )
    {
      return true ;
    }
  }
  return false ;
};

var bonjour = require('bonjour')() ;
bonjour.publish({ name: 'My Web Server2', type: 'gepard', port: 3100, addresses:["AAA"] }) ;
// bonjour.publish({ name: 'My Web Server2', type: 'gepard', port: 3100, addresses:["AAA"] }) ;
