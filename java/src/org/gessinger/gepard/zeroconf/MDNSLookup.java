// Licensed under Apache License version 2.0
// Original license LGPL

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

package org.gessinger.gepard.zeroconf ;

import java.io.IOException;
import java.util.Enumeration;
import java.util.logging.ConsoleHandler;
import java.util.logging.Level;
import java.util.logging.LogManager;
import java.util.logging.Logger;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;

import org.gessinger.gepard.* ;
/**
 * Sample Code for Listing Services using JmDNS.
 * <p>
 * Run the main method of this class. This class prints a list of available HTTP services every 5 seconds.
 *
 * @author Werner Randelshofer
 */
public class MDNSLookup
{
  public static void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    /* Activate these lines to see log messages of JmDNS */
    boolean log = false;
    if (log) {
        ConsoleHandler handler = new ConsoleHandler();
        handler.setLevel(Level.FINEST);
        for (Enumeration<String> enumerator = LogManager.getLogManager().getLoggerNames(); enumerator.hasMoreElements();) {
            String loggerName = enumerator.nextElement();
            Logger logger = Logger.getLogger(loggerName);
            logger.addHandler(handler);
            logger.setLevel(Level.FINEST);
        }
    }

    JmDNS jmdns = null;
    try
    {
      jmdns = JmDNS.create();
      while ( true )
      {
        // String type = "_airport._tcp.local." ;
        String type = "_test-gepard._tcp.local." ;
        ServiceInfo[] infos = jmdns.list ( type ) ;
        System.out.println("List " + type );
        for (int i = 0; i < infos.length; i++) {
            System.out.println(infos[i]);
            // System.out.println ( "infos[i].getType()=" + infos[i].getType() ) ;
            // System.out.println ( "infos[i].getTypeWithSubtype()=" + infos[i].getTypeWithSubtype() ) ;
            // System.out.println ( "infos[i].getName()=" + infos[i].getName() ) ;
            // System.out.println ( "infos[i].getKey()=" + infos[i].getKey() ) ;
            // System.out.println ( "infos[i].getQualifiedName()=" + infos[i].getQualifiedName() ) ;
            System.out.println ( "infos[i].getServer()=" + infos[i].getServer() ) ;
            System.out.println ( "infos[i].getHostAddress()=" + infos[i].getHostAddress() ) ;
            System.out.println ( "infos[i].getAddress()=" + infos[i].getAddress() ) ;
            // System.out.println ( "infos[i].getInetAddress()=" + infos[i].getInetAddress() ) ;
            // System.out.println ( "infos[i].getInet4Address()=" + infos[i].getInet4Address() ) ;
            // System.out.println ( "infos[i].getInet6Address()=" + infos[i].getInet6Address() ) ;
            System.out.println ( "infos[i].getPort()=" + infos[i].getPort() ) ;
            // System.out.println ( "infos[i].getPriority()=" + infos[i].getPriority() ) ;
            // System.out.println ( "infos[i].getWeight()=" + infos[i].getWeight() ) ;
            // System.out.println ( "infos[i].getTextString()=" + infos[i].getTextString() ) ;
            // System.out.println ( "infos[i].getURL()=" + infos[i].getURL() ) ;
            // // System.out.println ( "infos[i].getPropertyString()=" + infos[i].getPropertyString() ) ;
            // System.out.println ( "infos[i].getNiceTextString()=" + infos[i].getNiceTextString() ) ;
            // System.out.println ( "infos[i].isPersistent()=" + infos[i].isPersistent() ) ;
            // System.out.println ( "infos[i].getProtocol()=" + infos[i].getProtocol() ) ;
            // System.out.println ( "infos[i].getApplication()=" + infos[i].getApplication() ) ;

        if ( infos[i].getTextBytes().length > 0 )
        {
          StringBuilder buf = new StringBuilder() ;
            // buf.append("\n");
            buf.append(infos[i].getNiceTextString());
            buf.append("\n");
            buf.append(infos[i].getTextString());
            buf.append("\n");
            for ( Enumeration<String> en = infos[i].getPropertyNames() ; en.hasMoreElements() ; )
            {
              String key = en.nextElement() ;
              buf.append("\n");
              buf.append ("\t" + key + ": " + new String ( infos[i].getPropertyString ( key ) ) + "\n" ) ;
            }
          // Map<String, byte[]> properties = this.getProperties();
          // if (!properties.isEmpty()) {
          //     buf.append("\n");
          //     for (String key : properties.keySet()) {
          //         buf.append("\t" + key + ": " + new String(properties.get(key)) + "\n");
          //     }
          // } else {
          //     buf.append(" empty");
          // }
          System.out.println ( buf ) ;
        }

        }
        System.out.println();

        Thread.sleep(5000);
      }
    }
    catch ( Exception e )
    {
      e.printStackTrace();
    }
    finally
    {
      if ( jmdns != null ) try { jmdns.close(); } catch (Exception exception) {}
    }
  }
}
