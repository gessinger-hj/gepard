package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.List ;

public class FileReceiver
{
  static public void main ( String[] args )
  {
    try
    {
      FileReceiver j = new FileReceiver() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  FileReceiver()
  throws Exception
  {
    final Client client = Client.getInstance() ;

    System.out.println ( "Wait for incoming file in a FileContainer." ) ;

    client.on ( "__FILE__", new EventListener()
    {
      public void event ( Event e )
      {
        try
        {
          FileContainer fileContainer = (FileContainer) e.removeValue ( "DATA" ) ;
          String fname = fileContainer.getName() + ".in" ;
          fileContainer.write ( fname ) ;
          System.out.println ( fname + " written." );
          e.setStatus ( 0, "success", "File accepted." ) ;
        }
        catch ( Exception exc )
        {
          e.setStatus ( 1, "error", "File not saved." ) ;
          System.out.println ( Util.toString ( exc ) ) ;
        }
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
