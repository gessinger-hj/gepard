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
    Client client = Client.getInstance() ;
    String name = Util.getProperty ( "name", "ALARM" ) ;
    client.emit ( name ) ;
    client.close() ;
  }
}
