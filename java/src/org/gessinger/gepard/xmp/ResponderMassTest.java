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
    String name = "mass-test" ;
    System.out.println ( "Listen for requests with name=" + name ) ;
    client.on ( name, new EventListener()
    {
      public void event ( Event e )
      {
				try
				{
        	e.sendBack() ;
				}
				catch ( Exception exc )
				{
				}
      }
    } ) ;
  }
}
