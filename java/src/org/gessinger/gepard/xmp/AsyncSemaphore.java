package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
public class AsyncSemaphore
{
  static public void main ( String[] args )
  {
    try
    {
      final Semaphore sem = new Semaphore ( "user:4711" ) ;
      System.out.println ( "Trying to acquire the semaphore 'user:4711'" ) ;
      sem.acquire ( new SemaphoreCallback()
      {
        public void acquired ( Event e )
        {
          System.out.println ( "Now owner of semaphore=" + sem.getName() ) ;
          try
          {
            System.out.println ( "sleep for 10 second" ) ;
            Thread.sleep ( 10000 ) ;
            System.out.println ( "release semaphore" ) ;
            sem.release() ;
            sem.getClient().close() ;
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
      }) ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
