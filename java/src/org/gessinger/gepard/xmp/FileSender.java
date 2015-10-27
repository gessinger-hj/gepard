package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.List ;

public class FileSender
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      FileSender j = new FileSender() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  FileSender()
  throws Exception
  {
    final Client client = Client.getInstance() ;

    Event event = new Event ( "__FILE__" ) ;
    final String file = Util.getProperty ( "file", "build.xml" ) ;
    event.putValue ( "DATA", new FileContainer ( file ) ) ;
    client.request ( event, new ResultCallback()
    {
      public void result ( Event e )
      {
        if ( e.isBad() )
        {
          System.out.println ( e ) ;
        }
        else
        {
          System.out.println ( "File " + file + " sent successfully." ) ;
          System.out.println ( "code: " + e.getStatusCode() );
          System.out.println ( "name: " + e.getStatusName() );
          System.out.println ( "reason: " + e.getStatusReason() );
        }
        client.close() ;
      }
    }) ;
  }
}
