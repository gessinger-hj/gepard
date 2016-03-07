/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-03-01 12:48:16
* @Last Modified by:   HG02055
* @Last Modified time: 2016-03-07 17:31:35
*/

package org.gessinger.gepard.zeroconf ;

import java.net.* ;

public class Service
{
	String name ;
	String type ;
	int port ;
	String host ;
	boolean _isReconnect = false ; ;

	public Service ( String name, String type, int port, String host )
	{
		this.name = name ;
		this.type = type ;
		this.port = port ;
		this.host = host ;
	}
	public String getName() { return name ; }
	public String getType() { return type ; }
	public int getPort() { return port ; }
	public String getHost() { return host ; }
	public boolean isReconnect() { return _isReconnect ; }
	public void setIsReconnect ( boolean state ) { _isReconnect = state ; }
	public String toString()
	{
		return "(" + getClass().getName() + ")[name=" + name + ",type=" + type + ",host=" + host + ",port=" + port + "]" ;	
	}
	public boolean isLocalHost()
	throws Exception
	{
		InetAddress ia = InetAddress.getByName ( getHost() ) ;
    if (  ia.isAnyLocalAddress()
       || ia.isLoopbackAddress()
       || NetworkInterface.getByInetAddress(ia) != null
       )
    {
      return true ;
    }
    return false ;
	}
}