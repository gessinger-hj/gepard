package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

import com.google.gson.* ;

public class User
{
  String className = "User" ;
  String id        = null ;
  int key          = -1 ;
  String _pwd      = null ;
  HashMap<String,String> rights = new HashMap<String,String>() ;
  HashMap<String,Object> groups = new HashMap<String,Object>() ;
  HashMap<String,Object> attributes = new HashMap<String,Object>() ;
  User ()
  {
  }
  public User ( String id )
  {
    this ( id, -1, null ) ;
  }
  public User ( String id, String pwd )
  {
    this ( id, -1, pwd ) ;
  }
  public User ( String id, int key, String pwd )
  {
    this.id  = id ;
    this.key = key ;
    this._pwd = pwd ;
  }
  public String toString()
  {
    return "(User)[id=" + id + ",key=" + key + "]\n[rights=" + Util.toString ( rights ) + "]"
    + "\n[groups=" + Util.toString ( groups ) + "]"
    + "\n[attributes=" + Util.toString ( attributes ) + "]"
    ;
  }
  public String getId()
  {
    return id ;
  }
  public String getPwd()
  {
    return _pwd ;
  }
  public int getKey()
  {
    return key ;
  }
  public void setKey ( int key )
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
  public Map<String,Object> getGroups()
  {
    return groups ;
  }
  public Map<String,Object> getAttributes()
  {
    return attributes ;
  }
  public String getAttribute ( String name )
  {
    return (String)attributes.get ( name ) ;
  }
  public Object getObjectAttribute ( String name )
  {
    return attributes.get ( name ) ;
  }
  public String getLanguage()
  {
    return getAttribute ( "lang" ) ;
  }
}
