package org.gessinger.gepard ;
import java.io.IOException ;
import java.util.Timer ;
import java.util.TimerTask ;
public class Semaphore
{
  Client client = null ;
  String resourceId = "" ;
  SemaphoreCallback scb = null ;
  boolean _isSemaphoreOwner = false ;
  long timeoutMillis = -1 ;
  Timer _Timer = null ;
  boolean hasCallback()
  {
    return scb != null ;
  }
  public Semaphore ( String resourceId )
  {
    this ( resourceId, -1, null ) ;
  }
  public Semaphore ( String resourceId, int port )
  {
    this ( resourceId, port, null ) ;
  }
  public Semaphore ( String resourceId, int port, String host )
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
    return _isSemaphoreOwner ;
  }
  public String getName()
  {
    return resourceId ;
  }
  public void acquire()
  throws IOException
  {
    this.scb = null ;
    client.acquireSemaphore ( this ) ;
  }
  public void acquire ( long millis )
  throws IOException
  {
    this.scb = null ;
    timeoutMillis = millis ;
    client.acquireSemaphore ( this ) ;
  }
  public void acquire ( SemaphoreCallback scb )
  throws IOException
  {
    this.scb = scb ;
    client.acquireSemaphore ( this ) ;
  }
  public void release()
  throws IOException
  {
    this.scb = null ;
    client.releaseSemaphore ( this ) ;
  }
}
