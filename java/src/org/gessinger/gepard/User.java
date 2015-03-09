package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

import com.google.gson.* ;

public class User
{
  String className = "User" ;
  String id        = null ;
  String key       = null ;
  String _pwd      = null ;
  HashMap<String,String> rights = new HashMap<String,String>() ;
  public User ( Map<String,Object> muser )
  {
    id = (String) muser.get ( "id" ) ;
    key = (String) muser.get ( "key" ) ;
    _pwd = (String) muser.get ( "_pwd" ) ;
    Util.copyString ( (Map<String,Object>)muser.get ( "rights" ), rights ) ;
  }
  public User ( String id )
  {
    this ( id, null, null ) ;
  }
  public User ( String id, String pwd )
  {
    this ( id, pwd, null ) ;
  }
  public User ( String id, String pwd, String key )
  {
    this.id  = id ;
    this.key = key ;
    this._pwd = pwd ;
  }
  public String toString()
  {
    return "(User)[id=" + id + ",key=" + key + "]\n[rights=" + Util.toString ( rights ) + "]" ;
  }
  public String getId()
  {
    return id ;
  }
  public String getPwd()
  {
    return _pwd ;
  }
  public String getKey()
  {
    return key ;
  }
  public void setKey ( String key )
  {
    this.key = key ;
  }
  public void addRight ( String name, String value )
  {
    rights.put ( name, value ) ;
  }
  public String getRight ( String name )
  {
    return rights.get ( name ) ;
  }
}
