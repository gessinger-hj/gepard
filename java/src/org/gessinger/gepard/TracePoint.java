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
  public void log = function ( Object value )
  {
    if ( ! this.active )
    {
      return ;
    }
    if ( value instanceof Event )
    {
      Event e = (Event) value ;
      if ( this.title != null )
      {
        this.store.logger ( title ) ;
      }
      String mode = this.mode ;
      if ( mode == null ) mode = 'b' ; //body
      if ( mode === 'a' ) this.store.logger ( value ) ;
      if ( mode.indexOf ( 'u' ) >= 0 ) this.store.logger ( e.user ) ;
      if ( mode.indexOf ( 'c' ) >= 0 ) this.store.logger ( e.control ) ;
      if ( mode.indexOf ( 'b' ) >= 0 ) this.store.logger ( e.body ) ;
    }
    else
    {
      String str = Util.toString ( value ) ;
      if ( this.title != null )
      {
        this.store.logger ( title ) ;
      }
      this.store.logger ( str ) ;
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
