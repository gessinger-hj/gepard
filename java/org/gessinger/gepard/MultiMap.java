package org.gessinger.gepard ;

import java.util.* ;

public class MultiMap<K,V>
{
	HashMap<K,List<V>> map = null ;
  public MultiMap()
  {
		map = new HashMap<K,List<V>>() ;
  }
  public MultiMap ( int initialCapacity )
  {
		map = new HashMap<K,List<V>> ( initialCapacity ) ;
  }
  public MultiMap ( int initialCapacity, float loadFactor )
  {
		map = new HashMap<K,List<V>> ( initialCapacity, loadFactor ) ;
  }
  public List<V> get ( K key )
  {
    return map.get ( key ) ;
  }
  public List<V> put ( K key, V value )
  {
    List<V> list = map.get ( key ) ;
    if ( list == null )
    {
      list = new ArrayList<V>() ;
      map.put ( key, list ) ;
    }
    list.add ( value ) ;
    return list ;
  }
  public V remove ( K key, V value )
  {
    V rc = null ;
    List<V> list = map.get ( key ) ;
    if ( list == null ) return rc ;
    int index = list.indexOf ( value ) ;
    rc = list.remove ( index ) ;
    if ( list.isEmpty() )
    {
      map.remove ( key ) ;
    }
    return rc ;
  }
  public void remove ( V value )
  {
    ArrayList<K> toBeRemoved = new ArrayList<K>() ;
    for ( K key : keySet() )
    {
      List<V> list = map.get ( key ) ;
      list.remove ( value ) ;
      if ( list.isEmpty() )
      {
        toBeRemoved.add ( key ) ;
      }
    }
    for ( K key : toBeRemoved )
    {
      map.remove ( key ) ;
    }
  }
  public Set<K> keySet()
  {
    return map.keySet() ;
  }
  public void clear()
  {
    for ( K k : keySet() )
    {
      map.get ( k ).clear() ;
    }
    map.clear() ;
  }
}
