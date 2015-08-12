package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import java.util.* ;
public class EmitterWithBody
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      EmitterWithBody j = new EmitterWithBody() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  EmitterWithBody()
  throws Exception
  {
    Client client = Client.getInstance() ;
    String name = Util.getProperty ( "name", "ALARM" ) ;

    Event e = new Event ( name ) ;
    e.putValue ( "BINARY", new byte[] { 11, 12, 13 } ) ;
    e.putValue ( "DATE", new Date() ) ;
    client.emit ( e ) ;
    client.close() ;
  }
}
