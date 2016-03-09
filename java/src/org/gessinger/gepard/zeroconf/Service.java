/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-03-01 12:48:16
* @Last Modified by:   hg02055
* @Last Modified time: 2016-03-09 18:58:46
*/

package org.gessinger.gepard.zeroconf ;

import org.gessinger.gepard.* ;
import java.util.* ;
import java.net.* ;

public class Service
{
	String name ;
	String type ;
	int port ;
	String host ;
	List<String> topics ;
	List<String> channels ;
	boolean _isReconnect = false ; ;

	public Service ( String name, String type )
	{
		this.name = name.substring ( 0, name.indexOf ( '-' ) ) ; ;
		this.type = type ;

    int pos = name.indexOf ( "[H:" ) ;
		this.host = name.substring ( pos + 3, name.indexOf ( "]", pos ) ) ;
    pos = name.indexOf ( "[P:" ) ;
    String s = name.substring ( pos + 3, name.indexOf ( "]", pos ) ) ;
		this.port = -1 ;
    try
    {
      this.port = Integer.parseInt ( s ) ; 
    }
    catch ( Exception exc )
    {
      System.out.println ( Util.toString ( exc ) ) ;
      return ;
    }
    pos = name.indexOf ( "[T:" ) ;
    if ( pos < 0 )
    {
			topics = new ArrayList<String>() ;
    }
    else
    {
			s = name.substring ( pos + 3, name.indexOf ( "]", pos ) ) ;
			String[] a = s.split ( "," ) ;
			topics = Arrays.asList ( a ) ;
    }
    pos = name.indexOf ( "[C:" ) ;
    if ( pos < 0 )
    {
			channels = new ArrayList<String>() ;
    }
    else
    {
			s = name.substring ( pos + 3, name.indexOf ( "]", pos ) ) ;
			String[] a = s.split ( "," ) ;
			channels = Arrays.asList ( a ) ;
    }
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
	public List<String> getTopics()
	{
		return topics ;	
	}
	public List<String> getChannels()
	{
		return channels ;	
	}
}