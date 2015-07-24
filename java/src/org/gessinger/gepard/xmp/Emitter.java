package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import java.util.Map ;
public class Emitter
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Emitter j = new Emitter() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Emitter()
  throws Exception
  {
    Client client = Client.getInstance() ;
    String name = Util.getProperty ( "name", "ALARM" ) ;

    Event e = new Event ( name ) ;
    Map<String,Object> body = e.getBody() ;
    body.put ( "BINARY", new byte[] { 11, 12, 13 } ) ;
    client.emit ( e, new FailureCallback()
    {
      public void failure ( Event e )
      {
        System.out.println ( e ) ;
      }
    } ) ;
    Thread.sleep ( 1000 ) ;
    client.close() ;
  }
}
