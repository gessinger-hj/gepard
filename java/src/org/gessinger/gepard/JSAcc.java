package org.gessinger.gepard ;

import java.util.* ;

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
      Object o = map.get ( path ) ;
      return o == null ? def : o ;
    }

    String[] plist = path.split ( "/" ) ;
    Map mm = m ;
    for ( int i = 0 ; i < plist.length ; i++ )
    {
      String p = plist[i] ;
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
        m.put ( p, obj ) ;
      }
    }
    return obj ;
  }
  public Object remove ( Map m, String path )
  {
    
  }
  public static void main(String[] args)
  throws Exception
  {
    JSAcc a = new JSAcc () ;

    a.add ( "M1/M2/N", 11 ) ;
System.out.println ( Util.toString ( a.value ( "M1/M2" ) ) ) ;
    a.add ( "A/B/C", new String[] { "D", "E" } ) ;
    a.add ( "A/B/D", "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" ) ;
    a.add ( "A/X", "-----------------" ) ;
    a.add ( "X", "-----------------" ) ;
System.out.println ( a ) ;
System.out.println ( Util.toString ( a.value ( "A/B" ) ) ) ;
  }
}
