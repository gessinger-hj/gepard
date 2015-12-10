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
    StringBuilder sb = new StringBuilder() ;
    if ( this.title != null )
    {
      this.store.tracer.log ( title + "\n" ) ;
    }
    if ( value instanceof Event )
    {
      Event e = (Event) value ;
      String mode = this.mode ;
      if ( mode == null ) mode = "b" ; //body
      if ( mode.equals ( "a" ) ) this.store.tracer.log ( value ) ;
      if ( mode.indexOf ( 'u' ) >= 0 ) this.store.tracer.log ( e.user ) ;
      if ( mode.indexOf ( 'c' ) >= 0 ) this.store.tracer.log ( e.control ) ;
      if ( mode.indexOf ( 'b' ) >= 0 ) this.store.tracer.log ( e.body ) ;
    }
    else
    {
      this.store.tracer.log ( value ) ;
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
