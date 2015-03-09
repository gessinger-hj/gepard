package org.gessinger.gepard ;

// import java.util.* ;
public class Variable<String,T>
{
  protected String _name = null ;
  protected T _obj  = null ;
  public Variable()
  {
  }
  public Variable ( String name, T obj )
  {
    _name = name ;
    _obj  = obj ;
  }
  public String getName() { return _name ; }
  public void setName ( String s ) { _name = s ; }
  public T getValue() { return _obj ; }
  public T setValue ( T o ) { _obj = o ; return o ; }
  @Override
  public java.lang.String toString()
  {
    return _name + "=" + ( _obj != null ? _obj.toString() : "(null)" ) ;
  }
}
