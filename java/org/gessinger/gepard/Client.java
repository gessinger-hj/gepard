package org.gessinger.gepard ;

import java.util.HashMap ;
import java.util.List ;
import java.util.Hashtable ;
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
  HashMap<String,EventCallback> callbacks = new HashMap<String,EventCallback>() ;

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
	public void emit ( String name )
	throws IOException
	{
		emit ( name, null, null ) ;
	}
	public void emit ( String name, String type )
	throws IOException
	{
		emit ( name, type, null ) ;
	}
	public void emit ( String name, String type, EventCallback ecb )
	throws IOException
	{
		emit ( new Event ( name, type ), ecb ) ;
	}
	public void emit ( Event e )
	throws IOException
	{
		emit ( e, null ) ;
	}
	public void emit ( Event e, EventCallback ecb )
	throws IOException
	{
		boolean hasCallbacks = false ;
		if ( ecb instanceof FailureCallback )
		{
			hasCallbacks = true ;
    	e.setFailureInfoRequested() ;
		}
		if ( ecb instanceof ResultCallback )
		{
			hasCallbacks = true ;
    	e.setResultRequested() ;
		}
		if ( ! hasCallbacks && ( ecb instanceof ErrorCallback ) )
		{
			hasCallbacks = true ;
    	e.setResultRequested() ;
		}
		_send ( e ) ;
		if ( hasCallbacks )
		{
			callbacks.put ( e.getUniqueId(), ecb ) ;
		}
	}
	void _send ( Event e )
	throws IOException
	{
		synchronized ( _lock1 )
		{
			getWriter() ;
	    counter++ ;
	    String uid = hostname + "_" + localPort + "-" + counter ;
  	  e.setUniqueId ( uid ) ;
			String t = e.toJSON() ;
	    _out.write ( t, 0, t.length() ) ;
	    _out.flush() ;
		}
	}
	public void close (  )
	{
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
  // if ( typeof eventName === "string"
  //    && (  eventName === "shutdown"
  //       || eventName === "end"
  //       || eventName === "error"
  //       )
  //    )
  // {
  //   EventEmitter.prototype.on.apply ( this, arguments ) ;
  //   return ;
  // }

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
    synchronized ( "_LOCK" )
    {
	    eventListenerFunctions.put ( eventName, el ) ;
    }
    _send ( e ) ;
	}
	Hashtable<String,Event> toBeSentBack = new Hashtable<String,Event>() ;
	public void sendResult ( Event e )
	throws Exception
	{
	  if ( ! e.isResultRequested() || ! toBeSentBack.containsKey ( e.getUniqueId() ) )
  	{
    	throw new Exception ( "No result requested for:\n" + e ) ;
    }
  	e.setIsResult() ;
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
			    synchronized ( "_LOCK" )
			    {
			    	if ( e.getName().equals ( "system" ) )
			    	{
			    		if ( e.getType().equals ( "shutdown" ) )
			    		{
			    			System.exit ( 0 ) ;
			    		}
			    		continue ;
			    	}
			    	if ( e.isBad() )
			    	{
							if ( e.isResult() )
							{
								EventCallback ecb = callbacks.get ( e.getUniqueId() ) ;
								if ( ecb == null )
								{
									System.err.println ( "No callback found for:\n" + e ) ;
									continue ;
								}
								callbacks.remove ( e.getUniqueId() ) ;
								if ( e.isFailureInfoRequested() && ( ecb instanceof FailureCallback ) )
								{
									((FailureCallback)ecb).failure ( e ) ;
								}
								else
								if ( ecb instanceof ErrorCallback )
								{
									((ErrorCallback)ecb).error ( e ) ;
								}
								else
								if ( ecb instanceof ResultCallback )
								{
									((ResultCallback)ecb).result ( e ) ;
								}
							}
							continue ;
			    	}
						if ( e.isResult() )
						{
							EventCallback ecb = callbacks.get ( e.getUniqueId() ) ;
							if ( ecb == null )
							{
								System.err.println ( "No callback found for:\n" + ecb ) ;
								continue ;
							}
							if ( ecb instanceof ResultCallback )
							{
								((ResultCallback)ecb).result ( e ) ;
							}
							continue ;
						}
						List<EventListener> list = eventListenerFunctions.get ( e.getName() ) ;
						if ( list != null )
						{
							for ( EventListener l : list )
							{
								if ( e.isResultRequested() )
								{
									toBeSentBack.put ( e.getUniqueId(), e ) ;
									l.event ( e ) ;
									break ;
								}
								else
								{
									l.event ( e ) ;
								}
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