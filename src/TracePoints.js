var T     = require ( "./Tango" ) ;
var Event = require ( "./Event" ) ;
var Log   = require ( "./LogFile" ) ;

/**
 * { function_description }
 *
 * @class      TracePoint
 * @param      {<type>}  name    { description }
 * @param      {<type>}  active  { description }
 */
var TracePoint = function ( name, active )
{
  this.active = !! active ;

  this.name   = name ;
  this.mode   = "" ;
  this.store  = null ;
  this.title  = "" ;
  this.tracer = null ;
};
/**
 * { function_description }
 *
 * @method     setTitle
 * @param      {<type>}  title   { description }
 */
TracePoint.prototype.setTitle = function ( title )
{
  this.title = title ;
};
/**
 * { function_description }
 *
 * @method     log
 * @param      {String}  value   { description }
 */
TracePoint.prototype.log = function ( value )
{
  if ( ! this.active )
  {
    return ;
  }
  var tracer = this.tracer ;
  if ( ! tracer )
  {
    tracer = this.store.tracer ;
  }
  if ( value instanceof Event )
  {
    if ( this.title )
    {
      tracer ( this.title ) ;
    }
    var mode = this.mode ;
    if ( ! mode ) mode = 'hb' ; // header and body
    if ( mode === 'a' ) tracer ( value ) ;
    if ( mode.indexOf ( 'h' ) >= 0 ) tracer ( value.getName() + "/" + value.getType() ) ;
    if ( mode.indexOf ( 'u' ) >= 0 ) tracer ( value.user ) ;
    if ( mode.indexOf ( 'c' ) >= 0 ) tracer ( value.control ) ;
    if ( mode.indexOf ( 'b' ) >= 0 ) tracer ( value.body ) ;
  }
  else
  {
    var str = T.toString ( value ) ;
    if ( this.title )
    {
      tracer ( this.title ) ;
    }
    tracer ( str ) ;
  }
};
TracePoint.prototype.isActive = function()
{
  return this.active ;
};
/**
 * { function_description }
 *
 * @class      TracePointStore
 * @param      {<type>}  name    { description }
 */
var TracePointStore = function ( name )
{
  this.points       = {} ;
  this.name         = name ? name : "" ;
  this.localTracer  = Log.logln.bind ( Log ) ;
  this.remoteTracer = null ;
  this.tracer       = this.localTracer ;
};
TracePointStore.prototype.getName = function()
{
  return this.name ;
};
TracePointStore.prototype.add = function ( tp, isActive )
{
  if ( tp instanceof TracePoint )
  {
    this.points[tp.name] = tp ;
    tp.active = T.getProperty ( tp.name, tp.active ) ;
  }
  else
  {
    var name  = tp ;
    tp        = new TracePoint ( name, !!isActive ) ;
    tp.active = T.getProperty ( name, tp.active ) ;
    this.points[name] = tp ;
  }
  tp.store = this ;
  return tp ;
};
TracePointStore.prototype.getTracePoint = function ( name )
{
  return this.points[name] ;
};
TracePointStore.prototype.remove = function ( name )
{
  if ( this.points[name] )
  {
    this.points[name].store = null ; 
  }
  delete this.points[name] ;
};
TracePointStore.prototype.action = function ( action )
{
  if ( action && action.output )
  {
    if ( action.output === 'remote' )
    {
      this.tracer = this.remoteTracer ;
    }
    else
    {
      this.tracer = this.localTracer ;
    }
  }
  var i, j, k ;
  if ( action && action.points )
  {
    for ( i = 0 ; i < action.points.length ; i++ )
    {
      var item = action.points[i] ;
      if ( item.name === '*' )
      {
        for ( k in this.points )
        {
          if ( item.state === 'on' ) this.points[k].active = true ;
          if ( item.state === 'off' ) this.points[k].active = false ;
          if ( item.state === 'toggle' ) this.points[k].active = ! this.points[k].active ;
          this.points[k].mode = item.mode ;
        }
        continue ;
      }
      var tp = this.points[item.name] ;
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
    for ( k in this.points )
    {
      result.list.push ( { name:this.points[k].name, active:this.points[k].active })
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
