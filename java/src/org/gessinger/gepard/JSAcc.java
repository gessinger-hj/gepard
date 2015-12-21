package org.gessinger.gepard ;

import java.util.* ;

public class JSAcc
{
  Map<String,Object> map = null ;
  public JSAcc()
  {
    this ( null )
  }
  public JSAcc ( Map<String,Object> m )
  {
    map = m ;
  }
  public static node ( String path )
  {
    String[] plist = path.split ( "/" ) ;
System.out.println ( Util.toString ( plist ) ) ;
  }
}
