package org.gessinger.gepard ;
import java.io.IOException ;
public class Lock
{
  Client client = null ;
  String resourceId = "" ;
  boolean _isLockOwner = false ;
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
    return _isLockOwner ;
  }
  public void acquire ()
  throws IOException
  {
    client.acquireLock ( this ) ;
    if ( ! isOwner() && this.client._first )
    {
      client.close() ;
    }
  }
  public void release()
  throws IOException
  {
    client.releaseLock ( this ) ;
    if ( this.client._first )
    {
      client.close() ;
    }
  }
}
