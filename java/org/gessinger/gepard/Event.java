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
  
  JsonObject control = new JsonObject() ;
  JsonObject body = new JsonObject() ;
  Event ( HashMap map )
  {
System.out.println ( Util.toString ( map ) ) ;
    setName ( (String) map.get ( "name" ) ) ;
    setType ( (String) map.get ( "type" ) ) ;
    Map<String,Object> mcontrol = (Map<String,Object>) map.get ( "control" ) ;
    Map<String,Object> mbody = (Map<String,Object>) map.get ( "body" ) ;
    Util.deepCopy ( mcontrol, control ) ;
    Util.deepCopy ( mbody, body ) ;
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
  public Event ( String name, String type, JsonObject body )
  {
    this.name = name ;
    this.type = type ;
    this.control.addProperty ( "createdAt", "" + new Date() ) ;
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
    return this.control.getAsJsonPrimitive ( "createdAt" ).toString() ;
  }
  public void setIsResult()
  {
    this.control.addProperty ( "_isResult", true ) ;
  }
  public boolean isResult()
  {
    return (this.control.getAsJsonPrimitive ( "_isResult" )+"").equals ( "true" ) ;
  }
  public void setResultRequested()
  {
    this.control.addProperty ( "_isResultRequested", true ) ;
  }
  public boolean isResultRequested()
  {
    return (this.control.getAsJsonPrimitive ( "_isResultRequested" )+"").equals ( "true" ) ;
  }
  public void setFailureInfoRequested()
  {
    this.control.addProperty ( "_isFailureInfoRequested", true ) ;
  }
  public boolean isFailureInfoRequested()
  {
    return (this.control.getAsJsonPrimitive ( "_isFailureInfoRequested" )+"").equals ( "true" ) ;
  }
  public void setIsBroadcast()
  {
    this.control.addProperty ( "_isBroadcast", true ) ;
  }
  public boolean isBroadcast()
  {
    return (this.control.getAsJsonPrimitive ( "_isBroadcast" )+"").equals ( "true" ) ;
  }
  public String getSourceIdentifier()
  {
    return "" + this.control.getAsJsonPrimitive ( "sourceIdentifier" ) ;
  }
  public void setSourceIdentifier ( String sourceIdentifier )
  {
    this.control.addProperty ( "sourceIdentifier", sourceIdentifier ) ;
  }
  public String getProxyIdentifier()
  {
    return "" + this.control.getAsJsonPrimitive ( "proxyIdentifier" ) ;
  }
  public void setProxyIdentifier ( String proxyIdentifier )
  {
    this.control.addProperty ( "proxyIdentifier", proxyIdentifier ) ;
  }
  public String getWebIdentifier()
  {
    return "" + this.control.getAsJsonPrimitive ( "webIdentifier" ) ;
  }
  public void setWebIdentifier ( String webIdentifier )
  {
    this.control.addProperty ( "webIdentifier", webIdentifier ) ;
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
  public JsonObject getBody()
  {
    return this.body ;
  }
  public void setBody ( JsonObject body )
  {
    if ( body != null ) this.body = body ;
    else this.body = new JsonObject() ;
  }
  public User getUser()
  {
    return this.user ;
  }
  public void setUser ( User u )
  {
    this.user = u ;
  }
  public JsonObject getControl()
  {
    return this.control ;
  }
  public void setUniqueId ( String uid )
  {
    if ( ! this.control.has ( "uniqueId" ) )
    {
      this.control.addProperty ( "uniqueId", uid ) ;
    }
  }
  public String getUniqueId()
  {
    return "" + this.control.getAsJsonPrimitive ( "uniqueId" ) ;
  }
  public boolean isBad()
  {
    if ( this.control == null ) return false ;
    if ( ! this.control.has ( "status" ) ) return false ;
    JsonObject status = this.control.getAsJsonObject ( "status" ) ;
    if ( status == null ) return false ;
    if ( ! status.has ( "code" ) ) return false ;
    return ! (status.getAsJsonPrimitive ( "code" )+"").equals ( "0" ) ;
  }
  public JsonObject getStatus()
  {
    if ( this.control == null ) return null ;
    return this.control.getAsJsonObject ( "status" ) ;
  }
  public String getStatusReason()
  {
    if ( this.control == null ) return "" ;
    if ( ! this.control.has ( "status" ) ) return "" ;
    JsonObject status = this.control.getAsJsonObject ( "status" ) ;
    if ( status == null ) return "" ;
    return "" + status.getAsJsonPrimitive ( "reason" ) ;
  }
}
