package org.gessinger.gepard.test ;
import org.gessinger.gepard.* ;

import java.util.HashMap ;

public class ack
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      final Client client = Client.getInstance() ;
      client.setReconnect ( true ) ;
      String name = Util.getProperty ( "name", "ack" ) ;
      client.on ( name, new EventListener()
      {
        public void event ( Event e )
        {
          System.out.println ( "e.getChannel()=" + e.getChannel() ) ;
          try
          {
            e.sendBack() ;
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
      } ) ;
      Thread.sleep ( Integer.MAX_VALUE ) ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
