package org.gessinger.gepard ;
import java.io.IOException ;
public class Lock
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Lock lock = new Lock ( "user:4711" ) ;
      lock.acquire() ;

      if ( lock.isOwner() )
      {
        System.out.println ( lock ) ;
        Thread.sleep ( 5000 ) ;
        lock.release() ;
      }
      else
      {
        System.out.println ( lock ) ;
      }
      // client.close() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Client client = null ;
  String resourceId = "" ;
  boolean _isOwner = false ;
  public Lock ( String resourceId )
  {
    this ( resourceId, -1, null ) ;
  }
  public Lock ( String resourceId, int port )
  {
    this ( resourceId, port, null ) ;
  }
  public Lock ( String resourceId, int port, String host )
  {
    this.client = Client.getInstance ( port, host ) ;
    this.resourceId = resourceId ;
  }
  public String toString()
  {
    return "(" + getClass().getName() + ")[resourceId=" + resourceId + ",isOwner=" + isOwner() + "]" ;
  }
  public Client getClient()
  {
    return client ;
  }
  public boolean isOwner()
  {
    return _isOwner ;
  }
  public void acquire ()
  throws IOException
  {
    client.acquireLock ( this ) ;
  }
  public void release()
  throws IOException
  {
    client.releaseLock ( this ) ;
  }
}
