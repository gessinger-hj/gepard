import com.google.gson.* ;
import org.gessinger.gepard.* ;

public class Requester
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Requester j = new Requester() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Requester()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    String name = Util.getProperty ( "name", "ALARM" ) ;
    name += ":request" ;

    System.out.println ( "Request data for name=" + name ) ;

    client.emit ( name, new ResultCallback()
    {
      public void result ( Event e )
      {
        System.out.println ( e ) ;
      }
    }) ;
    Thread.sleep ( 1000 ) ;
    client.close() ;
  }
}
