var T     = require ( "./Tango" ) ;
var Event = require ( "./Event" ) ;
var Log   = require ( "./LogFile" ) ;

var TracePoint = function ( name, active )
{
  this.active = !! active ;
  this.active = T.getProperty ( name, this.active ) ;

  this.name = name ;
  this.mode = "" ;
};
TracePoint.prototype.log = function ( value )
{
  if ( ! this.active )
  {
    return ;
  }
  if ( value instanceof Event )
  {
    var mode = this.mode ;
    if ( ! mode ) mode = 'b' ; //body
    if ( mode === 'a' ) Log.log ( value ) ;
    if ( mode.indexOf ( 'u' ) >= 0 ) Log.logln ( value.user ) ;
    if ( mode.indexOf ( 'c' ) >= 0 ) Log.logln ( value.control ) ;
    if ( mode.indexOf ( 'b' ) >= 0 ) Log.logln ( value.body ) ;
  }
  else
  {
    var str = T.toString ( value ) ;
    Log.logln ( str ) ;
  }
};
TracePoint.prototype.isActive = function()
{
  return this.active ;
};
var TracePointStore = function ( name )
{
  this.point = {} ;
  this.name = name ? name : "" ;
};
TracePointStore.prototype.getName = function()
{
  return this.name ;
};
TracePointStore.prototype.add = function ( tp, isActive )
{
  if ( tp instanceof TracePoint )
  {
    this.point[tp.name] = tp ;
  }
  else
  {
    this.point[tp] = new TracePoint ( tp, !!isActive ) ;
  }
};
TracePointStore.prototype.remove = function ( name )
{
  delete this.point[name] ;
};
TracePointStore.prototype.action = function ( action )
{
  var i, j, k ;
  if ( action && action.points )
  {
    for ( i = 0 ; i < action.points.length ; i++ )
    {
      var item = action.points[i] ;
      if ( item.name === '*' )
      {
        for ( k in this.point )
        {
          if ( item.state === 'on' ) this.point[k].active = true ;
          if ( item.state === 'off' ) this.point[k].active = false ;
          if ( item.state === 'toggle' ) this.point[k].active = ! this.point[k].active ;
          this.point[k].mode = item.mode ;
        }
        continue ;
      }
      var tp = this.point[item.name] ;
      if ( tp )
      {
        if ( item.state === 'on' ) tp.active = true ;
        if ( item.state === 'off' ) tp.active = false ;
        if ( item.state === 'toggle' ) tp.active = ! tp.active ;
        tp.mode = item.mode ;
      }
    }
  }
  var result ;
  {
    result = { name: this.getName(), list: [] } ;
    for ( k in this.point )
    {
      result.list.push ( { name:this.point[k].name, active:this.point[k].active })
    }
  }
  return result ;
};
if ( typeof org === 'undefined' ) org = {} ;
if ( typeof org.gessinger === 'undefined' ) org.gessinger = {} ;
if ( typeof org.gessinger.tangojs === 'undefined' ) org.gessinger.tangojs = {} ;

if ( ! org.gessinger.tangojs.TracePoints )
{
  org.gessinger.tangojs.TracePoints =
  { list: []
  , store: {}
  , getStore: function getStore ( name )
  {
    if ( ! name ) name = "" ;
    if ( ! this.store[name] )
    {
      this.store[name] = new TracePointStore ( name ) ;
    }
    return this.store[name] ;
  }
  , TracePoint: TracePoint
  } ;
}
module.exports = org.gessinger.tangojs.TracePoints ;
