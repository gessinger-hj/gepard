package org.gessinger.gepard ;

import java.util.* ;
import java.util.logging.* ;

public class TracePointStore
{
  HashMap<String,TracePoint> points = new HashMap<String,TracePoint>() ;
  public TracePointStore()
  {
    this ( "" ) ;
  }
  public TracePointStore ( String name )
  {
    this.name = name ? name : "" ;
    this.logger = null ; //Log.logln.bind ( Log ) ;
  };
  public String getName()
  {
    return this.name ;
  }
  public TracePoint add function ( String name )
  {
    return add ( name, false ) ;
  }
  public TracePoint add function ( String name, boolean isActive )
  {
    TracePoint tp = new TracePoint ( name, isActive ) ;
    return add ( tp, isActive ) ;
  }
  public TracePoint add function ( TracePoint tp )
  {
    points.put ( tp.getName(), tp ) ;
    tp.setActive ( Util.getBool ( tp.getName(), tp.isActive() ) ) ;
    tp.store = this ;
    return tp ;
  }
  public TracePoint remove ( String name )
  {
    return points.remove ( name ) ;
  }
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
