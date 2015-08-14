package org.gessinger.gepard ;

import java.util.*;

public class SyncedQueue<T>
{
  private Vector<T> _list = new Vector<T>() ;
  boolean _AwakeAll = false ;
  public SyncedQueue()
  {
  }
  synchronized public void put ( T o ) 
  {
    _list.add ( o ) ;
    this.notify() ;
  }
  synchronized public T get ( )
  {
    T o = null;
    if ( _list.size() == 0 )
    {
      try { this.wait() ; }
      catch ( InterruptedException e ) { }
    }
    if ( _AwakeAll )
    {
      return o ;
    }
    if ( _list.size() > 0 )
    {
      o = _list.firstElement() ;
      _list.removeElementAt ( 0 ) ;
    }
    return o;
  }
  synchronized public T probe ( )
  {
    T o = null;
    if ( _list.size() > 0 )
    {
      o = _list.firstElement() ;
      _list.removeElementAt ( 0 ) ;
    }
    return o;
  }
  public synchronized void awakeAll()
  {
    _AwakeAll = true ;
    this.notifyAll() ;
  }
  public synchronized int size()
  {
    return _list.size() ;
  }
}
