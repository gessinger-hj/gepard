import java.util.* ;
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
    Event e = new Event ( "ALARM", "TEST" ) ;
    User u = new User ( "guest", "guest" ) ;
    u.addRight ( "CAN_SHUTDOWN", "true" ) ;
    e.setUser ( u ) ;
    JsonObject body = e.getBody() ;
    body.addProperty ( "file", "a/b/c/d.txt" ) ;
    String t = e.toJSON() ;
System.out.println ( "t=" + t ) ;
    Event e2 = Event.fromJSON ( t ) ;
System.out.println ( e2 ) ;
    Socket s = new Socket ( (String)null, 17501 ) ;
    OutputStream out = s.getOutputStream() ;
    OutputStreamWriter wr = new OutputStreamWriter ( out, "utf-8" ) ;
    wr.write ( t, 0, t.length() ) ;
    wr.flush() ;
    s.setSoLinger ( true, 0 ) ;
    wr.close() ;
  }
}
