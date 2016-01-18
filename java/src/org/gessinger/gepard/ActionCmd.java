package org.gessinger.gepard ;

import java.util.* ;

public class ActionCmd
{
  Map<String,Object> parameter ;
  String cmd ;
  Map<String,String> args ;
  String result = "" ;

  public ActionCmd ( Map<String,Object> parameter )
  {
    this.parameter = parameter ;
    this.cmd       = (String) parameter.get ( "cmd" ) ;
    this.args      = (Map<String,String>) parameter.get ( "args" ) ;
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
