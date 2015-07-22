package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import java.util.HashMap ;
public class EmitterWithStatusInfo
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      EmitterWithStatusInfo j = new EmitterWithStatusInfo() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  EmitterWithStatusInfo()
  throws Exception
  {
    Client client = Client.getInstance() ;
    String name = Util.getProperty ( "name", "ALARM" ) ;

    Event e = new Event ( name ) ;
    HashMap<String,Object> body = e.getBody() ;
    body.put ( "BINARY", new byte[] { 11, 12, 13 } ) ;
    client.emit ( e, new StatusCallback()
    {
      public void status ( Event e )
      {
        System.out.println ( "status=" + e.getStatusName() ) ;
        System.out.println ( e.getStatusReason() ) ;
      }
    } ) ;
    Thread.sleep ( 1000 ) ;
    client.close() ;
  }
}
