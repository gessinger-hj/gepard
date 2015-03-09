package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class Locker
{
  static public void main ( String[] args )
  {
    try
    {
      Lock lock = new Lock ( "user:4711" ) ;
      lock.acquire() ;

      if ( lock.isOwner() )
      {
        System.out.println ( lock ) ;
        System.out.println ( "Sleep for 10 seconds" ) ;
        Thread.sleep ( 10000 ) ;
        System.out.println ( "release" ) ;
        lock.release() ;
      }
      else
      {
        System.out.println ( lock ) ;
      }
      lock.getClient().close() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
