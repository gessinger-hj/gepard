package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class BlockingSemaphore
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Semaphore sem = new Semaphore ( "user:4711" ) ;
      System.out.println ( "Trying to acquire the semaphore 'user:4711'" ) ;

      sem.acquire(5000) ;

      if ( ! sem.isOwner() )
      {
        System.out.println ( "Not owner after 5000 millis. Wait forever" ) ;
        sem.acquire() ;
      }
      System.out.println ( "Now owner of semaphore=" + sem.getName() ) ;
      System.out.println ( "sleep for 10 seconds" ) ;
      Thread.sleep ( 10000 ) ;
      System.out.println ( "release" ) ;
      sem.release() ;
      sem.getClient().close() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
