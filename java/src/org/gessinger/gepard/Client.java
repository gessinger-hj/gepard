package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.net.* ;
import java.util.logging.* ;
import com.google.gson.* ;

import java.lang.management.* ;
import javax.management.* ;

public class Client
{
  public static class LogLevel
  {
		static public int LOG       = 0x00001000 ;
		static public int EMERGENCY = 0x00000100 ;
		static public int ALERT     = 0x00000080 ;
		static public int CRITICAL  = 0x00000040 ;
		static public int ERROR     = 0x00000020 ;
		static public int WARNING   = 0x00000010 ;
		static public int NOTICE    = 0x00000008 ;
		static public int INFO      = 0x00000004 ;
		static public int DEBUG     = 0x00000002 ;
		static public int OFF       = 0x00000000 ;
  }
	private static Logger LOGGER = Logger.getLogger ( "org.gessinger.gepard" ) ;
	static int counter             = 0 ;
	int port                       = -1 ;
	String host                    = "localhost" ;
	Socket socket                  = null ;
	User user                      = null ;
	InputStreamReader  _in         = null ;
	OutputStreamWriter _out        = null ;
	String _lock1                  = "_lock1" ;
	String hostname                = "" ;
	int localPort                  = 0 ;
	boolean closing                = false ;
	boolean _first                 = false ;
	boolean targetIsLocalHost      = false ;
	static boolean _workerIsDaemon = false ;
	int numberOfCallbackWorker     = 3 ;
	boolean callbackWorkerCreated  = false ;

  MultiMap<String,EventListener> eventListenerFunctions = new MultiMap<String,EventListener>() ;
  Hashtable<String,EventCallback> callbacks = new Hashtable<String,EventCallback>() ;

	HashMap<String,Semaphore> _semaphores = new HashMap<String,Semaphore>() ;
	NamedQueue<Event> _NQ_semaphoreEvents = new NamedQueue<Event>() ;
	HashMap<String,Lock> _ownedResources  = new HashMap<String,Lock>() ;
	NamedQueue<Event> _NQ_lockEvents      = new NamedQueue<Event>() ;
  
  SyncedQueue<Event> _CallbackIsolator = new SyncedQueue<Event>() ;

  String USERNAME = System.getProperty ( "user.name" ) ;
	long _heartbeatIntervalMillis = 10000L ;
  long _reconnectIntervalMillis = 5000L ;
  boolean _reconnect            = Util.getBool ( "gepard.reconnect", false ) ;
  static Hashtable<String,Client> _Instances = new Hashtable<String,Client>() ;

  MutableTimer _Timer = new MutableTimer ( true ) ;
  int version = 1 ;
  int brokerVersion = 0 ;

  class LFormatter extends SimpleFormatter
  {
  	public String format ( LogRecord rec )
  	{
  		// String s = super.format ( rec ) ;
  		StringBuilder sb = new StringBuilder() ;
  		sb.append ( "[" ) ;
  		sb.append ( Util.getISODateTime ( new Date ( rec.getMillis() ) ) ) ;
  		sb.append ( "] " ) ;
  		sb.append ( rec.getMessage() ) ;
  		return sb.toString() ;
  	}
  }
  static public Client getInstance()
  {
  	return getInstance ( -1, null ) ;
  }
  static public Client getInstance ( int port )
  {
  	return getInstance ( port, null ) ;
  }
  static public Client getInstance ( int port, String host )
  {
  	Client c = _Instances.get ( "" + host + ":" + port ) ;
  	if ( c != null )
  	{
  		c._first = false ;
  		return c ;
  	}
  	c = new Client ( port, host ) ;
  	c._first = true ;
  	return c ;
  }
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
		Handler h = new ConsoleHandler() ;
		h.setFormatter ( new LFormatter() ) ;
		Handler[] handlers = LOGGER.getHandlers() ;
		if ( handlers.length > 0 )
		{
			LOGGER.removeHandler ( handlers[0] ) ;
		}
		LOGGER.setUseParentHandlers ( false ) ;
		LOGGER.addHandler ( h ) ;

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
			LOGGER.info ( Util.toString ( exc ) ) ;
		}
		if ( USERNAME == null )
		{
			USERNAME = "guest" ;
		}
		user = new User ( USERNAME ) ;
		_Timer.add ( _reconnectIntervalMillis, new Runnable()
		{
			public void run()
			{
				if ( _reconnect )
				{
					_checkReconnect() ;
				}
			}
		} ) ;
	}
	public String getUSERNAME()
	{
		return USERNAME ;
	}
	public void setUser ( User user )
	{
  	this.user = user ;
	}
	public void setReconnect ( boolean state )
	{
		_reconnect = state ;
	}
	public boolean isReconnect()
	{
		return _reconnect ;
	}
	public void setNumberOfCallbackWorker ( int n )
	{
		if ( n > 0 && n < 10 )
		{
			numberOfCallbackWorker = n ;
		}
	}
	static public void setDaemon()
	{
		setDaemon ( true ) ;
	}
	static public void setDaemon ( boolean state )
	{
		_workerIsDaemon = state ;
	}
	String createUniqueId()
	{
    counter++ ;
		return hostname + "_" + localPort + "-" + counter + "_" + new Date().getTime() ;
	}
	OutputStreamWriter getWriter()
	throws UnsupportedEncodingException
			 , IOException
			 , ConnectException
	{
		return getWriter ( false ) ;
	}
	OutputStreamWriter getWriter ( boolean testForReconnect )
	throws UnsupportedEncodingException
			 , IOException
			 , ConnectException
	{
		if ( _out != null ) return _out ;
		try
		{
	    socket = new Socket ( host, port ) ;
	    if ( version > 0 )
	    {
	      socket.setSoTimeout ( 3 * (int)(_heartbeatIntervalMillis) ) ;
	    }

	    OutputStream out = socket.getOutputStream() ;
	    _out = new OutputStreamWriter ( out, "utf-8" ) ;
	    InputStream in = socket.getInputStream() ;
	    _in = new InputStreamReader ( in, "utf-8" ) ;

	    localPort = socket.getLocalPort() ;
	    InetAddress ia = socket.getInetAddress() ;
	    if (  ia.isAnyLocalAddress()
	    	 || ia.isLoopbackAddress()
	    	 || NetworkInterface.getByInetAddress(ia) != null
	    	 )
	    {
	    	targetIsLocalHost = true ;
	    }
	    Event e = new Event ( "system", "client_info" ) ;
	    Map<String,Object> body = e.getBody() ;

	    body.put ( "language", "Java" ) ;
	    body.put ( "hostname", hostname ) ;
	    body.put ( "connectionTime", Util.getISODateTime() ) ;
	    body.put ( "application", Util.getMainClassName() ) ;
	    body.put ( "USERNAME", USERNAME ) ;
	    body.put ( "version", new Integer ( version ) ) ;

	    e.setTargetIsLocalHost ( targetIsLocalHost ) ;
			String t = e.toJSON() ;
	    _out.write ( t, 0, t.length() ) ;
	    _out.flush() ;

	    if ( ! callbackWorkerCreated )
	    {
		    for ( int i = 0 ; i < numberOfCallbackWorker ; i++ )
		    {
			    CallbackWorker cr = new CallbackWorker() ;
			    cr.counter = i ;
			    Thread thcr = new Thread ( cr ) ;
			    thcr.setDaemon ( true ) ;
			    thcr.start() ;
		    }
		    callbackWorkerCreated = true ;
	    }
	    
	    Runner r = new Runner ( _in ) ;
	    Thread thr = new Thread ( r ) ;
	    thr.setDaemon ( _workerIsDaemon ) ;
	    thr.start() ;
	    try
	    {
		    synchronized ( r )
		    {
		    	r.wait ( 10000 ) ;
		    }
	    }
	    catch ( Exception exc )
	    {
	    	LOGGER.info ( Util.toString ( exc ) ) ;
	    }
	  	_Instances.put ( "" + this.host + ":" + this.port, this ) ;
		}
		catch ( UnsupportedEncodingException exc )
		{
	  	_emit ( "error", exc.getMessage() ) ;
	  	LOGGER.info ( "host=" + host + "\n" ) ;
	  	LOGGER.info ( "port=" + port + "\n" ) ;
			throw exc ;
		}
		catch ( IOException exc )
		{
			if ( ! testForReconnect )
			{
		  	_emit ( "error", exc.getMessage() ) ;
		  	LOGGER.info ( "host=" + host + "\n" ) ;
	  		LOGGER.info ( "port=" + port + "\n" ) ;
			}
			throw exc ;
		}
		return _out ;
	}
	public void startReconnections()
	throws Exception
	{
		if ( socket != null )
		{
			try
			{
				closing = true ;
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
				LOGGER.info ( Util.toString ( exc ) ) ;
			}
		}
		callbacks.clear() ;
		_ownedResources.clear() ;
		_semaphores.clear() ;
		_NQ_semaphoreEvents.awakeAll() ;
		_NQ_lockEvents.awakeAll() ;
  	_Instances.remove ( "" + this.host + ":" + this.port ) ;
		socket = null ;
		_in    = null ;
		_out   = null ;
  	_Timer.start() ;
	}
	public void close (  )
	{
		if ( socket != null )
		{
			try
			{
				closing = true ;
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
				LOGGER.info ( Util.toString ( exc ) ) ;
			}
		}
		socket = null ;
		_in    = null ;
		_out   = null ;

		infoCallbacks.clear() ;
		callbacks.clear() ;
		_ownedResources.clear() ;
		_semaphores.clear() ;
		_NQ_semaphoreEvents.awakeAll() ;
		_NQ_lockEvents.awakeAll() ;
		eventListenerFunctions.clear() ;
  	_Instances.remove ( "" + this.host + ":" + this.port ) ;
		_CallbackIsolator.awakeAll() ;
  	_emit ( "close", null ) ;
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
	public void emit ( String name, EventCallback ecb )
	throws IOException
	{
		emit ( new Event ( name, null ), ecb ) ;
	}
	public void request ( String name, ResultCallback ecb )
	throws IOException
	{
		emit ( new Event ( name, null ), ecb ) ;
	}
	public void emit ( String name, String type, EventCallback ecb )
	throws IOException
	{
		emit ( new Event ( name, type ), ecb ) ;
	}
	public void result ( String name, String type, ResultCallback ecb )
	throws IOException
	{
		emit ( new Event ( name, type ), ecb ) ;
	}
	public void emit ( Event e )
	throws IOException
	{
		emit ( e, null ) ;
	}
	public void request ( Event e, ResultCallback ecb )
	throws IOException
	{
		emit ( e, ecb ) ;
	}
	public void emit ( Event e, EventCallback ecb )
	throws IOException
	{
		e.setInUse() ;
		boolean hasCallbacks = false ;
		if ( ecb instanceof StatusCallback )
		{
			hasCallbacks = true ;
    	e.setStatusInfoRequested() ;
		}
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
	public void log ( String messageText )
	throws IOException
	{
		Event e = new Event ( "system", "log" ) ;
		Map<String,Object> message = new HashMap<String,Object>() ;
		message.put ( "text", messageText ) ;
		message.put ( "severity", "INFO" ) ;
		message.put ( "date", new Date() ) ;
		e.putValue ( "message", message ) ;
		_send ( e ) ;
	}
	void _send ( Event e )
	throws IOException
	{
		try
		{
			synchronized ( _lock1 )
			{
				if ( e.getUser() == null )
				{
					e.setUser ( user ) ;
				}
				getWriter() ;
	  	  e.setUniqueId ( createUniqueId() ) ;
		    e.setTargetIsLocalHost ( targetIsLocalHost ) ;
				String t = e.toJSON() ;
		    _out.write ( t, 0, t.length() ) ;
		    _out.flush() ;
			}
		}
		catch ( IOException exc )
		{
	  	_emit ( "error", null ) ;
			throw exc ;
		}
	}
  String _LOCK = "LOCK" ;
  MultiMap<String,InfoCallback> infoCallbacks = new MultiMap<String,InfoCallback>() ;
  public void onShutdown ( InfoCallback icb )
  {
  	infoCallbacks.put ( "shutdown", icb ) ;
  }
  public void onClose ( InfoCallback icb )
  {
  	infoCallbacks.put ( "close", icb ) ;
  }
  public void onError ( InfoCallback icb )
  {
  	infoCallbacks.put ( "error", icb ) ;
  }
  public void onReconnect ( InfoCallback icb )
  {
  	infoCallbacks.put ( "reconnect", icb ) ;
  }
  public void onDisconnect ( InfoCallback icb )
  {
  	infoCallbacks.put ( "disconnect", icb ) ;
  }
  void _emit ( String eventName, String reason )
  {
  	if ( ! infoCallbacks.containsKey ( eventName ) ) return ;
  	List<InfoCallback> list = infoCallbacks.get ( eventName ) ;
  	for ( InfoCallback icb : list )
  	{
  		try
  		{
  			Event e = new Event ( eventName, reason ) ;
  			icb.info ( this, e ) ;
  		}
  		catch ( Exception exc )
  		{
  			LOGGER.info ( Util.toString ( exc ) ) ;
  		}
  	}
  }
	public void on ( String eventName, EventListener el )
	throws IOException
	{
		on ( new String[] { eventName }, el ) ;
	}
	public void on ( String[] eventNameList, EventListener el )
	throws IOException
	{
		Event e = new Event ( "system", "addEventListener" ) ;
	  e.body.put ( "eventNameList", eventNameList ) ;
    e.setUniqueId ( createUniqueId() ) ;
    synchronized ( _LOCK )
    {
    	for ( String name : eventNameList )
    	{
    		if ( "system".equals ( name ) )
    		{
    			throw new IOException ( "Client.on(): eventName must not be 'system'" ) ;
    		}
		    eventListenerFunctions.put ( name, el ) ;
    	}
    }
    _send ( e ) ;
	}

	public void remove ( String name )
	throws IOException
	{
		removeEventListener ( new String[] { name } ) ;
	}
	public void remove ( String[] nameList )
	throws IOException
	{
		removeEventListener ( nameList ) ;
	}
	public void removeEventListener ( String name )
	throws IOException
	{
		removeEventListener ( new String[] { name } ) ;
	}
	public void removeEventListener ( String[] nameList )
	throws IOException
	{
		for ( String name : nameList )
		{
			eventListenerFunctions.remove ( name ) ;
		}
    Event e = new Event ( "system", "removeEventListener" ) ;
	  e.body.put ( "eventNameList", nameList ) ;
    e.setUniqueId ( createUniqueId() ) ;
    _send ( e ) ;
	}
	public void remove ( EventListener el )
	throws IOException
	{
		removeEventListener ( new EventListener[] { el } ) ;
	}
	public void remove ( EventListener[] elList )
	throws IOException
	{
		removeEventListener ( elList ) ;
	}
	public void removeEventListener ( EventListener el )
	throws IOException
	{
		removeEventListener ( new EventListener[] { el } ) ;
	}
	public void removeEventListener ( EventListener[] elList )
	throws IOException
	{
		ArrayList<String> nameList = new ArrayList<String>() ; 
		for ( EventListener el : elList )
		{
      List<String> keys = eventListenerFunctions.getKeysOf ( el ) ;
      for ( String name : keys )
      {
      	nameList.add ( name ) ;
      }
      eventListenerFunctions.removeValue ( el ) ;
		}
		String[] nameArray = nameList.toArray(new String[0]);
    Event e = new Event ( "system", "removeEventListener" ) ;
	  e.body.put ( "eventNameList", nameArray ) ;
    e.setUniqueId ( createUniqueId() ) ;
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
		e._Client = null ;
  	e.setIsResult() ;
    _send ( e ) ;
  }
  class CallbackWorker implements Runnable
  {
  	int counter = 0 ;
  	public void run()
  	{
  		while ( true )
  		{
	  		Event e = null ;
  			try
  			{
		  		e = _CallbackIsolator.get() ;
		  		if ( e == null )
		  		{
		  			break ;
		  		}
  			}
  			catch ( Exception exc )
  			{
  				LOGGER.info ( Util.toString ( exc ) ) ;
  				break ;
  			}
  			try
  			{
		    	if ( e.isStatusInfo() )
		    	{
						EventCallback ecb = callbacks.get ( e.getUniqueId() ) ;
						if ( ecb == null )
						{
							LOGGER.info ( "No callback found for:\n" + e ) ;
							continue ;
						}
						callbacks.remove ( e.getUniqueId() ) ;
						if ( ecb instanceof StatusCallback )
						{
							((StatusCallback)ecb).status ( e ) ;
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
								LOGGER.info ( "No callback found for:\n" + e ) ;
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
							LOGGER.info ( "No callback found for:\n" + ecb ) ;
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
						List<EventListener> clonedList = new ArrayList(list) ;
						try
						{
							for ( EventListener l : clonedList )
							{
								if ( e.isResultRequested() )
								{
									toBeSentBack.put ( e.getUniqueId(), e ) ;
									e._Client = Client.this ;
									l.event ( e ) ;
									break ;
								}
								else
								{
									l.event ( e ) ;
								}
							}
						}
						finally
						{
							clonedList.clear() ;
						}
					}
  			}
  			catch ( Exception exc )
  			{
  				LOGGER.info ( Util.toString ( exc ) ) ;
  			}
  		}
  	}
  }
  class Runner implements Runnable
  {
  	InputStreamReader in = null ;
    Runner ( InputStreamReader in )
    {
    	this.in = in ;
    }
    public void run()
    {
      try
      {
 		    synchronized ( this )
		    {
		    	this.notify() ;
		    }

		    while ( true )
		    {
		    	String t = null ;
	        try
	        {
				    t = readNextJSON ( in ) ;
	        }
	        catch ( IOException exc )
	        {
	        	LOGGER.info ( Util.toString ( exc ) + "\n" ) ;
		        _emit ( "disconnect", exc.toString() ) ;
						if ( _reconnect )
						{
					    LOGGER.info ( "missing ping request --> try reconnect.\n" ) ;
		        	startReconnections() ;
						}
	          break ;
	        }
			    if ( t == null )
			    {
  					_emit ( "close", null ) ;
			    	break ;
			    }
			    Event e = Event.fromJSON ( t ) ;

			    synchronized ( _LOCK )
			    {
			    	if ( e.getName().equals ( "system" ) )
			    	{
			    		if ( e.getType().equals ( "shutdown" ) )
			    		{
	  						_emit ( "shutdown", null ) ;
	  						if ( ! _reconnect )
	  						{
		  						break ;
	  						}
	  						continue ;
			    		}
		          if ( e.getType().indexOf ( "client/" ) == 0 )
		          {
		            _handleSystemClientMessages ( e ) ;
		            continue ;
		          }
			    		if ( e.getType().equals ( "PING" ) )
			    		{
			    			e.setType ( "PONG" ) ;
	  						_send ( e ) ;
	  						continue ;
			    		}
 		          if ( e.getType().equals ( "broker_info" ) )
		          {
		          	Map<String,Object> body = e.getBody() ;
						    try
						    {
						      Double vers = (Double) body.get ( "brokerVersion" ) ;
						      if ( vers != null )
						      {
							      brokerVersion = vers.intValue() ;
						      }
						      Double heartbeatIntervalMillis = (Double) body.get ( "_heartbeatIntervalMillis" ) ;
						      if ( heartbeatIntervalMillis != null )
						      {
							      _heartbeatIntervalMillis = heartbeatIntervalMillis.longValue() ;
							      socket.setSoTimeout ( 3 * (int)_heartbeatIntervalMillis ) ;
						      }
						    }
						    catch ( Exception exc )
						    {
									LOGGER.info ( Util.toString ( exc ) ) ;
						    }
    		        continue ;
    		      }
		          if ( e.getType().equals ( "acquireSemaphoreResult" ) )
		          {
		          	Map<String,Object> body = e.getBody() ;
								String resourceId = (String) body.get ( "resourceId" ) ;
								Semaphore sem = _semaphores.get ( resourceId ) ;
								if ( sem.hasCallback() )
								{
									sem._isSemaphoreOwner = true ;
									sem.scb.acquired ( e ) ;
								}
								else
								{
									synchronized ( _NQ_semaphoreEvents )
									{
										if ( _NQ_semaphoreEvents.isWaiting ( sem.resourceId ) )
										{
											_NQ_semaphoreEvents._returnObj ( resourceId, e ) ;
										}
										else
										{
											sem.release() ;
										}
									}
								}
		            continue ;
		          }
		          if ( e.getType().equals ( "releaseSemaphoreResult" ) )
		          {
		            continue ;
		          }
		          if ( e.getType().equals ( "lockResourceResult" ) )
		          {
		          	Map<String,Object> body = e.getBody() ;
								String resourceId = (String) body.get ( "resourceId" ) ;
						  	synchronized ( _NQ_lockEvents )
						  	{
									_NQ_lockEvents._returnObj ( resourceId, e ) ;
								}
		            continue ;
		          }
		          if ( e.getType().equals ( "unlockResourceResult" ) )
		          {
		            continue ;
		          }
			    		continue ;
			    	}
			    	_CallbackIsolator.put ( e ) ;
					}
		    }
      }
      catch ( Exception exc )
      {
        LOGGER.info ( Util.toString ( exc ) ) ;
      }
    }
  }

	private synchronized String readNextJSON ( InputStreamReader in )
	throws Exception
	{
	  StringBuilder sb = new StringBuilder() ;
		try
		{
	    int k = 0 ;
	    char q = 0 ;
	    int pcounter = 0 ;
	    if ( version > 0 )
	    {
	      socket.setSoTimeout ( 3 * (int)(_heartbeatIntervalMillis) ) ;
	    }
	    while ( true )
	    {
	    	k = in.read() ;
	    	if ( k < 0 )
	    	{
	    		if ( _reconnect )
	    		{
	    			throw new IOException ( "Error reading from socket. k=" + k ) ;
	    		}
	    		break ;
	    	}
	    	char c = (char)(k&0xFFFF) ;
		    sb.append ( c ) ;
		    if ( c == '"' || c == '\'' )
		    {
	    		boolean lastWasBackslash = false ;
		      q = c ;
			    while ( ( k = in.read() ) >= 0 )
			    {
			    	c = (char)(k&0xFFFF) ;
		       	sb.append ( c ) ;
		        if ( c == q )
		        {
		          if ( lastWasBackslash )
		          {
		          	lastWasBackslash = false ;
		            continue ;
		          }
		          break ;
		        }
		        lastWasBackslash = c == '\\' ;
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
		}
		catch ( Exception exc )
		{
			if ( closing ) return null ;
			throw exc ;
		}
		if ( sb.length() == 0 )
		{
			return null ;
		}
    return sb.toString() ;
	}
	class TT extends TimerTask
	{
		Semaphore sem = null ;
		TT ( Semaphore sem )
		{
			this.sem = sem ;
		}
	  @Override
	  public void run()
	  {
			synchronized ( _NQ_semaphoreEvents )
			{
				if ( _NQ_semaphoreEvents.isWaiting ( sem.resourceId ) )
				{
					try
					{
						sem.release() ;
					}
					catch ( Exception exc )
					{
						LOGGER.info ( Util.toString ( exc ) ) ; ;
					}
					_semaphores.remove ( sem.resourceId ) ;
					Event e = new Event ( "system", "acquireSemaphoreResult" ) ;
					Map<String,Object> body = e.getBody() ;
					body.put ( "resourceId", sem.resourceId ) ;
					body.put ( "isSemaphoreOwner", false ) ;
					sem.timeoutMillis = 0 ;
					_NQ_semaphoreEvents._returnObj ( sem.resourceId, e ) ;
				}
	  	}
	  }
	}
	void acquireSemaphore ( Semaphore sem )
	throws IOException
	{
		if ( _semaphores.containsKey ( sem.resourceId ) )
		{
			Semaphore s = _semaphores.get ( sem.resourceId ) ;
			if ( s.isOwner() )
			{
		    LOGGER.info ( "Client.acquireSemaphore: already owner of resourceId=" + sem.resourceId + "\n" ) ;
			}
			else
			{
		    LOGGER.info ( "Client.acquireSemaphore: already waiting for ownership owner of resourceId=" + sem.resourceId + "\n" ) ;
			}
    	return ;
		}
		_semaphores.put ( sem.resourceId, sem ) ;
		Event e = new Event ( "system", "acquireSemaphoreRequest" ) ;
		Map<String,Object> body = e.getBody() ;
  	body.put ( "resourceId", sem.resourceId ) ;
  	_send ( e ) ;
  	if ( ! sem.hasCallback() )
  	{
  		if ( sem.timeoutMillis > 10 )
  		{
  			sem._Timer = new Timer() ;
				sem._Timer.schedule ( new TT ( sem ), sem.timeoutMillis ) ;
  		}
			e = _NQ_semaphoreEvents.get ( sem.resourceId ) ;
			if ( sem._Timer != null )
			{
				sem._Timer.cancel() ;
				sem._Timer.purge() ;
				sem._Timer = null ;
			}
	   	body = e.getBody() ;
			String resourceId = (String) body.get ( "resourceId" ) ;
			sem._isSemaphoreOwner = (Boolean) body.get ( "isSemaphoreOwner" ) ;
  	}
	}
	void releaseSemaphore ( Semaphore sem )
	throws IOException
	{
		if ( ! _semaphores.containsKey ( sem.resourceId ) )
		{
	    LOGGER.info ( "release semaphore: not owner of resourceId=" + sem.resourceId + "\n" ) ;
    	return ;
		}
		Event e = new Event ( "system", "releaseSemaphoreRequest" ) ;
		Map<String,Object> body = e.getBody() ;
  	body.put ( "resourceId", sem.resourceId ) ;
		_semaphores.remove ( sem.resourceId ) ;
  	_send ( e ) ;
	}
	void acquireLock ( Lock lock )
	throws IOException
	{
		if ( _ownedResources.containsKey ( lock.resourceId ) ) // TODO: clear with reconnect
		{
	    LOGGER.info ( "acquire lock: already owner of resourceId=" + lock.resourceId + "\n" ) ;
    	return ;
		}
		_ownedResources.put ( lock.resourceId, lock ) ;
		Event e = new Event ( "system", "lockResourceRequest" ) ;
		Map<String,Object> body = e.getBody() ;
  	body.put ( "resourceId", lock.resourceId ) ;
  	_send ( e ) ;
		e = _NQ_lockEvents.get ( lock.resourceId ) ;
   	body = e.getBody() ;
		String resourceId = (String) body.get ( "resourceId" ) ;
		lock = _ownedResources.get ( resourceId ) ;
		lock._isLockOwner = (Boolean) body.get ( "isLockOwner" ) ;
	}
	void releaseLock ( Lock lock )
	throws IOException
	{
		if ( ! _ownedResources.containsKey ( lock.resourceId ) )
		{
	    LOGGER.info ( "release lock: not owner of resourceId=" + lock.resourceId + "\n" ) ;
    	return ;
		}
		_ownedResources.remove ( lock.resourceId ) ;
		Event e = new Event ( "system", "unlockResourceRequest" ) ;
		Map<String,Object> body = e.getBody() ;
  	body.put ( "resourceId", lock.resourceId ) ;
  	_send ( e ) ;
	}
	private void _checkReconnect()
	{
		try
		{
			closing = false ;
			getWriter ( true ) ;
			Set<String> keySet = eventListenerFunctions.keySet() ;
			ArrayList<String> list = new ArrayList<String>() ;
			for ( String key : keySet )
			{
				list.add ( key ) ;
			}
			String[] eventNameList = list.toArray ( new String[0] ) ;

			_Timer.stop() ;
			Event e = new Event ( "system", "addEventListener" ) ;
		  e.body.put ( "eventNameList", eventNameList ) ;
	    e.setUniqueId ( createUniqueId() ) ;
      LOGGER.info ( "re-connect in progress with events: " + list.toString() + "\n" ) ;
      _emit ( "reconnect", list.toString() ) ;
	    _send ( e ) ;
		}
		catch ( ConnectException cexc )
		{
		}
		catch ( IOException ioexc )
		{
			LOGGER.info ( Util.toString ( ioexc ) ) ;
		}
		catch ( Exception exc )
		{
			LOGGER.info ( Util.toString ( exc ) ) ;
		}
	}
	private void _handleSystemClientMessages ( Event e )
	{
	  try
	  {
	    Map<String,Object> info = new HashMap<String,Object>() ;
	    e.putValue ( "info", info ) ;

	    if ( e.getType().indexOf ( "/info/" ) > 0 )
	    {
		    if ( e.getType().indexOf ( "/info/where/" ) > 0 )
		    {
			    List<HashMap<String,Object>> where = getStackTraces() ;
			    info.put ( "where", where ) ;
		    }
		    else
		    if ( e.getType().indexOf ( "/info/env/" ) > 0 )
		    {
			    Map<String,Object> env = new HashMap<String,Object>() ;
			    info.put ( "env", env ) ;
		    	Map<String,String> p = System.getenv() ;
			    for ( String k : p.keySet() )
			    {
			    	env.put ( k, p.get ( k ) ) ;
			    }
		    }
		    else
		    {
		      MBeanServer mbs = ManagementFactory.getPlatformMBeanServer() ;
		      ObjectName on = new ObjectName ( "java.lang:type=OperatingSystem" ) ;
			    Map<String,Object> process = new HashMap<String,Object>() ;
			    info.put ( "process", process ) ;
			    Map<String,Object> os = new HashMap<String,Object>() ;
			    info.put ( "os", os ) ;
		
		      Runtime r = Runtime.getRuntime() ;
		      long totalMemory = r.totalMemory() ;
		      long maxMemory = r.maxMemory() ;
		      long freeMemory = r.freeMemory() ;

		      long committedMemory = r.totalMemory() ;
		      long usedMemory = r.totalMemory() - r.freeMemory() ;
	        process.put ( "usedMemory", new Long ( usedMemory ) ) ;
	        process.put ( "committedMemory", new Long ( committedMemory ) ) ;
	        process.put ( "maxMemory", new Long ( maxMemory ) ) ;

	        os.put ( "name", mbs.getAttribute ( on, "Name" ) + " " + mbs.getAttribute ( on, "Version" ) ) ;
	        os.put ( "arch", "" + mbs.getAttribute ( on, "Arch" ) ) ;
	        os.put ( "cpus", "" + mbs.getAttribute ( on, "AvailableProcessors" ) ) ;
	        os.put ( "committed_virtual_memory", "" + mbs.getAttribute ( on, "CommittedVirtualMemorySize" ) ) ;
	        os.put ( "totalmem", "" + mbs.getAttribute ( on, "TotalPhysicalMemorySize" ) ) ;
	        os.put ( "freemem", "" + mbs.getAttribute ( on, "FreePhysicalMemorySize" ) ) ;
	        os.put ( "totalswap", "" + mbs.getAttribute ( on, "TotalSwapSpaceSize" ) ) ;
	        os.put ( "freeswap", "" + mbs.getAttribute ( on, "FreeSwapSpaceSize" ) ) ;
	        os.put ( "loadavg", "" + mbs.getAttribute ( on, "SystemLoadAverage" ) ) ;
		    }
		  }
		  e.setStatus ( 0, "success", "ack" ) ;
	    e.setIsResult() ;
	    _send ( e ) ;
	  }
	  catch ( Exception exc )
	  {
	    LOGGER.info ( Util.toString ( exc ) ) ;
	    try
	    {
			  e.setStatus ( 1, "error", "reject" ) ;
		    e.setIsResult() ;
		    _send ( e ) ;
	    }
	    catch ( Exception exc2 )
	    {
	    	LOGGER.info ( Util.toString ( exc2 ) ) ;
	    }
	  }
	}
  private List<HashMap<String,Object>> getStackTraces()
  {
  	List<HashMap<String,Object>> list = new ArrayList<HashMap<String,Object>>() ;
    Map<Thread,StackTraceElement[]> stackTraceMap = Thread.getAllStackTraces() ;
    for ( Thread t : stackTraceMap.keySet() )
    {
      ThreadGroup tg = t.getThreadGroup() ;
      if ( tg.getName().equals ( "system" ) )
      {
      	continue ;
      }
      HashMap<String,Object> hm = new HashMap<String,Object>() ;
      list.add ( hm ) ;
      ArrayList<String> l = new ArrayList<String>() ;
      hm.put ( "name", t.toString() ) ;
      hm.put ( "stacktrace", l ) ;
      StackTraceElement[] stackTrace = stackTraceMap.get(t);
      for ( StackTraceElement element : stackTrace )
      {
	    	l.add ( element.toString() ) ;
      }
    }
    return list ;
  }
}
