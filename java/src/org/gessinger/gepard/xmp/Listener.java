package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class Listener
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Listener j = new Listener() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Listener()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    client.onShutdown ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e ) ;
      }
    });
    String name = Util.getProperty ( "name", "ALARM" ) ;
    System.out.println ( "Listen for events with name=" + name ) ;
    // client.on ( name, new EventListener()
    client.on ( new String[] { "ALARM", "BLARM" }, new EventListener()
    {
      public void event ( Event e )
      {
        System.out.println ( e ) ;
      }
    } ) ;
  }
}
