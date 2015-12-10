package org.gessinger.gepard ;

import java.util.* ;

public class ActionCmd
{
  String cmd ;
  Map<String,String> args = new HashMap<String,String>() ;
  String result = "" ;

  public ActionCmd ( String cmd )
  {
    this.cmd = cmd ;
  }
  public String getCmd (  )
  {
    return cmd ;    
  }
  public void setResult ( String str )
  {
    result = str ;
  }
  public Map<String,String> getArgs()
  {
    return args ;
  }
}
