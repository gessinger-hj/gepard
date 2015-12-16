package org.gessinger.gepard ;

import java.util.* ;
import java.util.logging.* ;

public class TracePoint
{
  boolean active        = false ;
  String name           = "" ;
  String mode           = "" ;
  TracePointStore store = null ;
  String title          = null ;
  Tracer tracer         = null ;
  public TracePoint ( String name )
  {
    this ( name, false ) ;
  }
  public TracePoint ( String name, boolean active )
  {
    this.active = active ;
    this.name   = name ;
    this.mode   = null ;
    this.store  = null ;
    this.title  = "" ;
  }
  public void setTitle ( String title )
  {
    this.title = title ;
  }
  public String getName()
  {
    return name ;
  }
  public void log ( Object value )
  {
    if ( ! this.active )
    {
      return ;
    }
    Tracer tracer = this.tracer ;
    StringBuilder sb = new StringBuilder() ;
    if ( tracer == null )
    {
      tracer = this.store.tracer ;
    }
    if ( this.title != null )
    {
      sb.append ( title + "\n" ) ;
    }
    if ( value instanceof Event )
    {
      Event e = (Event) value ;
      String mode = this.mode ;
      if ( mode == null ) mode = "hb" ; // header and body
      if ( mode.equals ( "a" ) )
      {
        sb.append ( Util.toString ( e ) ) ;
        sb.append ( "\n" ) ;
      }
      if ( mode.indexOf ( 'h' ) >= 0 )
      {
        sb.append ( e.getName() + "/" + e.getType() ) ;
        sb.append ( "\n" ) ;
      }
      if ( mode.indexOf ( 'u' ) >= 0 )
      {
        sb.append ( Util.toString ( e.user ) ) ;
        sb.append ( "\n" ) ;
      }
      if ( mode.indexOf ( 'c' ) >= 0 )
      {
        sb.append ( Util.toString ( e.control ) ) ;
        sb.append ( "\n" ) ;
      }
      if ( mode.indexOf ( 'b' ) >= 0 )
      {
        sb.append ( Util.toString ( e.body ) ) ;
        sb.append ( "\n" ) ;
      }
    }
    else
    {
      sb.append ( Util.toString ( value ) ) ;
    }
    tracer.log ( sb.toString() ) ;
  }
  public boolean isActive()
  {
    return this.active ;
  }
  public boolean setActive ( boolean isActive )
  {
    return this.active = isActive ;
  }
}
