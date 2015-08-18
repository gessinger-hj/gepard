package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.HashMap ;

public class ResponderMassTest
{
  static public void main ( String[] args )
  {
    try
    {
      ResponderMassTest j = new ResponderMassTest() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  int n = 0 ;
  ResponderMassTest()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    client.onShutdown ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e ) ;
        System.exit ( 0 ) ;
      }
    });
    client.on ( "mass-test-start", new EventListener()
    {
      public void event ( Event e )
      {
        n = 0 ;
        System.out.println ( "mass text start" ) ;
      }
    } ) ;
    client.on ( "mass-test-end", new EventListener()
    {
      public void event ( Event e )
      {
        System.out.println ( "mass text end" ) ;
        System.out.println ( "n=" + n ) ;
      }
    } ) ;
    client.on ( "mass-test", new EventListener()
    {
      public void event ( Event e )
      {
        n++ ;
        try {e.sendBack() ; } catch ( Exception exc ) {}
      }
    } ) ;
  }
}
