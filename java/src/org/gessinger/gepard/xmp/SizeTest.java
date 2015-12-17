package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import java.io.* ;
public class SizeTest
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      SizeTest j = new SizeTest() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  SizeTest()
  throws Exception
  {
    Client client = Client.getInstance() ;
    String fn = Util.getProperty ( "file", "RSE_0_1-R6_Scenario5_2.xml" ) ;
    byte[] ba = Util.getBytes ( new File ( fn ) ) ;
    Event e = new Event ( "ALARM" ) ;
    e.putValue ( "DATA", ba ) ;
    client.emit ( e ) ;
    client.emit ( e, new StatusCallback()
    {
      public void status ( Event e )
      {
        System.out.println ( "status=" + e.getStatusName() ) ;
        System.out.println ( e.getStatusReason() ) ;
        e.getClient().close() ;
      }
    } ) ;
  }
}
