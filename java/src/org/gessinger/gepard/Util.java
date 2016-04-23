package org.gessinger.gepard ;

import java.util.* ;
import java.util.Date ;
import java.io.* ;
import java.text.* ;
import java.sql.* ;

import com.google.gson.* ;

final public class Util
{
  private static PrintWriter _stdout = new PrintWriter ( System.out, true ) ;
  private static PrintWriter _out = _stdout ;

  static SimpleDateFormat _DateFormatYYYYMMDDhhmmss
                    = new SimpleDateFormat ( "yyyyMMddHHmmss", Locale.US ) ;
  static SimpleDateFormat _DateFormatYYYYMMDD
                    = new SimpleDateFormat ( "yyyyMMdd", Locale.US ) ;
  static SimpleDateFormat _SoapDateFormat
                    = new SimpleDateFormat ( "yyyy-MM-dd", Locale.US ) ;
  static SimpleDateFormat _SoapDateTimeFormat
                    = new SimpleDateFormat ( "yyyy-MM-dd'T'HH:mm:ss", Locale.US ) ;
  static SimpleDateFormat _SoapDateTimeFormat2
                    = new SimpleDateFormat ( "yyyy-MM-dd HH:mm:ss", Locale.US ) ;

  static HashMap<String,String> _globals = new HashMap<String,String>() ;
  static Gson _gson = new Gson() ;

  private Util() {} ;
  static public String getMainClassName()
  {
    String className = "" ;
    Map<Thread,StackTraceElement[]> stackTraceMap = Thread.getAllStackTraces() ;
    for ( Thread t : stackTraceMap.keySet() )
    {
      if ("main".equals(t.getName()))
      {
        StackTraceElement[] mainStackTrace = stackTraceMap.get(t);
        for (StackTraceElement element : mainStackTrace)
        {
          className = element.getClassName() ;
        }
      }
    }
    return className ;
  }
  static public String toJSON ( Object o )
  throws IOException
  {
    if ( o instanceof Map )
    {
      convertJavaTypedDataToNodeJS ( false, (Map)o ) ;
    }
    String json = _gson.toJson ( o ) ;
    return json ;
  }
  static public Object fromJSON ( String json, Class clazz )
  {
    Object o = _gson.fromJson ( json, clazz ) ;
    if ( o instanceof Map )
    {
      convertNodeJSTypedDataToJava ( (Map)o ) ;
    }
    return o ;
  }
  static void convertJavaTypedDataToNodeJS ( Event e )
  throws IOException
  {
    if ( e.body == null ) return ;
    convertJavaTypedDataToNodeJS ( e.targetIsLocalHost(), e.control ) ;
    convertJavaTypedDataToNodeJS ( e.targetIsLocalHost(), e.body ) ;
  }
  static void convertJavaTypedDataToNodeJS ( boolean targetIsLocalHost, Map<String,Object> source )
  throws IOException
  {
    for ( String key : source.keySet() )
    {
      Object o = source.get ( key ) ;
      if ( o instanceof byte[] )
      {
        Map<String,Object> map = new HashMap<String,Object>() ;
        map.put ( "type", "Buffer" ) ;
        map.put ( "data", o ) ;
        source.put ( key, map ) ;
      }
      else
      if ( o instanceof Date )
      {
        Date date = (Date) o ;
        Map<String,Object> map = new HashMap<String,Object>() ;
        map.put ( "type", "Date" ) ;
        String s = getISODateTime ( date ) ;
        map.put ( "value", s ) ;
        source.put ( key, map ) ;
      }
      else
      if ( o instanceof JSONEncodable )
      {
        if ( o instanceof HasSetTargetIsLocalHost )
        {
          ((HasSetTargetIsLocalHost)o).setTargetIsLocalHost ( targetIsLocalHost ) ;
        }
        source.put ( key, ((JSONEncodable)o).toJSON() ) ;
      }
      else
      if ( o instanceof Map )
      {
        convertJavaTypedDataToNodeJS ( targetIsLocalHost, (Map<String,Object>) o ) ;
      }
    }
  }
  static void convertNodeJSTypedDataToJava ( Event e )
  {
    if ( e.body == null ) return ;
    convertNodeJSTypedDataToJava ( e.control ) ;
    convertNodeJSTypedDataToJava ( e.body ) ;
  }
  static void convertNodeJSTypedDataToJava ( Map<String,Object> source )
  {
    for ( String key : source.keySet() )
    {
      Object o = source.get ( key ) ;
      if ( o instanceof Map )
      {
        Map<String,Object> map = (Map<String,Object>) o ;
        Object otype = map.get ( "type" ) ;
        Object odata = map.get ( "data" ) ;
        Object ovalue = map.get ( "value" ) ;
        if ( odata == null )
        {
          odata  = ovalue ;
        }
        if ( map.size() == 2 && otype != null && odata != null ) // JavaScript, Gson: "value"
        {
          if ( "Buffer".equals ( otype ) && ( odata instanceof List ) )
          {
            List l = (List) odata ;
            byte[] b = new byte[l.size()] ;
            source.put ( key, b ) ;
            int n = 0 ;
            for ( Object oo : l )
            {
              if ( oo instanceof Integer )
              {
                Integer i = (Integer) oo ;
                b[n++] = i.byteValue() ;
              }  
              if ( oo instanceof Double )
              {
                Double d = (Double) oo ;
                b[n++] = d.byteValue() ;
              }  
            }
            continue ;
          }
          if ( "Date".equals ( otype ) && ( odata instanceof String ) )
          {
            String sdate = (String) odata ;
            try
            {
              Date date = _parseDate ( sdate, true ) ;
              source.put ( key, date ) ;
            }
            catch ( Exception exc )
            {
              System.err.println ( toString ( exc ) ) ;
            }
            continue ;
          }
        }
        convertNodeJSTypedDataToJava ( map ) ;
        Object ooo =  map.get ( "className" ) ;
        if ( ooo != null && ( ooo instanceof String ) )
        {
          String className = (String) ooo ;
          Class clazz = null ;
          try
          {
            clazz = Class.forName ( className ) ;
          }
          catch ( ClassNotFoundException exc )
          {
          }
          if ( clazz == null )
          {
            try
            {
              clazz = Class.forName ( _classNameToFullClassName.get ( className ) ) ;
              Object instance = clazz.newInstance() ;
              ((JSONDecodable)instance).fromJSON ( map ) ;
              source.put ( key, instance ) ;
            }
            catch ( Exception exc )
            {
              System.err.println ( Util.toString ( exc ) ) ;
            }
          }
        }
      }
    }
  }
  static Map<String,String> _classNameToFullClassName = new HashMap<String,String>() ;
  static
  {
    _classNameToFullClassName.put ( "FileContainer", "org.gessinger.gepard.FileContainer" ) ;
    // _classNameToFullClassName.put ( "User", "org.gessinger.gepard.User" ) ;
  }
  static void addClassNameToFullClassName ( String className, String fullClassName )
  {
    _classNameToFullClassName.put ( className, fullClassName ) ;
  }

  static Hashtable<String,SimpleDateFormat> _DateFormats = new Hashtable<String,SimpleDateFormat>() ;
  static Date _parseDate ( String ymdOrSoap, boolean withTZ )
  throws Exception
  {
    if ( ymdOrSoap.endsWith ( "Z" ) )
    {
      ymdOrSoap = ymdOrSoap.substring ( 0, ymdOrSoap.length() - 2 ) + "+00:00" ;
    }
    String adjustedString = ymdOrSoap ;
    String format = null ;
    String formatWithTZ = null ;
    if (  ymdOrSoap.length() == 16 ) // yyyy-MM-dd+01:00     yyyy-MM-dd-01:00
    {
      if (  ymdOrSoap.charAt ( ymdOrSoap.length() - 6 ) == '+'
         || ymdOrSoap.charAt ( ymdOrSoap.length() - 6 ) == '-'
         )
      {
        format = "yyyy-MM-dd" ;
        formatWithTZ = "yyyy-MM-ddZ" ;
        adjustedString = ymdOrSoap.substring ( 0, ymdOrSoap.length() - 3 )
                       + ymdOrSoap.substring ( ymdOrSoap.length() - 2 )
                       ;
        ymdOrSoap = ymdOrSoap.substring ( 0, ymdOrSoap.length() - 6 ) ;
      }
    }
    if ( ymdOrSoap.indexOf ( ' ' ) > 0 )
    {
      ymdOrSoap = ymdOrSoap.replace ( ' ', 'T' ) ;
      adjustedString = adjustedString.replace ( ' ', 'T' ) ;
    }
    if (  ymdOrSoap.length() > 10 )
    {
      if (  ymdOrSoap.charAt ( ymdOrSoap.length() - 6 ) == '+'
         || ymdOrSoap.charAt ( ymdOrSoap.length() - 6 ) == '-'
         )
      {
        format = "yyyy-MM-dd'T'HH:mm:ss" ;
        formatWithTZ = "yyyy-MM-dd'T'HH:mm:ssZ" ;
        if ( ymdOrSoap.indexOf ( '.' ) > 0 )
        {
          int posP = ymdOrSoap.indexOf ( '.' ) ;
          int diff = ymdOrSoap.length() - 7 - posP ;
          if ( diff == 1 ) formatWithTZ = "yyyy-MM-dd'T'HH:mm:ss.SZ" ;
          else
          if ( diff == 2 ) formatWithTZ = "yyyy-MM-dd'T'HH:mm:ss.SSZ" ;
          else
          if ( diff == 3 ) formatWithTZ = "yyyy-MM-dd'T'HH:mm:ss.SSSZ" ;
        }
        else
        {
          formatWithTZ = "yyyy-MM-dd'T'HH:mm:ssZ" ;
        }
        adjustedString = ymdOrSoap.substring ( 0, ymdOrSoap.length() - 3 )
                       + ymdOrSoap.substring ( ymdOrSoap.length() - 2 )
                       ;
        ymdOrSoap = ymdOrSoap.substring ( 0, ymdOrSoap.length() - 6 ) ;
      }
    }
    if ( withTZ && formatWithTZ != null )
    {
      SimpleDateFormat sdf = _DateFormats.get ( formatWithTZ ) ;
      if ( sdf == null )
      {
        sdf = new SimpleDateFormat ( formatWithTZ, Locale.US ) ;
        _DateFormats.put ( formatWithTZ, sdf ) ;
      }
      ParsePosition pos = new ParsePosition(0);
      return sdf.parse ( adjustedString, pos ) ;
    }
    else
    {
      ParsePosition pos = new ParsePosition(0);
      if ( ymdOrSoap.length() == 8 ) // YYYYMMDD
        return _DateFormatYYYYMMDD.parse ( ymdOrSoap, pos ) ;
      if ( ymdOrSoap.length() == 10 ) // yyyy-MM-dd
        return _SoapDateFormat.parse ( ymdOrSoap, pos ) ;
      if ( ymdOrSoap.length() == 14 ) // YYYYMMDDhhmmss
        return _DateFormatYYYYMMDDhhmmss.parse ( ymdOrSoap, pos ) ;

      if ( ymdOrSoap.indexOf ( '.' ) > 0 )
        ymdOrSoap = ymdOrSoap.substring ( 0, ymdOrSoap.indexOf ( '.' )  ) ;

      if ( ymdOrSoap.length() == 19 ) // yyyy-MM-dd'T'HH:mm:ss
      {
        if ( ymdOrSoap.indexOf ( 'T' ) > 0 )
          return _SoapDateTimeFormat.parse ( ymdOrSoap, pos ) ;
        else
          return _SoapDateTimeFormat2.parse ( ymdOrSoap, pos ) ;
      }
    }
    String s = "Invalid date format: " + ymdOrSoap ;
    throw new Exception ( s);
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
      if ( args[i].startsWith ( "-D" ) || args[i].startsWith ( "--" ) )
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

  public static String getProperty ( String name, String def )
  {
    String rc = getProperty ( name ) ;
    if ( rc == null ) return def ;
    return rc ;
  }
  public static String getProperty ( String name )
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
  public static int getInt ( String name, int def )
  {
    String rc = getProperty ( name ) ;
    if ( rc == null ) return def ;
    try
    {
      return Integer.parseInt ( rc ) ;
    }
    catch ( Exception exc )
    {
    }
    return def ;
  }
  public static boolean getBool ( String name, boolean def )
  {
    String rc = getProperty ( name ) ;
    if ( rc == null ) return def ;
    if ( rc.equals ( "true" ) ) return true ;
    if ( rc.equals ( "false" ) ) return false ;
    if ( rc.equals ( "1" ) ) return true ;
    if ( rc.equals ( "0" ) ) return false ;
    if ( rc.equals ( "yes" ) ) return true ;
    if ( rc.equals ( "no" ) ) return false ;
    if ( rc.equals ( "y" ) ) return true ;
    if ( rc.equals ( "n" ) ) return false ;
    return def ;
  }
  public static String toString ( Object o )
  {
    return toString ( o, true ) ;
  }
  public static String toString ( Object o, boolean full )
  {
    StringPrintWriter sb = new StringPrintWriter() ;
    _out = sb ;
    if ( o instanceof SQLException )
    {
      ((Exception)o).printStackTrace( sb ) ;
      o = sb.toString() ;
    }
    else
    if ( o instanceof RuntimeException )
    {
      ((Exception)o).printStackTrace( sb ) ;
      o = sb.toString() ;
    }
    else
    if ( o instanceof Error )
    {
      ((Error)o).printStackTrace( sb ) ;
      o = sb.toString() ;
    }
    else
    if ( o instanceof Exception )
    {
      StringPrintWriter sb2 = new StringPrintWriter() ;
      Throwable t1 = (Exception) o ;
      boolean first = true ;
      while ( t1 != null )
      {
        if ( first ) first = false ;
        else sb2.write ( "\n" ) ;
        if ( t1 instanceof SQLException )
        {
          t1.printStackTrace( sb2 ) ;
        }
        else
        if ( t1 instanceof RuntimeException )
        {
          t1.printStackTrace( sb2 ) ;
        }
        else
        if ( t1 instanceof Error )
        {
          t1.printStackTrace( sb2 ) ;
        }
        else
        {
          sb2.write ( t1.toString() ) ;
        }
        t1 = t1.getCause() ;
      }
      sb.write ( sb2.toString() ) ;
    }
    else print ( 0, o, full ) ;
    _out = _stdout ;
    return sb.toString() ;
  }
  public static void println ( String obj )
  {
    print ( 0, obj, false ) ;
    _out.println("") ;
  }
  public static void println ( Object obj )
  {
    if ( obj instanceof RuntimeException )
    {
      ((Exception)obj).printStackTrace( _out ) ;
    }
    else
    {
      print ( 0, obj, true ) ;
      _out.println("") ;
    }
  }
  public static void print ( Throwable t )
  {
    if ( t == null ) print ( t ) ;
    else
    {
      StringPrintWriter ob = new StringPrintWriter() ;
      t.printStackTrace( ob ) ;
      print ( ob.toString() ) ;
    }
  }
  public static void pp ( int indent, Object obj )
  {
    print ( indent, obj, false ) ;
  }
  public static void pp ( Object obj )
  {
    print ( 0, obj, false ) ;
  }
  public static void pp ( Throwable t )
  {
    if ( t == null ) print ( t ) ;
    else
    {
      StringPrintWriter ob = new StringPrintWriter() ;
      t.printStackTrace( ob ) ;
      print ( 0, ob.toString(), false ) ;
    }
  }
  public static void println ( long k ) { _out.println(k) ; }
  public static void println ( int k ) { _out.println(k) ; }
  public static void println ( double k ) { _out.println(k) ; }
  public static void println ( boolean k ) { _out.println(k) ; }

  public static void println ( String t, boolean k )
  {
    _out.print ( t ) ; _out.println ( k ) ;
  }
  public static void println ( String t, double k )
  {
    _out.print ( t ) ; _out.println ( k ) ;
  }
  public static void println ( String t, long k )
  {
    _out.print ( t ) ; _out.println ( k ) ;
  }
  public static void println ( String t, int k )
  {
    _out.print ( t ) ; _out.println ( k ) ;
  }
  public static void println ( String t, String k )
  {
    _out.print ( t ) ; _out.println ( k ) ;
  }
  public static void println ( String t, Object k )
  {
    _out.print ( t ) ; println ( k ) ;
  }

  public static void println ( int indent, boolean k, boolean full )
  {
    print ( indent, k, full ) ; _out.println("") ;
  }
  public static void println ( int indent, double k, boolean full )
  {
    print ( indent, k, full ) ; _out.println("") ;
  }
  public static void println ( int indent, long k, boolean full )
  {
    print ( indent, k, full ) ; _out.println("") ;
  }
  public static void println ( int indent, int k, boolean full )
  {
    print ( indent, k, full ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, boolean b, boolean full )
  {
    print ( indent, t, false ) ;
    if ( full ) _out.print ( "(boolean) " + b ) ;
    else        _out.print ( b ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, boolean full )
  {
    print ( indent, t, full ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, double i )
  {
    print ( indent, t, false ) ;
    _out.print ( i ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, long i )
  {
    print ( indent, t, false ) ;
    _out.print ( i ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, int i )
  {
    print ( indent, t, false ) ;
    _out.print ( i ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, int i, boolean full )
  {
    print ( indent, t, false ) ;
    if ( full ) _out.print ( "(int) " + i ) ;
    else        _out.print ( i ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, Object obj, boolean full )
  {
    print ( indent, t, false ) ;
    print ( 0, obj, full ) ;
    _out.println("") ;
  }
  public static void println ( int indent, String t, Object obj )
  {
    print ( indent, t, false ) ;
    print ( 0, obj, true ) ;
    _out.println("") ;
  }
  public static void println ( int indent, Object obj, boolean full )
  {
    print ( indent, obj, full ) ;
    _out.println("") ;
  }

  public static void print ( int i ) { print ( 0, i, false ) ; }
  public static void print ( long i ) { print ( 0, i, false ) ; }
  public static void print ( double i ) { print ( 0, i, false ) ; }
  public static void print ( boolean i ) { print ( 0, i, false ) ; }

  public static void print ( String obj )
  {
    print ( 0, obj, false ) ;
  }
  public static void print ( Object obj )
  {
    print ( 0, obj, true ) ;
  }
  public static void print ( int indent, String s )
  {
    print ( indent, s, false ) ;
  }
  public static void print ( int indent, Object obj )
  {
    print ( indent, obj, true ) ;
  }
  public static void print ( int indent, int k, boolean full )
  {
    if ( full ) _out.print ( "(int) " + k ) ;
    else _out.print ( k ) ;
  }
  public static void print ( int indent, boolean k, boolean full )
  {
    if ( full ) _out.print ( "(boolean) " + k ) ;
    else _out.print ( k ) ;
  }
  public static void print ( int indent, double k, boolean full )
  {
    if ( full ) _out.print ( "(double) " + k ) ;
    else _out.print ( k ) ;
  }
  public static void print ( int indent, long k, boolean full )
  {
    if ( full ) _out.print ( "(long) " + k ) ;
    else _out.print ( k ) ;
  }
  public static void print ( int indent, String t, Object obj, boolean full )
  {
    print ( indent, t, false ) ;
    print ( 0, obj, full ) ;
  }
  public static void print ( int indent, String t, boolean b, boolean full )
  {
    print ( indent, t, false ) ;
    _out.print ( b ) ;
  }
  public static void print ( int indent, String t, int i, boolean full )
  {
    print ( indent, t, false ) ;
    if ( full ) _out.print ( "(int) " + i ) ;
    else        _out.print ( i ) ;
  }
  public static void print ( int indent, Object obj, boolean full )
  {
    int     i, j ;
    String  name ;
    Vector  v ;
    Hashtable h ;

    if ( obj == null ) {
      _out.print ( "(null)" ) ;
      return ;
    }

    Class clazz = obj.getClass() ;

    if ( clazz.isArray() )
    {
      Class componentType = clazz.getComponentType() ;
      name = "" + componentType + "[]" ;
    }
    else name = obj.getClass().getName() ;

    for ( i = 0 ; i < indent ; i++ )
    {
      _out.print ( " " ) ;
    }

    if ( full )
    {
      if ( name.startsWith ( "java" ) || name.startsWith ( "class java" ) )
      {
        i = name.lastIndexOf ( '.' ) ;
        if ( i >= 0 )
        {
          String shortName = name.substring ( i + 1 ) ;
          _out.print ( "(" + shortName + ")" ) ;
        }
        else _out.print ( "(" + name + ")" ) ;
      }
      else _out.print ( "(" + name + ")" ) ;

      if ( obj instanceof String ) ;
      else
      if ( obj instanceof Date ) ;
      else
      if ( obj instanceof Double ) ;
      else
      if ( obj instanceof Long ) ;
      else
      if ( obj instanceof Integer ) ;
      else
      if ( obj instanceof Boolean ) ;
      else
      if ( obj instanceof Byte ) ;
      else
      if ( obj instanceof Character ) ;
      else
      {
        _out.println ( "" ) ;
      }
    }
 
    if ( clazz.isArray() )
    {
      indent += 2 ;
      Class componentType = clazz.getComponentType() ;
      name = "" + componentType ;
      if ( componentType.isPrimitive() )
      {
        if ( name.equals ( "boolean" ) )
        {
          boolean A[] = (boolean[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "char" ) )
        {
          char A[] = (char[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "short" ) )
        {
          short A[] = (short[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "int" ) )
        {
          int A[] = (int[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "long" ) )
        {
          long A[] = (long[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "float" ) )
        {
          float A[] = (float[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "double" ) )
        {
          double A[] = (double[]) obj ;
          for ( i = 0 ; i < A.length ; i++ )
          {
            println ( indent, "" + i + ": '" + A[i] + "'", false ) ;
          }
        }
        else
        if ( name.equals ( "byte" ) )
        {
          boolean first = true ;
          boolean toPrint = true ;

          int hex_0 = 0 ;
          int asc_0 = 38 ;
          int asc_1 = 55 ;
          int hex = hex_0 ;
          int asc = asc_0 + 1 ;

          byte ba[] = (byte[])obj ;
          StringBuffer sb_out = new StringBuffer ( 72 ) ;
          sb_out.setLength ( 72 ) ;

          for ( int k = 0 ; k < 72 ; k++ ) sb_out.setCharAt ( k, ' ' ) ;
          sb_out.setCharAt ( asc_0, '*' ) ;
          sb_out.setCharAt ( asc_1, '*' ) ;

          println ( 0, "    size: " + ba.length, false ) ;

          println ( 0,
    "Offset   --------------- HEX ---------------  ----- ASCII ------", false ) ;

          for ( i = 0 ; i < ba.length ; )
          {
            if ( ( i % 16 ) == 0 )
            {
              if ( first )
              {
                first = false ;
              }
              else
              {
                StringBuffer tmp = new StringBuffer ( "00000000" ) ;
                int ii = i - 16 ;
                if ( ii < 0 ) ii = 0 ;
                tmp.append ( ii ) ;
                tmp.reverse() ;
                tmp.setLength ( 8 ) ;
                tmp.reverse() ;
                print ( 0, tmp.toString(), false ) ;

                String s = new String ( sb_out ) ;
                print ( 0, s, false ) ;
                for ( int k = 0 ; k < 72 ; k++ ) sb_out.setCharAt ( k, ' ' ) ;
                sb_out.setCharAt ( asc_0, '*' ) ;
                sb_out.setCharAt ( asc_1, '*' ) ;
                toPrint = false ;
              }
              hex = hex_0 ;
              asc = asc_0 + 1 ;
            }
            sb_out.setCharAt ( hex, ' ' ) ;
            hex++ ;
            for ( j = i ; j < ba.length && j < i + 4 ; j++ )
            {
              char c = (char)ba[j] ;
              if ( c >= ' ' && c <= 'z' ) sb_out.setCharAt ( asc, c ) ;
              else                        sb_out.setCharAt ( asc, '.' ) ;
              asc++ ;
              int b47 = ( c & 0xF0 ) >> 4 ;
              if ( b47 <= 9 ) b47 += '0' ;
              else            b47 = b47 - 10 + 'A' ;

              int b03 = c & 0x0F ;
              if ( b03 <= 9 ) b03 += '0' ;
              else b03 = b03 - 10 + 'A' ;

              sb_out.setCharAt ( hex, (char)b47 ) ;
              hex++ ;
              sb_out.setCharAt ( hex, (char)b03 ) ;
              hex++ ;
              toPrint = true ;
            }
            i += 4 ;
          }
          if ( toPrint && ba.length > 0 )
          {
            StringBuffer tmp = new StringBuffer ( "00000000" ) ;
            int ii = ( i / 16 ) * 16 ;
            tmp.append ( ii ) ;
            tmp.reverse() ;
            tmp.setLength ( 8 ) ;
            tmp.reverse() ;
            print ( 0, tmp.toString(), false ) ;

            String s = new String ( sb_out ) ;
            println ( 0, s, false ) ;
          }
        }
      }
      else
      if ( obj instanceof Object[] )
      {
        Object[] oo = (Object[])obj ;
        j = indent ;
        for ( i = 0 ; i < oo.length ; i++ )
        {
          print ( j, "" + i + ": ", false ) ;
          if ( oo[i] == null ) println ( 0, "(null)", false ) ;
          else                 println ( 0, oo[i], full ) ;
        }
      }
    }
    else
    if ( obj instanceof Map )
    {
      Map m = (Map)obj ;
      j = indent + 2 ;
      Set keySet = m.keySet() ;
      for ( Object k : keySet )
      {
        for ( i = 0 ; i < j ; i++ ) {
          _out.print ( " " ) ;
        }
        _out.print ( k + "=" ) ;
        println ( j, m.get(k), full ) ;
      }
    }
    else
    if ( obj instanceof java.util.List )
    {
      List l = (List)obj ;
      j = indent + 2 ;
      for ( Object o : l ) {
        println ( j, o, full ) ;
      }
    }
    else
    if ( obj instanceof String )
    {
      if ( full ) _out.print ( "'" + (String)obj + "'" ) ;
      else        _out.print ( (String)obj ) ;
    }
    else
    if ( obj instanceof StringBuffer )
    {
      if ( full ) _out.print ( "'" + obj + "'" ) ;
      else        _out.print ( obj ) ;
    }
    else
    if ( obj instanceof StringBuilder )
    {
      if ( full ) _out.print ( "'" + obj + "'" ) ;
      else        _out.print ( obj ) ;
    }
    else
    {
      if ( full ) _out.print ( "'" + obj + "'" ) ;
      else        _out.print ( obj.toString() ) ;
    }
  }
  public static SimpleDateFormat _ISODateFormat
                    = new SimpleDateFormat ( "yyyy-MM-dd", Locale.US ) ;
  public static SimpleDateFormat _ISODateTimeFormat = null ;
  static
  {
    _ISODateTimeFormat = new SimpleDateFormat ( "yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US ) ;
    _ISODateTimeFormat.setTimeZone ( TimeZone.getTimeZone ( "UTC" ) ) ;
  }
  static public String getISODateTime()
  {
    return getISODateTime ( new Date() ) ;
  }
  static public String getISODateTime ( Date date )
  {
    return _ISODateTimeFormat.format ( date ) ;
  }
  static public String getISODate()
  {
    return getISODate ( new Date() ) ;
  }
  static public String getISODate ( Date date )
  {
    return _ISODateFormat.format ( date ) ;
  }
  public static LI LineInfo = null ;
  static
  {
    Util o = new Util() ;
    LineInfo = o.getLI() ;
  }
  private LI getLI()
  {
    return new LI() ;
  }
  public class LI
  {
    String _lastInvisibleClassName = null ;
    public void setLastInvisibleClassName ( String lastInvisibleClassName )
    {
      _lastInvisibleClassName = lastInvisibleClassName ;
    }
    public String toString()
    {
      Exception exc = new Exception() ;
      StackTraceElement[] ste = exc.getStackTrace() ;
      String cn = "" ;
      int n = 0 ;
      for ( ; n < ste.length ; n++ )
      {
        cn = ste[n].getClassName() ;
        if ( cn.indexOf ( "Util" ) >= 0 ) continue ;
        if ( cn.indexOf ( "java" ) < 0 ) break ;
      }
      if ( n >= ste.length ) return "" ;
      if ( _lastInvisibleClassName != null )
      {
        for ( ; n < ste.length ; n++ )
        {
          cn = ste[n].getClassName() ;
          if ( cn.indexOf ( _lastInvisibleClassName ) >= 0 ) { n++ ; break ; }
        }
      }
      if ( n >= ste.length ) return "" ;
      String fn = ste[n].getFileName() ;
      String mn = ste[n].getMethodName() ;
      int ln = ste[n].getLineNumber() ;
      return cn + "." + mn + "(" + fn + ":" + ln + ")" ;
    }
  }
  static public void copy ( InputStream in, OutputStream out )
  throws IOException
  {
    byte buffer[] = new byte[2*4096];
    while ( true )
    {
      int r = in.read( buffer );
      if ( r < 0 ) break ;
      out.write( buffer, 0, r );
    }
  }
  static public byte[] getBytes ( File file )
  throws IOException
  {
    InputStream in = null ;
    ByteArrayOutputStream out = null ;
    try
    {
      in = new FileInputStream ( file ) ;
      out = new ByteArrayOutputStream() ;
      Util.copy ( in, out ) ;
      out.close() ;
      return out.toByteArray() ;
    }
    catch ( IOException exc )
    {
      System.err.println ( Util.toString ( exc ) ) ;
      throw exc ;
    }
    finally
    {
      if ( in != null ) try { in.close() ; } catch ( Exception e ) {}
      if ( out != null ) try { out.close() ; } catch ( Exception e ) {}
    }
  }
  // System.out.println ( "int.class.isPrimitive()=" + int.class.isPrimitive() ) ;
  private static final Set<Class> PRIMITIVE_TYPES = new HashSet ( Arrays.asList (
    Boolean.class
  , Character.class
  , Byte.class
  , Short.class
  , Integer.class
  , Long.class
  , Float.class
  , Double.class
  , Void.class
  ));
  public static boolean isScalar ( Class clazz )
  {
    return PRIMITIVE_TYPES.contains ( clazz ) ;
  }
}
