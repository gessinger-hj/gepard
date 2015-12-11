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
    if ( tracer == null )
    {
      tracer = this.store.tracer ;
    }
    if ( this.title != null )
    {
      tracer.log ( title + "\n" ) ;
    }
    if ( value instanceof Event )
    {
      Event e = (Event) value ;
      String mode = this.mode ;
      if ( mode == null ) mode = "hb" ; // header and body
      if ( mode.equals ( "a" ) ) tracer.log ( e ) ;
      if ( mode.indexOf ( 'h' ) >= 0 ) tracer.log ( e.getName() + "/" + e.getType() ) ;
      if ( mode.indexOf ( 'u' ) >= 0 ) tracer.log ( e.user ) ;
      if ( mode.indexOf ( 'c' ) >= 0 ) tracer.log ( e.control ) ;
      if ( mode.indexOf ( 'b' ) >= 0 ) tracer.log ( e.body ) ;
    }
    else
    {
      tracer.log ( value ) ;
    }
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
