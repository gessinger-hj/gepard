package org.gessinger.gepard.test ;
import org.gessinger.gepard.* ;

import java.util.List ;

public class req
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      final Client client = Client.getInstance() ;

      String name = Util.getProperty ( "name", "ack" ) ;
      client.request ( name, new ResultCallback()
      {
        public void result ( Event e )
        {
          System.out.println ( e.getStatus() ) ;
          System.out.println ( "e.getChannel()=" + e.getChannel() ) ;
          client.close() ;
        }
      }) ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
