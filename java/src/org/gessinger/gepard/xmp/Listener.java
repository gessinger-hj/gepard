package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class Listener
{
  static Client client = Client.getInstance() ;
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      String name = Util.getProperty ( "name" ) ;
      if ( name == null )
      {
        name = "ALARM,BLARM" ;
      }
      final String[] nameArray = name.split ( "," ) ;

      System.out.println ( "Listen for events with name=" + name ) ;
      client.on ( nameArray, new EventListener()
      {
        public void event ( Event e )
        {
          System.out.println ( e ) ;
        }
      } ) ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
