package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;
import org.gessinger.gepard.zeroconf.* ;
public class ZeroconfEmitter
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      ZeroconfEmitter j = new ZeroconfEmitter() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  ZeroconfEmitter()
  throws Exception
  {
    String type = Util.getProperty ( "gepard.zeroconf.type", "test-gepard" ) ;
    // MDNSLookup mdns = new MDNSLookup() ;
    // mdns.findService ( type, new AcceptableService()
    // {
    //   public boolean accept ( Service service )
    //   {
    //     System.out.println ( service ) ;
    //     return true ;
    //   }
    // }) ;
    // Client client = Client.getInstance() ;
    Client client = new Client ( type, new AcceptableService()
    {
      public boolean accept ( Service service )
      {
        System.out.println ( service ) ;
        String name = Util.getProperty ( "name", "ALARM" ) ;
        client.emit ( name ) ;
        client.close() ;
        return true ;
      }
    }) ;
  }
}
