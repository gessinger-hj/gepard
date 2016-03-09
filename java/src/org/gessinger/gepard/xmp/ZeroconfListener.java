package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import org.gessinger.gepard.zeroconf.* ;

public class ZeroconfListener
{
  static Client client ;
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    // client = Client.getInstance() ;
    String type = Util.getProperty ( "gepard.zeroconf.type", "test-gepard" ) ;

    try
    {

      client = new Client( type, new AcceptableService()
      {
        public boolean accept ( Client self, Service service )
        {
          try
          {
            System.out.println ( service ) ;
            System.out.println ( "service.isLocalHost()=" + service.isLocalHost() ) ;
            System.out.println ( "service.getTopics()=" + service.getTopics() ) ;
            System.out.println ( "service.getChannels()=" + service.getChannels() ) ;
            String name = Util.getProperty ( "name", "ALARM,BLARM" ) ;
            String[] nameArray = name.split ( "," ) ;
            System.out.println ( "Listen for events with name=" + name ) ;
            if ( ! service.isReconnect() )
            {
              self.on ( nameArray, new EventListener()
              {
                public void event ( Event e )
                {
                  System.out.println ( e ) ;
                }
              } ) ;
            }
          }
          catch ( Exception exc )
          {
            exc.printStackTrace() ;
          }
          return true ;
        }
      }) ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
}
