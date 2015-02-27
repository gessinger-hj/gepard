import java.util.HashMap ;
import java.io.* ;
import java.net.* ;
import java.text.* ;

import com.google.gson.* ;
import org.gessinger.gepard.* ;

public class Json
{
  interface Callback extends FailureCallback, ResultCallback, ErrorCallback
  {
  }
  interface Callback2 extends ResultCallback, ErrorCallback
  {
  }
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
    final Client client = new Client() ;
    client.onShutdown ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e ) ;
      }
    });
    String emit = Util.getProperty ( "emit" ) ;
    String on = Util.getProperty ( "on" ) ;
    if ( emit != null )
    {
      if ( emit.equals ( "emit" ) )
      {
        emit = "ALARM" ;
      }
      if ( Util.getProperty ( "request" ) != null )
      {
        emit += ":request" ;
      }
      Event e = new Event ( emit, "TEST" ) ;
      User u = new User ( "guest", "guest" ) ;
      u.addRight ( "CAN_SHUTDOWN", "true" ) ;
      e.setUser ( u ) ;
      HashMap<String,Object> body = e.getBody() ;
      body.put ( "file", "a/b/c/d.txt" ) ;
      body.put ( "ABC", new String[] { "A", "B", "C" } ) ;
      body.put ( "BINARY", new byte[] { 11, 12, 13 } ) ;

      Callback cb = new Callback()
      {
        public void failure ( Event e )
        {
          System.out.println ( e ) ;
        }
        public void result ( Event e )
        {
          System.out.println ( e ) ;
        }
        public void error ( Event e )
        {
          System.out.println ( e ) ;
        }
      };
      if ( Util.getProperty ( "request" ) != null )
      {
        client.emit ( e, cb ) ;
      }
      else
      {
        client.emit ( e ) ;
      }
      // Thread.sleep ( 1000 ) ;
      client.close() ;
    }
    else
    if ( on != null )
    {
      if ( on.equals ( "on" ) )
      {
        on = "ALARM" ;
      }
      client.on ( on, new EventListener()
      {
        public void event ( Event e )
        {
          System.out.println ( e ) ;
          if ( e.isResultRequested() )
          {
            e.getBody().put ( "result", "This is a result from Java" ) ;
            try
            {
              client.sendResult ( e ) ;
            }
            catch ( Exception exc )
            {
              System.out.println ( Util.toString ( exc ) ) ;
            }
          }
        }
      } ) ;
    }
  }
}
