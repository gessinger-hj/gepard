package org.gessinger.gepard ;

import java.util.* ;
import java.util.logging.* ;

public class TracePointStore
{
  static HashMap<String,TracePointStore> store = new HashMap<String,TracePointStore>() ;
  static public TracePointStore getStore ( String name )
  {
    if ( name == null ) name = "" ;
    if ( ! store.containsKey ( name ) )
    {
      store.put ( name, new TracePointStore ( name ) ) ;
    }
    return store.get ( name ) ;
  }

  private static Logger LOGGER = Logger.getLogger ( "org.gessinger.gepard" ) ;

  class LocalTracer implements Tracer 
  {
    public void log ( Object o )
    {
      LOGGER.info ( Util.toString ( o ) ) ;
    }
  }

  String name            = "" ;
  Tracer remoteTracer    = null ;
  Tracer localTracer     = new LocalTracer() ;
  Tracer tracer          = localTracer ;
  Boolean isRemoteTracer = false ;

  HashMap<String,TracePoint> points = new HashMap<String,TracePoint>() ;
  public TracePointStore()
  {
    this ( "" ) ;
  }
  public TracePointStore ( String name )
  {
    this.name = name != null ? name : "" ;
  }
  public String getName()
  {
    return name ;
  }
  public TracePoint add ( String name )
  {
    return add ( name, false ) ;
  }
  public TracePoint add ( String name, boolean isActive )
  {
    TracePoint tp = new TracePoint ( name, isActive ) ;
    return add ( tp ) ;
  }
  public TracePoint add ( TracePoint tp )
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
  public TracePoint getTracePoint ( String name )
  {
    return points.get ( name ) ;
  }
  public Map<String,Object> action ( Map<String,Object> action )
  {
     if ( action != null && action.containsKey ( "output" ) )
    {
      if ( "remote".equals ( action.get ( "output" ) ) )
      {
        this.isRemoteTracer = true ;
        this.tracer = this.remoteTracer ;
      }
      else
      {
        this.isRemoteTracer = false ;
        this.tracer = this.localTracer ;
      }
    }
    if ( action != null && action.containsKey ( "points" ) )
    {
      List<Map<String,Object>> list = (List<Map<String,Object>>) action.get ( "points" ) ;
      for ( Map<String,Object> item : list )
      {
        if ( "*".equals ( item.get ( "name" ) ) )
        {
          for ( String key : points.keySet() )
          {
            TracePoint tp = points.get ( key ) ;
            if ( "on".equals ( item.get ( "state" ) ) ) tp.active = true ;
            if ( "off".equals ( item.get ( "state" ) ) ) tp.active = false ;
            if ( "toggle".equals ( item.get ( "state" ) ) ) tp.active = ! tp.active ;
            tp.mode = (String) item.get ( "mode" ) ;
          }
          continue ;
        }
        TracePoint tp = points.get ( item.get ( "name" ) ) ;
        if ( tp != null )
        {
          if ( "on".equals ( item.get ( "state" ) ) ) tp.active = true ;
          if ( "off".equals ( item.get ( "state" ) ) ) tp.active = false ;
          if ( "toggle".equals ( item.get ( "state" ) ) ) tp.active = ! tp.active ;
          tp.mode = (String) item.get ( "mode" ) ;
        }
      }
    }
    Map<String,Object> result = new HashMap<String,Object>() ;
    result.put ( "name", getName() ) ;
    result.put ( "output", this.isRemoteTracer ? "remote" : "local" ) ;
    ArrayList<Map<String,Object>> list = new ArrayList<Map<String,Object>>() ;
    result.put ( "list", list ) ;
    for ( String key : points.keySet() )
    {
      Map<String,Object> m = new HashMap<String,Object>() ;
      TracePoint tp = points.get ( key ) ;
      m.put ( "name", tp.getName() ) ;
      m.put ( "state", new Boolean ( tp.active ) ) ;
      list.add ( m ) ;
    }
    return result ;
  }
  static public void main ( String[] args )
  {
    try
    {
      TracePointStore tps = TracePointStore.getStore ( "XXXX" ) ;

      TracePoint tp1 = tps.add ( "EVENT_IN" ) ;
      tp1.setTitle ( "--------------------------- EVENT_IN ---------------------------" ) ;

      TracePoint tp2 = tps.add ( "EVENT_OUT" ) ;
      tp2.setTitle ( "--------------------------- EVENT_OUT --------------------------" ) ;

      Map<String,Object> result = tps.action ( null ) ;
      System.out.println ( Util.toString ( result ) ) ;
      tp1.log ( "TP1 --------------------" ) ;
      tp2.log ( "TP2 --------------------" ) ;
    }
    catch ( Throwable exc )
    {
      LOGGER.info ( Util.toString ( exc ) ) ;
    }
  }
}
