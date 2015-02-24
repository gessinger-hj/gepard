package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

import com.google.gson.* ;
import org.gessinger.vx.util.QCSys ;

final public class Util
{
  static HashMap<String,String> _globals = new HashMap<String,String>() ;
  private Util() {} ;
  static void deepCopy ( Map<String,Object> source, JsonObject target )
  {
    if ( source == null )
    {
      return ;
    }
    for ( String key : source.keySet() )
    {
      Object o = source.get ( key ) ;
      if ( o instanceof String ) target.addProperty ( key, (String) o ) ;
      else
      if ( o instanceof Number ) target.addProperty ( key, (Number) o ) ;
      else
      if ( o instanceof Boolean ) target.addProperty ( key, (Boolean) o ) ;
      else
      if ( o instanceof Character ) target.addProperty ( key, (Character) o ) ;
      else
      if ( o instanceof Map )
      {
        JsonObject jo = new JsonObject() ;
        target.add ( key, jo ) ;
        deepCopy ( (Map) o, jo ) ;
      }
    }
  }
  static void deepCopy ( Map<String,Object> source, Map<String,Object> target )
  {
    if ( source == null )
    {
      return ;
    }
    for ( String key : source.keySet() )
    {
      Object o = source.get ( key ) ;
      if ( o instanceof Map )
      {
        HashMap<String,Object> map = new HashMap<String,Object>() ;
        target.put ( key, map ) ;
        deepCopy ( (Map) o, map ) ;
        continue ;
      }
      target.put ( key, o ) ;
    }
  }
  static void copy ( Map<String,Object> source, Map<String,String> target )
  {
    if ( source == null )
    {
      return ;
    }
    for ( String key : source.keySet() )
    {
      Object o = source.get ( key ) ;
      if ( o instanceof String )
      {
        target.put ( key, (String)o ) ;
      }
    }
  }
  public static String toString ( Object o )
  {
    return QCSys.toString ( o ) ;
  }
  public static void argsToProperties ( String[] args )
  {
    argsToProperties ( args, null ) ;
  }
  public static void argsToProperties ( String[] args, String defaultValue )
  {
    if ( args == null ) return ;
    for  ( int i = 0 ; i < args.length ; i++ )
    {
      if ( args[i].startsWith ( "-D" ) )
      {
        if (  args[i].length() < 3
           || args[i].charAt ( 2 ) == '='
           )
        {
          System.err.println ( "Missing option name: " + args[i] ) ;
          return ;
        }
        int pos = args[i].indexOf ( '=' ) ;
        if ( pos < 0 )
        {
          if ( defaultValue == null ) 
            setProperty ( args[i].substring ( 2 ), args[i].substring ( 2 ) ) ;
          else
            setProperty ( args[i].substring ( 2 ), defaultValue ) ;
        }
        else
        {
          setProperty ( args[i].substring ( 2, pos )
                      , args[i].substring ( pos + 1 )
                      ) ;
        }
      }
    }
  }
  public static void putProperty ( String name, String o )
  {
    setProperty ( name, o ) ;
  }
  public static void setProperty ( String name, String o )
  {
    if ( o == null )
    {
      _globals.remove ( name ) ;
      return ;
    }
    _globals.put ( name, o ) ;
  }
  public static void removeProperty ( String name )
  {
     _globals.remove ( name ) ;
  }
  public static void remove ( String name )
  {
     _globals.remove ( name ) ;
  }

  synchronized public static String getProperty ( String name, String def )
  {
    String rc = getProperty ( name ) ;
    if ( rc == null ) return def ;
    return rc ;
  }
  synchronized public static String getProperty ( String name )
  {
    if ( name == null || name.length() == 0 ) return null ;
    String v = (String) _globals.get ( name ) ;
    if ( v != null ) return v ;
    v = System.getProperty ( name ) ;
    if ( v != null ) return v ;
    v = System.getenv ( name ) ;
    if ( v == null && name.indexOf ( '.' ) > 0 )
    {
      name = name.replace ( '.', '_' ) ;
      v = System.getenv ( name ) ;
      if ( v == null )
      {
        name = name.toUpperCase() ;
        v = System.getenv ( name ) ;
      }
    }
    return v ;
  }
}

