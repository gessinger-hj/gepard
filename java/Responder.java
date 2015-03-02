import java.util.HashMap ;
import java.io.* ;
import java.net.* ;
import java.text.* ;

import com.google.gson.* ;
import org.gessinger.gepard.* ;

public class Responder
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
      Responder j = new Responder() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Responder()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    client.onShutdown ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e ) ;
        System.exit ( 0 ) ;
      }
    });
    String name = Util.getProperty ( "name", "ALARM" ) ;
    name += ":request" ;
    System.out.println ( "Listen for requests with name=" + name ) ;
    client.on ( name, new EventListener()
    {
      public void event ( Event e )
      {
        if ( ! e.isResultRequested() )
        {
          System.out.println ( "No result requested in\n:" + e ) ;
          return ;
        }

        System.out.println ( "=================== INBOUND ========================" ) ;
        System.out.println ( e ) ;
        e.getBody().put ( "result", "This is a result from Java" ) ;
        System.out.println ( "=================== OUTBOUND =======================" ) ;
        System.out.println ( e ) ;
        try
        {
          client.sendResult ( e ) ;
        }
        catch ( Exception exc )
        {
          System.out.println ( Util.toString ( exc ) ) ;
        }
      }
    } ) ;
  }
}
