var T     = require ( "./Tango" ) ;
var Event = require ( "./Event" ) ;
var Log   = require ( "./LogFile" ) ;

/**
 * { function_description }
 *
 * @class      TracePoint
 * @param      {string}  name    name of the tracepoint
 * @param      {boolean}  active  true|false
 */
var TracePoint = function ( name, active )
{
  this.active        = !! active ;
  this.name          = name ;
  this.mode          = "" ;
  this.store         = null ;
  this.title         = "" ;
  this.tracer        = null ;
  this.includeSystem = false ;
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
  return this ;
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
    return false ;
  }
  var tracer = this.tracer ;
  if ( ! tracer )
  {
    tracer = this.store.tracer ;
  }
  s = "" ;
  if ( value instanceof Event )
  {
    if ( value.getName() === "system" && ! this.includeSystem )
    {
      return false ;
    }
    if ( this.title )
    {
      s += this.title ;
      s += "\n" ;
    }
    var mode = this.mode ;
    if ( ! mode ) mode = 'shb' ; // status header and body
    if ( mode === 'a' )
    {
      s += T.toString ( value ) ;
      s += "\n" ;
    }
    if ( mode.indexOf ( 'h' ) >= 0 )
    {
      s += value.getName() + "/" + value.getType() ;
      s += "\n" ;
    }
    if ( mode.indexOf ( 'u' ) >= 0 )
    {
      s += T.toString ( value.user ) ;
      s += "\n" ;
    }
    if ( mode.indexOf ( 'c' ) >= 0 )
    {
      s += T.toString ( value.control ) ;
      s += "\n" ;
    }
    if ( mode.indexOf ( 's' ) >= 0 )
    {
      if ( value.getStatus() )
      {
        s += T.toString ( value.getStatus() ) ;
        s += "\n" ;
      }
    }
    if ( mode.indexOf ( 'b' ) >= 0 )
    {
      s += T.toString ( value.body ) ;
      s += "\n" ;
    }
  }
  else
  {
    if ( this.title )
    {
      s += this.title ;
      s += "\n" ;
    }
    s += T.toString ( value ) ;
  }
  tracer ( s ) ;
  return true ;
};
TracePoint.prototype.isActive = function()
{
  return this.active ;
};
TracePoint.prototype.action = function ( action )
{
  if ( ! action )
  {
    return ;
  }
  if ( typeof action.system !== 'undefined' )
  {
    if ( action.system == "true" )
    {
      this.includeSystem = true ;
    }
    else
    {
      this.includeSystem = false ;
    }
  }
}
/**
 * { function_description }
 *
 * @class      TracePointStore
 * @param      {<type>}  name    { description }
 */
var TracePointStore = function ( name )
{
  this.points        = {} ;
  this.name          = name ? name : "" ;
  this.localTracer   = Log.logln.bind ( Log ) ;
  this.remoteTracer  = null ;
  this.tracer        = this.localTracer ;
};
TracePointStore.prototype.getName = function()
{
  return this.name ;
};
TracePointStore.prototype.log = function ( storeName, value )
{
  var tp = this.points[storeName] ;
  if ( ! tp )
  {
    return ;
  }
  return tp.log ( value ) ;
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
  var tp = null ;
  var i, j, k ;
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
          this.points[k].action ( item )
        }
        continue ;
      }
      tp = this.points[item.name] ;
      if ( tp )
      {
        if ( item.state === 'on' ) tp.active = true ;
        if ( item.state === 'off' ) tp.active = false ;
        if ( item.state === 'toggle' ) tp.active = ! tp.active ;
        tp.mode = item.mode ;
        tp.action ( item )
      }
    }
  }
  var result ;
  {
    result = { name: this.getName(), list: [] } ;
    result["output"] = this.tracer == this.localTracer ? "local" : "remote" ;
    for ( k in this.points )
    {
      result.list.push ( { name:this.points[k].name
                         , active:this.points[k].active
                         , system:this.points[k].includeSystem
                         }
                       );
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
