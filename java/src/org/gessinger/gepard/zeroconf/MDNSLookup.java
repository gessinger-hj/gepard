package org.gessinger.gepard.zeroconf ;

import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceListener;

import java.util.* ;
import java.net.* ;

import org.gessinger.gepard.* ;

public class MDNSLookup
{
  class Info
  {
    String fqdn = "" ;
    boolean used = true ;
  }
  HashMap<String,Info> store = new HashMap<String,Info>() ;
  class SampleListener implements ServiceListener
  {
    @Override
    public void serviceAdded(ServiceEvent event) {
      String fqdn = event.getName() + "." + event.getType() ;
      Info inf = store.get ( fqdn ) ;
      if ( inf == null )
      {
        inf = new Info() ;
        inf.fqdn = fqdn ;
        store.put ( fqdn, inf ) ;
        System.out.println ( "Added: " + fqdn ) ;
      }
      inf.used = true ;
    }

    @Override
    public void serviceRemoved(ServiceEvent event) {
        // System.out.println("Service removed : " + event.getName() + "." + event.getType());
    }

    @Override
    public void serviceResolved(ServiceEvent event) {
        // System.out.println("Service resolved: " + event.getInfo());
    }
  }
  public static void main(String[] args)
  {
    Util.argsToProperties ( args ) ;
    try
    {
      MDNSLookup mdns = new MDNSLookup() ;
      mdns.monitor() ;
    }
    catch ( Exception exc )
    {
      System.out.println ( Util.toString ( exc ) ) ;
    }
  }
  public void monitor (  )
  throws Exception
  {
    InetAddress addr = InetAddress.getLocalHost();
    String type = Util.getProperty ( "type", "gepard" ) ;

    while ( true )
    {
      JmDNS jmdns = JmDNS.create ( addr ) ;
      jmdns.addServiceListener("_" + type + "._tcp.local.", new SampleListener());
      ArrayList<String> toBeRemoved = new ArrayList<String>() ;
      for ( String fqdn : store.keySet() )
      {
        Info inf = store.get ( fqdn ) ;
        if ( ! inf.used )
        {
          toBeRemoved.add ( fqdn ) ;
          System.out.println ( "Removed: " + fqdn ) ;
        }
        inf.used = false ;
      }
      for ( String fqdn : toBeRemoved )
      {
        store.remove ( fqdn ) ;
      }
      toBeRemoved.clear() ;
      Thread.sleep(10000);
      jmdns.close();
    }
  }
  public void findService ( String type )
  throws Exception
  {
    InetAddress addr = InetAddress.getLocalHost();
    if ( type == null ) type = "gepard" ;
    JmDNS jmdns = JmDNS.create ( addr ) ;
    jmdns.addServiceListener("_" + type + "._tcp.local.", new SampleListener());
    Thread.sleep(Long.MAX_VALUE);
    jmdns.close();
  }
  public MDNSLookup()
  {

  }
}
