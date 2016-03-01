/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-03-01 12:48:16
* @Last Modified by:   Hans Jürgen Gessinger
* @Last Modified time: 2016-03-01 12:48:16
*/

package org.gessinger.gepard.zeroconf ;

public class Service
{
	String name ;
	String type ;
	int port ;
	String host ;

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
	public String toString()
	{
		return "(" + getClass().getName() + ")[name=" + name + ",type=" + type + ",host=" + host + ",port=" + port + "]" ;	
	}
}