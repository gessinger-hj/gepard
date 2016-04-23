package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

import com.google.gson.* ;

public class Event
{
  static Gson _gson = new Gson() ;
  static boolean _mapByteArrayToJavaScriptBuffer = true ;
  static void mapByteArrayToJavaScriptBuffer ( boolean state )
  {
    _mapByteArrayToJavaScriptBuffer = state ;
  }
  static public void setGson ( Gson gson )
  {
    if ( gson != null )
    {
      _gson = gson ;
    }
  }

  public String toJSON()
  throws IOException
  {
    if ( _mapByteArrayToJavaScriptBuffer )
    {
      Util.convertJavaTypedDataToNodeJS ( this ) ;
    }
    String json = _gson.toJson ( this ) ;
    return json ;
  }
  public static Event fromJSON ( String json )
  {
    Event e = (Event) _gson.fromJson ( json, Event.class ) ;
    if ( _mapByteArrayToJavaScriptBuffer )
    {
      Util.convertNodeJSTypedDataToJava ( e ) ;
    }
    return e ;
  }
  String className = "Event" ;
  String name = "" ;
  String type = "" ;
  User user = null ;
  boolean targetIsLocalHost = false ;
  transient Client _Client  = null ;
  transient JSAcc _JSAcc    = null ;
  transient JSAcc c_JSAcc   = null ;
  HashMap<String,Object> control = new HashMap<String,Object>() ;
  Map<String,Object> body = new HashMap<String,Object>() ;
  String channel = null ;
  private Event()
  {
  }
  public Event ( String name )
  {
    this ( name, null, null ) ;
  }
  public Event ( String name, String type )
  {
    this ( name, type, null ) ;
  }
  public Event ( String name, String type, HashMap<String,Object> body )
  {
    this.name = name ;
    this.type = type ;
    this.control.put ( "createdAt", new Date() ) ;
    this.control.put ( "plang", "Java" ) ;
    if ( body != null )
    {
      this.body = body ;
    }
  }
  JSAcc jsa()
  {
    if ( _JSAcc == null )
    {
      _JSAcc = new JSAcc ( body ) ;
    }
    return _JSAcc ;
  }
  JSAcc cjsa()
  {
    if ( c_JSAcc == null )
    {
      c_JSAcc = new JSAcc ( control ) ;
    }
    return c_JSAcc ;
  }
  public String toString()
  {
    String s = ""
    + "(" + this.className + ")["
    +  "name=" + this.name
    + ",type=" + this.type
    + "]\n"
    ;
    if ( user != null )
    {
      s += "user:\n" + user.toString() ;
    }
    if ( control != null )
    {
      s += "\ncontrol:\n" + Util.toString ( control ) ;
    }
    if ( body != null )
    {
      s += "\nbody:\n" + Util.toString ( body ) ;
    }
    return s ;
  }
  boolean targetIsLocalHost()
  {
    return targetIsLocalHost ;
  }
  void setTargetIsLocalHost ( boolean state )
  {
    targetIsLocalHost = state ;
  }
  public Date getCreatedAt()
  {
    return (Date) this.control.get ( "createdAt" ) ;
  }
  public void setIsResult()
  {
    this.control.put ( "_isResult", true ) ;
  }
  public boolean isResult()
  {
    return (this.control.get ( "_isResult" )+"").equals ( "true" ) ;
  }
  public void setResultRequested()
  {
    this.control.put ( "_isResultRequested", true ) ;
  }
  public boolean isResultRequested()
  {
    return (this.control.get ( "_isResultRequested" )+"").equals ( "true" ) ;
  }
  void setFailureInfoRequested()
  {
    this.control.put ( "_isFailureInfoRequested", true ) ;
  }
  public boolean isFailureInfoRequested()
  {
    return (this.control.get ( "_isFailureInfoRequested" )+"").equals ( "true" ) ;
  }
  void setStatusInfoRequested()
  {
    this.control.put ( "_isStatusInfoRequested", true ) ;
  }
  public boolean isStatusInfoRequested()
  {
    return (this.control.get ( "_isStatusInfoRequested" )+"").equals ( "true" ) ;
  }
  public boolean isStatusInfo()
  {
    return (this.control.get ( "_isStatusInfo" )+"").equals ( "true" ) ;
  }
  public void setIsBroadcast()
  {
    this.control.put ( "_isBroadcast", true ) ;
  }
  public boolean isBroadcast()
  {
    return (this.control.get ( "_isBroadcast" )+"").equals ( "true" ) ;
  }
  public String getSourceIdentifier()
  {
    return "" + this.control.get ( "sourceIdentifier" ) ;
  }
  public void setSourceIdentifier ( String sourceIdentifier )
  {
    this.control.put ( "sourceIdentifier", sourceIdentifier ) ;
  }
  public void setChannel ( String channel )
  {
    if ( control.containsKey ( "channel" ) ) return ;
    this.control.put ( "channel", channel ) ;
  }
  public String getChannel()
  {
    return (String)this.control.get ( "channel" ) ;
  }
  public String getProxyIdentifier()
  {
    return "" + this.control.get ( "proxyIdentifier" ) ;
  }
  public void setProxyIdentifier ( String proxyIdentifier )
  {
    this.control.put ( "proxyIdentifier", proxyIdentifier ) ;
  }
  public String getWebIdentifier()
  {
    return "" + this.control.get ( "webIdentifier" ) ;
  }
  public void setWebIdentifier ( String webIdentifier )
  {
    this.control.put ( "webIdentifier", webIdentifier ) ;
  }
  public String getName()
  {
    return this.name ;
  }
  public void setName ( String name )
  {
    this.name = name != null ? name : "" ;
  }
  public String getType()
  {
    return this.type ;
  }
  public void setType ( String type )
  {
    this.type = type != null ? type : "" ;
  }
  public Map<String,Object> getBody()
  {
    return this.body ;
  }
  public void setBody ( Map<String,Object> body )
  {
    if ( body != null ) this.body = body ;
    else this.body = new HashMap<String,Object>() ;
  }
  public User getUser()
  {
    return this.user ;
  }
  public void setUser ( User u )
  {
    if ( u == null ) return ;
    this.user = u ;
  }
  public HashMap<String,Object> getControl()
  {
    return this.control ;
  }
  public void setUniqueId ( String uid )
  {
    if ( ! this.control.containsKey ( "uniqueId" ) )
    {
      this.control.put ( "uniqueId", uid ) ;
    }
  }
  public String getUniqueId()
  {
    return "" + this.control.get ( "uniqueId" ) ;
  }
  public boolean isInUse()
  {
    if ( ! this.control.containsKey ( "isInUse" ) ) return false ;
    Boolean b = (Boolean)this.control.get ( "isInUse" ) ;
    return true ;
  }
  void setInUse()
  {
    this.control.put ( "isInUse", new Boolean ( true ) ) ;
  }
  public boolean isBad()
  {
    int code = getStatusCode() ;
    return code != 0 ;
  }
  public Map<String,Object> getStatus()
  {
    if ( this.control == null ) return null ;
    return (Map<String,Object>)this.control.get ( "status" ) ;
  }
  public String getStatusReason()
  {
    return (String) cjsa().value ( "status/reason", "" ) ;
  }
  public String getStatusName()
  {
    return (String) cjsa().value ( "status/name", "" ) ;
  }
  public int getStatusCode()
  {
    Number d = (Number)cjsa().value ( "status/code", 0 ) ;
    return d.intValue() ;
  }
  public void setStatus ( int code, String name, String reason )
  {
    cjsa().add ( "status/code", code ) ;
    if ( name != null ) cjsa().add ( "status/name", name ) ;
    if ( reason != null ) cjsa().add ( "status/reason", reason ) ;
  }
  public Object getValue ( String name )
  {
    return jsa().value ( name ) ;
  }
  public Object getBodyValue ( String name )
  {
    return getValue ( name ) ;
  }
  public void putValue ( String name, Object obj )
  {
    jsa().add ( name, obj ) ;
  }
  public Object removeValue ( String name )
  {
    return jsa().remove ( name ) ;
  }
  public void putBodyValue ( String name, Object obj )
  {
    putValue ( name, obj ) ;
  }
  public String getBodyString ( String name )
  {
    return (String) getValue ( name ) ;
  }
  public void sendBack()
  throws Exception
  {
    _Client.sendResult ( this ) ;
  }
  public Client getClient()
  {
    return _Client ;
  }
  public static void main ( String[] args)
  throws Exception
  {
    Event e = new Event ( "__FILE__" ) ;
    e.putValue ( "STRING", "TEXT" ) ;
    e.putValue ( "BINARY", new byte[] { 64, 65, 66, 67 } ) ;
    e.putValue ( "DATE", new Date() ) ;
    e.putValue ( "STRING/IN/PATH", "AAA" ) ;
    e.putValue ( "STRING/IN/PATH2", "BBB" ) ;
    e.setStatus ( 0, "success", "File accepted." ) ;
    e.setIsResult() ;
    System.out.println ( e.getStatus() ) ;
    System.out.println ( e.getStatusReason() ) ;
    System.out.println ( e.getStatusName() ) ;
    System.out.println ( e.getStatusCode() ) ;
    System.out.println ( e.isBad() ) ;
    System.out.println ( "e.isResult()=" + e.isResult() ) ;

    String str = e.toJSON() ;
    System.out.println ( "str=" + str ) ;
    Event ee = (Event)Event.fromJSON ( str ) ;
    System.out.println ( ee ) ;
    System.out.println ( ee.getStatus() ) ;
  }
}
