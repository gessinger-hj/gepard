package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
public class XmpLog
{
  static public void main ( String[] args )
  {
    try
    {
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
