import java.util.HashMap ;
import java.io.* ;
import java.net.* ;
import java.text.* ;

import com.google.gson.* ;
import org.gessinger.gepard.* ;

public class Json
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Json j = new Json() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Json()
  throws Exception
  {
//     Event e = new Event ( "ALARM", "TEST" ) ;
//     User u = new User ( "guest", "guest" ) ;
//     u.addRight ( "CAN_SHUTDOWN", "true" ) ;
//     e.setUser ( u ) ;
//     HashMap<String,Object> body = e.getBody() ;
//     body.put ( "file", "a/b/c/d.txt" ) ;
//     body.put ( "ABC", new String[] { "A", "B", "C" } ) ;
//     body.put ( "BINARY", new byte[] { 11, 12, 13 } ) ;
//     String t = e.toJSON() ;
// System.out.println ( "t=" + t ) ;
//     Event e2 = Event.fromJSON ( t ) ;
// System.out.println ( e2 ) ;
    Client client = new Client() ;
    // client.emit ( e ) ;
    client.on ( "BLARM", new EventListener()
    {
      public void event ( Event e )
      {
System.out.println ( e ) ;
      }
    } ) ;
Thread.sleep ( 100000 ) ;
    // client.close() ;
  }
}
