package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

import com.google.gson.* ;

public class Event
{
  public static Event fromJSON ( String json )
  {
    Gson gson = new Gson() ;
    HashMap map = gson.fromJson ( json, HashMap.class ) ;
    Event e = new Event ( map ) ;
    return e ;
  }
  String className = "Event" ;
  String name = "" ;
  String type = "" ;
  User user = null ;
  
  HashMap<String,Object> control = new HashMap<String,Object>() ;
  HashMap<String,Object> body = new HashMap<String,Object>() ;
  Event ( HashMap map )
  {
    setName ( (String) map.get ( "name" ) ) ;
    setType ( (String) map.get ( "type" ) ) ;
    Map<String,Object> mcontrol = (Map<String,Object>) map.get ( "control" ) ;
    Map<String,Object> mbody = (Map<String,Object>) map.get ( "body" ) ;
    Util.copy ( mcontrol, control ) ;
    Util.copy ( mbody, body ) ;
    Map<String,Object> muser = (Map<String,Object>) map.get ( "user" ) ;
    if ( muser != null )
    {
      user = new User ( muser ) ;
    }
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
    this.control.put ( "createdAt", "" + new Date() ) ;
    if ( body != null )
    {
      this.body = body ;
    }
  }
  public String toString()
  {
    return "(" + this.className + ")["
    +  "name=" + this.name
    + ",type=" + this.type
    + "]\n"
    // + ( this.user ? "[user=" + this.user + "]" : "" )
    // + "[control=" + this.toFullString ( this.control ) + "]\n"
    // + "[body=" + this.toFullString ( this.body ) + "]"
    + "user:\n"
    + Util.toString ( user )
    + "\ncontrol:\n"
    + Util.toString ( control )
    + "\nbody:\n"
    + Util.toString ( body )
    ;
  }
  public String toJSON()
  {
    Gson gson = new Gson() ;
    String json = gson.toJson ( this ) ;
    return json ;
  }
  public String getCreatedAt()
  {
    return this.control.get ( "createdAt" ).toString() ;
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
  public HashMap<String,Object> getBody()
  {
    return this.body ;
  }
  public void setBody ( HashMap<String,Object> body )
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
  public boolean isBad()
  {
    if ( this.control == null ) return false ;
    if ( ! this.control.containsKey ( "status" ) ) return false ;
    HashMap<String,Object> status = (HashMap<String,Object>)this.control.get ( "status" ) ;
    if ( status == null ) return false ;
    if ( ! status.containsKey ( "code" ) ) return false ;
    return ! (status.get ( "code" )+"").equals ( "0" ) ;
  }
  public HashMap<String,Object> getStatus()
  {
    if ( this.control == null ) return null ;
    return (HashMap<String,Object>)this.control.get ( "status" ) ;
  }
  public String getStatusReason()
  {
    if ( this.control == null ) return "" ;
    if ( ! this.control.containsKey ( "status" ) ) return "" ;
    HashMap<String,Object> status = (HashMap<String,Object>)this.control.get ( "status" ) ;
    if ( status == null ) return "" ;
    return "" + status.get ( "reason" ) ;
  }
}
