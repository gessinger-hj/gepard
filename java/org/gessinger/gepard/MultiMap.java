package org.gessinger.gepard ;

import java.util.* ;

public class MultiMap<K,V> extends HashMap
{
  public MultiMap() { super() ; }
  public MultiMap ( int initialCapacity )
  {
    super ( initialCapacity ) ;
  }
  public MultiMap ( int initialCapacity, float loadFactor )
  {
    super ( initialCapacity, loadFactor ) ;
  }
  public List<V> get ( K key )
  {
    return (List<V>)super.get ( key ) ;
  }
  public List<V> put ( K key, V value )
  {
    List<V> list = (List<V>)super.get ( key ) ;
    if ( list == null )
    {
      list = new ArrayList<V>() ;
      super.put ( key, list ) ;
    }
    list.add ( value ) ;
    return list ;
  }
  public V remove ( K key, V value )
  {
    V rc = null ;
    List<V> list = (List<V>)get ( key ) ;
    if ( list == null ) return rc ;
    int index = list.indexOf ( value ) ;
    rc = list.remove ( index ) ;
    if ( list.isEmpty() )
    {
      super.remove ( key ) ;
    }
    return rc ;
  }
  public void remove ( V value )
  {
    ArrayList<K> toBeRemoved = new ArrayList<K>() ;
    for ( K key : keySet() )
    {
      List<V> list = (List<V>)get ( key ) ;
      list.remove ( value ) ;
      if ( list.isEmpty() )
      {
        toBeRemoved.add ( key ) ;
      }
    }
    for ( K key : toBeRemoved )
    {
      super.remove ( key ) ;
    }
  }
  public Set<K> keySet()
  {
    return (Set<K>) super.keySet() ;
  }
  public void clear()
  {
    for ( Object k : keySet() )
    {
      ((List)get ( k )).clear() ;
    }
    super.clear() ;
  }
}
