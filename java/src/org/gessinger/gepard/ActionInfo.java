package org.gessinger.gepard ;

import java.util.* ;

public class ActionInfo
{
  List<Map<String,Object>> list = null ;
  Map<String,String> args = null ;
  public ActionInfo()
  {
  }
  public void add ( String cmd, String desc )
  {
    Map<String,Object> m = new HashMap<String,Object>() ;
    list.add ( m ) ;
    m.put ( "cmd", cmd ) ;
    m.put ( "desc", desc ) ;
  }
}
