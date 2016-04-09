package org.gessinger.gepard ;

import java.util.* ;
import com.google.gson.* ;

public class JSAcc
{
  Map map = null ;
  public JSAcc()
  {
    this ( null ) ;
  }
  public JSAcc ( Map m )
  {
    if ( ! ( m instanceof Map ) )
    {
      m = new HashMap() ;
    }
    map = m ;
  }
  public String toString (  )
  {
    return Util.toString ( map ) ;    
  }
  /**
   * @brief      Get the map
   *
   * @return     the map
   */
  public Map map (  )
  {
    return map ;    
  }
  /**
   * @brief      Retrieve a value object from the JSON tree
   *
   * @param      path  '/' separated names
   *
   * @return     found object or null
   */
  public Object value ( String path )
  {
    return value ( path, null ) ;
  }
  /**
   * @brief      Retrieve a value object from the JSON tree
   *
   * @param      path  '/' separated names
   * @param      def   default object if path does not exist.
   *
   * @return     found object or given default
   */
  public Object value ( String path, Object def )
  {
    return value ( map, path, def ) ;
  }
  /**
   * @brief      Create path if it does not exist
   * 
   * @param      path  '/' separated names
   *
   * @return     { description_of_the_return_value }
   */
  public Object add ( String path )
  {
    return add ( map, path ) ;    
  }
  /**
   * @brief      Create path if it does not exist and store obj
   * 
   * @param      path  '/' separated names
   * @param      obj   object to be stared
   *
   * @return     { description_of_the_return_value }
   */
  public Object add ( String path, Object obj )
  {
    return add ( map, path, obj ) ;    
  }
  /**
   * @brief      Retrieve a value object from the JSON tree
   *
   * @param      m     Map of interest
   * @param      path  '/' separated names
   *
   * @return     found object or null
   */
  public static Object value ( Map m, String path )
  {
    return value ( m, path, null ) ;
  }
  /**
   * @brief      Retrieve a value object from the JSON tree
   *
   * @param      m     Map of interest
   * @param      path  '/' separated names
   * @param      def   default object if path does not exist.
   *
   * @return     found object or given default
   */
  public static Object value ( Map m, String path, Object def )
  {
    if ( path.indexOf ( "/" ) == -1 )
    {
      Object o = m.get ( path ) ;
      return o == null ? def : o ;
    }

    String[] plist = path.split ( "/" ) ;
    Map mm = m ;
    for ( int i = 0 ; i < plist.length ; i++ )
    {
      String p = plist[i] ;
      if ( p.length() == 0 )
      {
        continue ;
      }
      Object o = mm.get ( p ) ;
      if ( o == null )
      {
        return def ;
      }
      if ( i == plist.length - 1 )
      {
        return o ;
      }
      if ( o instanceof Map )
      {
        mm = (Map) o ;
        continue ;
      }
    }
    return def ;
  }
  /**
   * @brief      add only a map
   *
   * @param      Map root  Map
   * @param      String path  path
   *
   * @return     the new created map
   */
  public static Object add ( Map root, String path )
  {
    return add ( root, path, null ) ;
  }
  /**
   * @brief      Create path if it does not exist and store obj
   *
   * @param      root  Map of interest
   * @param      path  '/' separated names
   * @param      obj   object to be stared
   *
   * @return     { description_of_the_return_value }
   */
  public static Object add ( Map root, String path, Object obj )
  {
    if ( path.indexOf ( "/" ) == -1 )
    {
      root.put ( path, obj ) ;
      return obj ;
    }
    String[] plist = path.split ( "/" ) ;
    Map m = root ;
    for ( int i = 0 ; i < plist.length ; i++ )
    {
      String p = plist[i] ;
      if ( p.length() == 0 )
      {
        continue ;
      }
      Object o = m.get ( p ) ;
      if ( i < plist.length - 1 )
      {
        if ( ! ( o instanceof Map ) )
        {
          Map mm = new HashMap() ;
          m.put ( p, mm ) ;
          m = mm ;
        }
        if ( o instanceof Map )
        {
          m = (Map) o ;
        }
        continue ;
      }
      if ( i == plist.length - 1 )
      {
        if ( obj == null ) obj = new HashMap() ;
        m.put ( p, obj ) ;
      }
    }
    return obj ;
  }
  /**
   * @brief      remove path
   *
   * @param      path  
   *
   * @return     removed object
   */
  public Object remove ( String path )
  {
    return remove  ( map, path ) ;
  }
  static public Object remove ( Map m, String path )
  {
    if ( path.indexOf ( "/" ) == -1 )
    {
      return m.remove  ( path ) ;
    }
    String[] plist = path.split ( "/" ) ;
    Map mm = m ;
    for ( int i = 0 ; i < plist.length ; i++ )
    {
      String p = plist[i] ;
      if ( p.length() == 0 )
      {
        continue ;
      }
      Object o = mm.get ( p ) ;
      if ( o == null )
      {
        return null ;
      }
      if ( i == plist.length - 1 )
      {
        mm.remove ( p ) ;
        return o ;
      }
      if ( o instanceof Map )
      {
        mm = (Map) o ;
        continue ;
      }
    }
    return null ;
  }
  public static void main(String[] args)
  throws Exception
  {
    Gson gson = new Gson() ;
    JSAcc a = new JSAcc () ;
    a.add ( "M1/M2/N", 11 ) ;
// System.out.println ( "1 ----------------------" ) ;
  System.out.println ( gson.toJson ( a.value ( "M1/M2/N" ) ) ) ;
  System.out.println ( gson.toJson ( a.value ( "M1/M2" ) ) ) ;
    a.add ( "A/B/C", new String[] { "ABCD", "ABCE" } ) ;
    a.add ( "A/B/D", "ABCD" ) ;
    a.add ( "A/AX", "AX" ) ;
    a.add ( "X", "X" ) ;
// System.out.println ( "2 ----------------------" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
// System.out.println ( "3 ----------------------" ) ;
  System.out.println ( gson.toJson ( a.value ( "A/B" ) ) ) ;
    a.remove ( "X" ) ;
// System.out.println ( "4 -- a.remove ( 'X' )" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
    a.remove ( "A/B/D" ) ;
// System.out.println ( "5 -- a.remove ( 'A/B/D' )" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
    a.remove ( "A" ) ;
// System.out.println ( "6 -- a.remove ( 'A' )" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
    a.remove ( "M1/M2/N" ) ;
// System.out.println ( "7 -- a.remove ( 'M1/M2/N' )" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
    a.add ( "only/a/map" ) ;
  System.out.println ( gson.toJson ( a.map ) ) ;
  }
}
