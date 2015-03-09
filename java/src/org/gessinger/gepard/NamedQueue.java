package org.gessinger.gepard ;

import java.util.*;

public class NamedQueue<T>
{
  private int _Counter                             = 0 ;
  private Random _Random                           = new Random() ;
  private Vector<Variable<String,T>> _NamedObjects = new Vector<Variable<String,T>>() ;
  private Hashtable<String,String> _WaitingNames   = new Hashtable<String,String>() ;
  private Hashtable<String,T> _ReturnedObjects     = new Hashtable<String,T>() ;
  private boolean _AwakeAll                        = false ;

  public NamedQueue()
  {
  }
  public String put ( T obj )
  {
    _Counter++ ;
    String name = "OID-" + _Counter + "-" + Math.abs ( _Random.nextInt() ) ;
    return put ( name, obj ) ;
  }
  public String put ( String name, T obj )
  {
    Variable<String,T> var = new Variable<String,T> ( name, obj ) ;
    return put ( var ) ;
  }
  synchronized public String put ( Variable<String,T> var )
  {
    String name = var.getName() ;
    _NamedObjects.addElement ( var ) ;
    this.notifyAll() ;
    return name ;
  }
  public T get ( String name )
  {
    return get ( name, 0L ) ;
  }
  synchronized public T get ( String name, long timeoutMillis )
  {
    _WaitingNames.put ( name, "" ) ;
    T o = null;
    if ( timeoutMillis < 0 ) timeoutMillis = 0 ;

    long t_end = System.currentTimeMillis() + timeoutMillis ;

    while ( true )
    {
      o = _ReturnedObjects.get ( name ) ;
      if ( o == null )
      {
        try { this.wait ( timeoutMillis ) ; }
        catch ( InterruptedException e ) { }
      }
      o = _ReturnedObjects.get ( name ) ;
      if ( o != null )
      {
        _WaitingNames.remove ( name ) ;
        _ReturnedObjects.remove ( name ) ;
        return o ;
      }
      if ( timeoutMillis > 0 )
      {
        if ( System.currentTimeMillis() > t_end ) break ;
      }
      if ( _AwakeAll ) break ;
    }
    return o;
  }
  synchronized public T probe ( String name )
  {
    T o = null;

    o = _ReturnedObjects.get ( name ) ;
    if ( o != null ) _ReturnedObjects.remove ( name ) ;
    return o;
  }
  public Variable<String,T> _get()
  {
    return _get ( 0 ) ;
  }
  synchronized public Variable _get ( long timeoutMillis )
  {
    Variable o = null;
    if ( timeoutMillis < 0 ) timeoutMillis = 0 ;

    long t_end = System.currentTimeMillis() + timeoutMillis ;

    while ( true )
    {
      if ( _NamedObjects.size() == 0 )
      {
        try { this.wait ( timeoutMillis ) ; }
        catch ( InterruptedException e ) { }
      }
      if ( _NamedObjects.size() > 0 )
      {
        o = _NamedObjects.elementAt ( 0 ) ;
        _NamedObjects.removeElementAt ( 0 ) ;
        return o ;
      }
      if ( timeoutMillis > 0 )
      {
        if ( System.currentTimeMillis() > t_end ) break ;
      }
      if ( _AwakeAll ) break ;
    }
    return o;
  }
  synchronized public Variable _probe()
  {
    Variable o = null;

    if ( _NamedObjects.size() > 0 )
    {
      o = _NamedObjects.firstElement() ;
      _NamedObjects.removeElementAt ( 0 ) ;
    }
    return o;
  }
  public synchronized void awakeAll()
  {
    _AwakeAll = true ;
    this.notifyAll() ;
  }
  public synchronized boolean isWaiting ( String name )
  {
    return _WaitingNames.containsKey ( name ) ;
  }
  public synchronized int numberOfNamedObjects()
  {
    return _NamedObjects.size() ;
  }
  public synchronized int numberOfReturnedObjects()
  {
    return _ReturnedObjects.size() ;
  }
  /**
   * Return an object into the queue for a waiting requestor-thread.
   * This is for a worker-thread.
   */
  synchronized public void _returnObj ( Variable<String,T> v )
  {
    _ReturnedObjects.put ( v.getName(), v.getValue() ) ;
    this.notifyAll() ;
  }
  /**
   * Return an object into the queue for a waiting requestor-thread.
   * This is for a worker-thread.
   */
  synchronized public void _returnObj ( String name, T o )
  {
    _ReturnedObjects.put ( name, o ) ;
    this.notifyAll() ;
  }
}
