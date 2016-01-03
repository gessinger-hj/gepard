#!/usr/bin/env node

var util = require ( "util" ) ;

var JSAcc = function ( map )
{
  this.className = "JSAcc" ;
  if ( typeof map === 'object' )
  {
    this.map = map ;
  }
  else
  {
    this.map = {} ;
  }
};
JSAcc.prototype.toString = function()
{
  return util.inspect ( this.map, { showHidden: false, depth: null } ) ;    
};
JSAcc.prototype.map = function()
{
  return this.map ;    
};
JSAcc.prototype.value = function ( path, def )
{
  if ( path.indexOf ( "/" ) == -1 )
  {
    var o = this.map[path] ;
    return typeof o === 'undefined' ? def : o ;
  }

  var plist = path.split ( "/" ) ;
  var mm = this.map ;
  for ( var i = 0 ; i < plist.length ; i++ )
  {
    var p = plist[i] ;
    if ( ! p )
    {
      continue ;
    }
    var o = mm[p] ;
    if ( typeof o === 'undefined' )
    {
      return def ;
    }
    if ( i === plist.length - 1 )
    {
      return o ;
    }
    if ( typeof o === 'object' )
    {
      mm = o ;
      continue ;
    }
  }
  return def ;
};
JSAcc.prototype.add = function ( path, obj )
{
  if ( path.indexOf ( "/" ) == -1 )
  {
    this.map[path] = obj ;
    return obj ;
  }
  var plist = path.split ( "/" ) ;
  var m = this.map ;
  for ( var i = 0 ; i < plist.length ; i++ )
  {
    var p = plist[i] ;
    if ( ! p )
    {
      continue ;
    }
    var o = m[p] ;
    if ( i < plist.length - 1 )
    {
      if ( typeof o !== 'object' )
      {
        var mm = {} ;
        m[p] = mm ;
        m = mm ;
      }
      if ( typeof o ==='object' )
      {
        m = o ;
      }
      continue ;
    }
    if ( i === plist.length - 1 )
    {
      m[p] = obj ;
    }
  }
  return obj ;
};
JSAcc.prototype.remove = function ( path )
{
  if ( path.indexOf ( "/" ) == -1 )
  {
    var o = this.map[path] ;
    delete this.map[path] ;
    return o ;
  }
  var plist = path.split ( "/" ) ;
  var mm = this.map ;
  for ( var i = 0 ; i < plist.length ; i++ )
  {
    var p = plist[i] ;
    if ( ! p )
    {
      continue ;
    }
    var o = mm[p] ;
    if ( typeof o === 'undefined' )
    {
      return ;
    }
    if ( i == plist.length - 1 )
    {
      delete mm[p] ;
      return o ;
    }
    if ( typeof o === 'object' )
    {
      mm = o ;
      continue ;
    }
  }
  return ;
};
module.exports = JSAcc ;
if ( require.main === module )
{
  var T = require ( "./Tango" ) ;
  var a = new JSAcc () ;

  a.add ( "M1/M2/N", 11 ) ;
// console.log ( '1 ----------------------' ) ;
  console.log ( JSON.stringify ( a.value ( "M1/M2/N" ) ) ) ;
  console.log ( JSON.stringify ( a.value ( "M1/M2" ) ) ) ;
  a.add ( "A/B/C", [ "ABCD", "ABCE" ] ) ;
  a.add ( "A/B/D", "ABCD" ) ;
  a.add ( "A/AX", "AX" ) ;
  a.add ( "X", "X" ) ;
// console.log ( '2 ----------------------' ) ;
  console.log ( JSON.stringify ( a.map ) ) ;
// console.log ( '3 ----------------------' ) ;
  console.log ( JSON.stringify ( a.value ( "A/B" ) ) ) ;
  a.remove ( "X" ) ;
// console.log ( '4 -- a.remove ( "X" )' ) ;
  console.log ( JSON.stringify ( a.map ) ) ;
  a.remove ( "A/B/D" ) ;
// console.log ( '5 -- a.remove ( "A/B/D" )' ) ;
  console.log ( JSON.stringify ( a.map ) ) ;
  a.remove ( "A" ) ;
// console.log ( '6 -- a.remove ( "A" )' ) ;
  console.log ( JSON.stringify ( a.map ) ) ;
  a.remove ( "M1/M2/N" ) ;
// console.log ( '7 -- a.remove ( "M1/M2/N" )' ) ;
  console.log ( JSON.stringify ( a.map ) ) ;
}
