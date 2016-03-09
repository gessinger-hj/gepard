package org.gessinger.gepard.zeroconf ;

import java.io.IOException;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;

import java.util.* ;
import java.net.* ;

import org.gessinger.gepard.* ;

public class MDNSLookup
{
  public static void main(String[] args)
  {
    Util.argsToProperties ( args ) ;
    try
    {
      MDNSLookup mdns = new MDNSLookup() ;
      if ( Util.getProperty ( "m" ) != null )
      {
        mdns.monitor() ;
      }
      else
      {
        String type = Util.getProperty ( "type", "gepard" ) ;
        mdns.findService ( type, new AcceptableService()
        {
          public boolean accept ( Client self, Service service )
          {
System.out.println ( "1 ----------------------" ) ;
            System.out.println ( service ) ;
            return true ;
          }
        }) ;
      }
    }
    catch ( Exception exc )
    {
      System.out.println ( Util.toString ( exc ) ) ;
    }
  }

  class Info
  {
    String fqdn = "" ;
    boolean used = true ;
  }
  HashMap<String,Info> store = new HashMap<String,Info>() ;
  class SampleListener implements ServiceListener
  {
    AcceptableService acceptableServive ;
    SampleListener ( AcceptableService acceptableServive )
    {
      this.acceptableServive = acceptableServive ;
    }
    @Override
    public void serviceAdded(ServiceEvent event) {
      if ( acceptableServive == null )
      {
        String fqdn = event.getName() + "." + event.getType() ;
        // System.out.println ( "Added: " + fqdn ) ;
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
      if ( acceptableServive != null )
      {
        ServiceInfo si = event.getInfo() ;
        String name = event.getName() ;
        int pos = name.indexOf ( "[H:" ) ;
        if ( pos < 0 )
        {
          System.err.println ( "Not usable" ) ;
          System.err.println ( si ) ;
          return ;
        }

        Service service = new Service ( name, event.getType() ) ;
        boolean answer = acceptableServive.accept ( null, service ) ;
        if ( answer )
        {
          try
          {
            jmdns.close();
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
      }
    }

    @Override
    public void serviceRemoved(ServiceEvent event) {
        System.out.println("Service removed : " + event.getName() + "." + event.getType());
    }

    @Override
    public void serviceResolved(ServiceEvent event) {
        System.out.println("Service resolved: " + event.getInfo());
    }
  }
  public void monitor (  )
  throws Exception
  {
    InetAddress addr = InetAddress.getLocalHost();
    String type = Util.getProperty ( "type", "gepard" ) ;

    while ( true )
    {
      // jmdns = JmDNS.create ( addr ) ;
      jmdns = JmDNS.create() ;
      jmdns.addServiceListener("_" + type + "._tcp.local.", new SampleListener(null));
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
  JmDNS jmdns = null ;
  public void findService ( String type, AcceptableService acceptableServive )
  throws Exception
  {
    InetAddress addr = InetAddress.getLocalHost();
    if ( type == null ) type = "gepard" ;
    jmdns = JmDNS.create() ;
    jmdns.addServiceListener("_" + type + "._tcp.local.", new SampleListener ( acceptableServive ) ) ;
    Thread.sleep ( Long.MAX_VALUE ) ;
  }
  public MDNSLookup()
  {

  }
}
