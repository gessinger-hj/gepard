package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
public class LogTest
{
  static public void main ( String[] args )
  {
    try
    {
System.out.println ( "Client.LogLevel.INFO=" + Client.LogLevel.INFO ) ;
      Client client = Client.getInstance() ;
      client.log ( "SYSTEM LOG TEST JAVA" ) ;
      client.close() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
