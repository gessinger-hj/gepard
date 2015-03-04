package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.HashMap ;

public class Responder
{
  static public void main ( String[] args )
  {
    try
    {
      Responder j = new Responder() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Responder()
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
    String name = "getFileList" ;
    System.out.println ( "Listen for requests with name=" + name ) ;
    client.on ( name, new EventListener()
    {
      public void event ( Event e )
      {
        String[] fileList = new String[] { "a.java", "b.java", "c.java" } ;
        System.out.println ( "Request in" ) ;
        System.out.println ( "File list out:\n" + Util.toString ( fileList ) ) ;
        e.putBodyValue ( "file_list", fileList ) ;
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
  }
}
