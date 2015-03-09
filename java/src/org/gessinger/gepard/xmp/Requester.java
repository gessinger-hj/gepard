package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.List ;

public class Requester
{
  static public void main ( String[] args )
  {
    try
    {
      Requester j = new Requester() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Requester()
  throws Exception
  {
    final Client client = Client.getInstance() ;

    String name = "getFileList" ;
    System.out.println ( "Request data for name=" + name ) ;

    client.request ( name, new ResultCallback()
    {
      public void result ( Event e )
      {
        if ( e.isBad() )
        {
          System.out.println ( "e.getStatusReason()=" + e.getStatusReason() ) ;
        }
        else
        {
          List<String> list = (List<String>) e.getBodyValue ( "file_list" ) ;
          System.out.println ( Util.toString ( list ) ) ;
        }
        client.close() ;
      }
    }) ;
  }
}
