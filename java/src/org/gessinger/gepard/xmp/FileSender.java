package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.List ;

public class FileSender
{
  static public void main ( String[] args )
  {
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

    String name = "__FILE__" ;

    Event event = new Event ( "__FILE__" ) ;
    FileReference fr = new FileReference ( "xxx.js" ) ;
    event.putValue ( "FR", fr ) ;
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
          FileReference FR = (FileReference) e.getValue ( "FR" ) ;
          System.out.println ( FR ) ;
        }
        client.close() ;
      }
    }) ;
  }
}
