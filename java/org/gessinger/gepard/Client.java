package org.gessinger.gepard ;

import java.util.HashMap ;
import java.util.List ;
import java.io.* ;
import java.net.* ;

import com.google.gson.* ;

public class Client
{
	static int counter      = 0 ;
	int port                = -1 ;
	String host             = "localhost" ;
	Socket socket           = null ;
	User user               = null ;
	InputStreamReader  _in  = null ;
	OutputStreamWriter _out = null ;
	String _lock1           = "_lock1" ;
	String hostname         = "" ;
	int localPort           = 0 ;
  MultiMap<String,EventListener> eventListenerFunctions = new MultiMap<String,EventListener>() ;
  SyncedQueue<Event> _Q = new SyncedQueue<Event>() ;

	public Client()
	{
		this ( -1, null ) ;
	}
	public Client ( int port )
	{
		this ( port, null ) ;
	}
	public Client ( int port, String host )
	{
		this.port      = port ;
		this.host      = host ;
		if ( this.port <= 0 ) this.port    = Util.getInt ( "gepard.port", 17501 ) ;
		if ( this.host == null ) this.host = Util.getProperty ( "gepard.host" ) ;
		if ( this.host == null ) this.host = "localhost" ;
		try
		{
	    InetAddress ia = InetAddress.getLocalHost () ;
	    hostname = ia.toString() ;
		}
		catch ( Exception exc )
		{
			System.err.println ( Util.toString ( exc ) ) ;
		}
	}
	OutputStreamWriter getWriter()
	throws UnsupportedEncodingException
			 , IOException
	{
		if ( _out != null ) return _out ;
    socket = new Socket ( host, port ) ;
    OutputStream out = socket.getOutputStream() ;
    _out = new OutputStreamWriter ( out, "utf-8" ) ;
    InputStream in = socket.getInputStream() ;
    _in = new InputStreamReader ( in, "utf-8" ) ;

    localPort = socket.getLocalPort() ;

    Runner r = new Runner() ;
    new Thread ( r ).start() ;

    Event e = new Event ( "system", "client_info" ) ;
    HashMap<String,Object> body = e.getBody() ;

    body.put ( "language", "Java" ) ;
    body.put ( "hostname", hostname ) ;
    body.put ( "connectionTime", Util.getISODateTime() ) ;
    body.put ( "application", Util.getMainClassName() ) ;

		String t = e.toJSON() ;
    _out.write ( t, 0, t.length() ) ;
    _out.flush() ;

		return _out ;
	}
	public void fire ( Event e )
	throws IOException
	{
		emit ( e ) ;
	}
	public void emit ( String name )
	throws IOException
	{
		emit ( name, null ) ;
	}
	public void emit ( String name, String type )
	throws IOException
	{
		emit ( new Event ( name, type ) ) ;
	}
	public void emit ( Event e )
	throws IOException
	{
		_send ( e ) ;
	}
	void _send ( Event e )
	throws IOException
	{
		synchronized ( _lock1 )
		{
			String t = e.toJSON() ;
			getWriter() ;
	    _out.write ( t, 0, t.length() ) ;
	    _out.flush() ;
		}
	}
	public void close (  )
	{
if ( true )
{
	return ;
}
		if ( socket != null )
		{
			try
			{
				socket.setSoLinger ( true, 0 ) ;
				if ( _out != null )
				{
		    	_out.flush() ;
		    	_out.close() ;
				}
				if ( _in != null )
				{
		    	_in.close() ;
				}
	    	socket.close() ;
			}
			catch ( Exception exc )
			{
				System.err.println ( Util.toString ( exc ) ) ;
			}
		}
		socket = null ;
		_in    = null ;
		_out   = null ;
	}
  String _LOCK = "LOCK" ;
	public void on ( String eventName, EventListener el )
	throws IOException
	{
		Event e = new Event ( "system", "addEventListener" ) ;
	  if ( user != null )
	  {
	    e.setUser ( user ) ;
	  }
	  e.body.put ( "eventNameList", new String[] { eventName } ) ;
    counter++ ;
    String uid = hostname + "_" + localPort + "-" + counter ;
    e.setUniqueId ( uid ) ;
System.out.println ( e );
    // synchronized ( "_LOCK" )
    {
	    eventListenerFunctions.put ( eventName, el ) ;
    }
    _send ( e ) ;
	}
  class Runner implements Runnable
  {
    Runner ()
    {
    }
    public void run()
    {
      try
      {
		    while ( true )
		    {
			    String t = readNextJSON() ;
			    Event e = Event.fromJSON ( t ) ;
			    // synchronized ( "_LOCK" )
			    {
			    	if ( e.getName().equals ( "system" ) )
			    	{
			    		if ( e.getType().equals ( "shutdown" ) )
			    		{
			    			System.exit ( 0 ) ;
			    		}
			    		continue ;
			    	}
			    	else
			    	{
			    	}
						List<EventListener> list = eventListenerFunctions.get ( e.getName() ) ;
						if ( list != null )
						{
							for ( EventListener l : list )
							{
								l.event ( e ) ;
							}
						}
					}
		    }
      }
      catch ( Exception exc )
      {
        System.out.println ( Util.toString ( exc ) ) ;
      }
    }
  }

	private synchronized String readNextJSON (  )
	throws IOException
	{
    StringBuilder sb = new StringBuilder() ;
    int k = 0 ;
    boolean lastWasBackslash = false ;
    char q = 0 ;
    int pcounter = 0 ;
    while ( ( k = _in.read() ) >= 0 )
    {
    	char c = (char)(k&0xFFFF) ;
	    sb.append ( c ) ;
	    if ( c == '"' || c == '\'' )
	    {
	      q = c ;
		    while ( ( k = _in.read() ) >= 0 )
		    {
		    	c = (char)(k&0xFFFF) ;
	       	sb.append ( c ) ;
	        if ( c == q )
	        {
	          if ( lastWasBackslash )
	          {
	            continue ;
	          }
	          break ;
	        }
	      }
	    }
	    if ( c == '{' )
	    {
	      pcounter++ ;
	      continue ;
	    }
	    if ( c == '}' )
	    {
	      pcounter-- ;
	      if ( pcounter == 0 )
	      {
	      	break ;
	      }
	    }
	  }
    return sb.toString() ;
	}
}