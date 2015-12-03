var T     = require ( "./Tango" ) ;
var Event = require ( "./Event" ) ;
var Log   = require ( "./LogFile" ) ;

var TracePoint = function ( name, active )
{
  this.active = !! active ;

  this.name = name ;
  this.mode = "" ;
  this.store = null ;
  this.title = "" ;
};
TracePoint.prototype.setTitle = function ( title )
{
  this.title = title ;
};
TracePoint.prototype.log = function ( value )
{
  if ( ! this.active )
  {
    return ;
  }
  if ( value instanceof Event )
  {
    if ( this.title )
    {
      this.store.logger ( title ) ;
    }
    var mode = this.mode ;
    if ( ! mode ) mode = 'b' ; //body
    if ( mode === 'a' ) this.store.logger ( value ) ;
    if ( mode.indexOf ( 'u' ) >= 0 ) this.store.logger ( value.user ) ;
    if ( mode.indexOf ( 'c' ) >= 0 ) this.store.logger ( value.control ) ;
    if ( mode.indexOf ( 'b' ) >= 0 ) this.store.logger ( value.body ) ;
  }
  else
  {
    var str = T.toString ( value ) ;
    if ( this.title )
    {
      this.store.logger ( title ) ;
    }
    this.store.logger ( str ) ;
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
  this.logger = Log.logln.bind ( Log ) ;
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
    tp.active = T.getProperty ( tp.name, tp.active ) ;
  }
  else
  {
    var name  = tp ;
    tp        = new TracePoint ( name, !!isActive ) ;
    tp.active = T.getProperty ( name, tp.active ) ;
    this.point[name] = tp ;
  }
  tp.store = this ;
  return tp ;
};
TracePointStore.prototype.remove = function ( name )
{
  if ( this.point[name] )
  {
    this.point[name].store = null ; 
  }
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
