package org.gessinger.gepard ;

import java.util.* ;
import java.util.regex.* ;
import java.io.* ;
import java.net.* ;
import java.util.logging.* ;
import com.google.gson.* ;

import java.lang.management.* ;
import javax.management.* ;

public class Client
{
	static TracePointStore TPStore = null ;
	static
	{
		TPStore = TracePointStore.getStore ( "client" ) ;
		TPStore.add ( "EVENT_IN" ).setTitle ( "--------------------------- EVENT_IN ---------------------------" ) ;
		TPStore.add ( "EVENT_OUT" ).setTitle ( "--------------------------- EVENT_OUT --------------------------" ) ;
	}
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
  class RemoteTracer implements Tracer 
  {
  	Client client ;
  	RemoteTracer ( Client client )
  	{
  		this.client = client ;
  	}
    public void log ( Object o )
    {
    	try
    	{
    		client.log ( Util.toString ( o ) ) ;
    	}
    	catch ( Exception exc )
    	{
    		LOGGER.info ( Util.toString ( o ) ) ;
    	}
    }
  }
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

	class PatternContext
	{
		String originalEventName ;
		Pattern p ;
		Matcher m ;
		EventListener el ;
		PatternContext ( String eventName, EventListener el )
		{
			this.originalEventName = eventName ;
	    if ( eventName.charAt ( 0 ) == '/' && eventName.charAt ( eventName.length() - 1 ) == '/' )
	    {
	      p = Pattern.compile ( eventName.substring ( 1, eventName.length() - 1 ) ) ;
	    }
	    else
	    if ( eventName.indexOf ( ".*" ) >= 0 )
	    {
	      p = Pattern.compile ( eventName ) ;
	    }
	    else
	    if ( eventName.indexOf ( "*" ) >= 0 || eventName.indexOf ( "?" ) >= 0 )
	    {
	      p = Pattern.compile ( eventName.replaceAll ( "\\.", "\\." ).replaceAll ( "\\*", ".*" ).replaceAll ( "?", "." ) ) ;
	    }
			m = p.matcher ( "aaa" ) ;
			this.el = el ;
		}
		boolean matches ( String t )
		{
			m.reset ( t ) ;
			return m.matches() ;
		}
	}

	MultiMap<String,EventListener> eventNameToListener = new MultiMap<String,EventListener>() ;
	Hashtable<String,EventCallback> callbacks             = new Hashtable<String,EventCallback>() ;
	MultiMap<String,ActionCmdCtx> nameToActionCallback    = new MultiMap<String,ActionCmdCtx>() ;

	ArrayList<PatternContext> patternContextList = new ArrayList<PatternContext>() ;

	public void onAction ( String cmd, ActionCmdCallback cb )
	{
		onAction ( cmd, null, cb ) ;
	} ;
	public void onAction ( String cmd, String desc, ActionCmdCallback cb )
	{
		nameToActionCallback.put ( cmd, new ActionCmdCtx ( cmd, desc, cb ) ) ;
	} ;
	class ActionCmdCtx
	{
		String cmd ;
		String desc ;
		ActionCmdCallback cb ;
		ActionCmdCtx ( String cmd, String desc, ActionCmdCallback cb )
		{
			this.cmd = cmd ;
			this.desc = desc != null ? desc : cmd ;
			this.cb = cb ;
		}
	}
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

	MutableTimer _Timer = new MutableTimer ( false ) ;
	int version                  = 1 ;
	int brokerVersion            = 0 ;
	Map<String,Boolean> channels = null ;
	String mainChannel           = null ;
	String sid                   = null ;
  Stats _stats                 = new Stats() ;
	public void setChannel ( String channel )
	{
	  if ( channel == null ) return ;
	  if ( channel.indexOf ( ',' ) < 0 )
	  {
	    if ( channel.charAt ( 0 ) == '*' ) channel = channel.substring ( 1 ) ;
	    mainChannel       = channel ;
	    channels          = new HashMap<String,Boolean>() ;
	    channels.put ( channel, true ) ;
	    return ;
	  }
	  String[] l = channel.split ( "," ) ;
	  for ( int i = 0 ; i < l.length ; i++ )
	  {
	    l[i] = l[i].trim() ;
	    if ( l[i].length() == 0 ) continue ;
	    if ( i == 0 ) this.mainChannel = l[i] ;
	    if ( l[i].charAt ( 0 ) == '*' )
	    {
	      l[i] = l[i].substring ( 1 ) ;
	      if ( l[i].length() == 0 ) continue ;
	      this.mainChannel = l[i] ;
	    }
	    if ( this.channels == null ) this.channels = new HashMap<String,Boolean>() ;
	    this.channels.put ( l[i], true ) ;
	  }
	}
	public Map<String,Boolean> getChannel()
	{
		return channels ;
	}
	public String getSid()
	{
		return sid ;		
	}
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
		_initialize ( port, host ) ;
	}
	private void _initialize ( int port, String host )
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
		setChannel ( Util.getProperty ( "gepard.channel" ) ) ;
		TPStore.remoteTracer = new RemoteTracer ( this ) ;
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
	    body.put ( "channels", channels ) ;
	    e.setTargetIsLocalHost ( targetIsLocalHost ) ;
	    e.setChannel ( mainChannel ) ;
			String t = e.toJSON() ;
	    _stats.incrementOut ( t.length() ) ;
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
	throws IOException
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
			catch ( IOException exc )
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
		eventNameToListener.clear() ;
  	_Instances.remove ( "" + this.host + ":" + this.port ) ;
		_CallbackIsolator.awakeAll() ;
  	_emit ( "close", null ) ;
  	_Timer.cancel() ;
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
		String name = e.getName() ;
		int pos     = name.indexOf ( "::" ) ;
	  if ( pos > 0 )
	  {
	    String channel = name.substring ( 0, pos ) ;
	    name    = name.substring ( pos + 2 ) ;
	    e.setName ( name ) ;
	    e.setChannel ( channel ) ;
	  }
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
		e._Client = null ;
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
		    e.setChannel ( mainChannel ) ;
				String t = e.toJSON() ;
		    _stats.incrementOut ( t.length() ) ;
		    _out.write ( t, 0, t.length() ) ;
		    _out.flush() ;
			}
      if ( ! e.getName().equals ( "system" ) )
      {
        TPStore.points.get ( "EVENT_OUT" ).log ( e ) ;
      }
		}
		catch ( IOException exc )
		{
	  	_emit ( "error", null ) ;
	  	if ( _reconnect )
	  	{
	  		startReconnections() ;	
	  	}
	  	else
	  	{
				throw exc ;
	  	}
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
    	for ( String eventName : eventNameList )
    	{
    		if ( "system".equals ( eventName ) )
    		{
    			throw new IOException ( "Client.on(): eventName must not be 'system'" ) ;
    		}
		    if (  ( eventName.charAt ( 0 ) == '/' && eventName.charAt ( eventName.length() - 1 ) == '/' )
		    	 || eventName.indexOf ( ".*" ) >= 0
					 || eventName.indexOf ( '*' ) >= 0
					 || eventName.indexOf ( '?' ) >= 0
		    	 )
    		{
	    		patternContextList.add ( new PatternContext ( eventName, el ) ) ;
    		}
		    eventNameToListener.put ( eventName, el ) ;
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
		HashMap<String,String> m = new HashMap<String,String>() ;
		for ( String name : nameList )
		{
			eventNameToListener.remove ( name ) ;
			m.put ( name, null ) ;
		}
		ArrayList<PatternContext> toBeRemoved = new ArrayList<PatternContext>() ;
		for ( PatternContext pc : patternContextList )
		{
			if ( m.containsKey ( pc.originalEventName ) )
			{
				toBeRemoved.add ( pc ) ;	
			}			
		}
		m.clear() ;
		for ( PatternContext pc : toBeRemoved )
		{
			patternContextList.remove ( pc ) ;
		}
		toBeRemoved.clear() ;
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
		HashMap<EventListener,String> m = new HashMap<EventListener,String>() ;
		ArrayList<String> nameList = new ArrayList<String>() ; 
		for ( EventListener el : elList )
		{
      List<String> keys = eventNameToListener.getKeysOf ( el ) ;
      for ( String name : keys )
      {
      	nameList.add ( name ) ;
      }
      eventNameToListener.removeValue ( el ) ;
			m.put ( el, null ) ;
		}
		ArrayList<PatternContext> toBeRemoved = new ArrayList<PatternContext>() ;
		for ( PatternContext pc : patternContextList )
		{
			if ( m.containsKey ( pc.el ) )
			{
      	nameList.add ( pc.originalEventName ) ;
				toBeRemoved.add ( pc ) ;	
			}			
		}
		m.clear() ;
		for ( PatternContext pc : toBeRemoved )
		{
			patternContextList.remove ( pc ) ;
		}
		toBeRemoved.clear() ;

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
	        if ( ! e.getName().equals ( "system" ) )
	        {
            TPStore.points.get ( "EVENT_IN" ).log ( e ) ;
	        }
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
					boolean found = false ;
					List<EventListener> callbackList = eventNameToListener.get ( e.getName() ) ;
          if ( e.getChannel() != null )
          {
            List<EventListener> callbackList2 = eventNameToListener.get ( e.getChannel() + "::" + e.getName() ) ;
            if ( callbackList2 != null )
            {
              if ( callbackList != null )
              {
              	List<EventListener> newList = new ArrayList<EventListener> ( callbackList2 ) ;
								newList.addAll ( callbackList ) ;
                callbackList = newList ;
              }
              else
              {
                callbackList = new ArrayList<EventListener> ( callbackList2 ) ;
              }
            }
          }
					if ( callbackList != null )
					{
						List<EventListener> clonedList = new ArrayList(callbackList) ;
						try
						{
							for ( EventListener l : clonedList )
							{
								if ( e.isResultRequested() )
								{
									toBeSentBack.put ( e.getUniqueId(), e ) ;
									l.event ( e ) ;
									found = true ;
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
					for ( PatternContext pc : patternContextList )
					{
						if ( pc.matches ( e.getName() ) )
						{
							if ( e.isResultRequested() )
							{
								if ( ! found )
								{
									toBeSentBack.put ( e.getUniqueId(), e ) ;
									pc.el.event ( e ) ;
									found = true ;
									break ;
								}
							}
							else
							{
								pc.el.event ( e ) ;
							}
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
				    if ( t != null )
				    {
				      _stats.incrementIn ( t.length() ) ;
				    }
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
					e._Client = Client.this ;
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
						      Client.this.sid = (String) body.get ( "sid" ) ;
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
			Set<String> keySet = eventNameToListener.keySet() ;
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
	public TracePoint registerTracePoint ( String name )
	{
	  return TPStore.add ( name ) ;
	}
	public TracePoint registerTracePoint ( String name, boolean isActive )
	{
	  return TPStore.add ( name, isActive ) ;
	}
	public TracePoint registerTracePoint ( TracePoint tp )
	{
	  return TPStore.add ( tp ) ;
	}
	public void removeTracePoint ( String name )
	{
	  TPStore.remove ( name ) ;
	}
	public TracePoint getTracePoint ( String name )
	{
	  return TPStore.getTracePoint ( name ) ;
	}
	private void _handleSystemClientMessages ( Event e )
	{
	  try
	  {
	    Map<String,Object> info = new HashMap<String,Object>() ;
	    e.putValue ( "info", info ) ;

	    if ( e.getType().startsWith ( "client/action/" ) )
	    {
				Map<String,Object> parameter = (Map<String,Object>) e.getValue ( "parameter" ) ;
				if ( "tp".equals ( parameter.get ( "actionName" ) ) )
				{
	        Map<String,Object> tracePointResult = TPStore.action ( parameter ) ;
          info.put ( "tracePointStatus", tracePointResult ) ;
				}
	      else
	      if ( "info".equals ( parameter.get ( "actionName" ) ) )
	      {
          ArrayList<Map<String,Object>> resultList = new ArrayList<Map<String,Object>>() ;
          info.put ( "actionInfo", resultList ) ;
          for ( String key : nameToActionCallback.keySet() )
          {
	          List<ActionCmdCtx> list = nameToActionCallback.get ( key ) ;
	          HashMap<String,Object> m = new HashMap<String,Object>() ;
	          resultList.add ( m ) ;
	          for ( ActionCmdCtx ctx : list )
	          {
	          	m.put ( "cmd", ctx.cmd ) ;
	          	m.put ( "desc", ctx.desc ) ;
	          }
	        }
	      }
	      else
	      if ( "execute".equals ( parameter.get ( "actionName" ) ) )
	      {
					ActionCmd cmd = new ActionCmd ( parameter ) ;
					List<ActionCmdCtx> list = nameToActionCallback.get ( cmd.cmd ) ;
					if ( list == null )
					{
						e.setStatus ( 1, "error", "no actions available for cmd=" + cmd.cmd ) ;
		        e.setIsResult() ;
		        _send ( e ) ;
		        return ;
					}
					else
					{
						ArrayList<String> resultList = new ArrayList<String>() ;
						info.put ( "actionResult", resultList ) ;
						for ( ActionCmdCtx ctx : list )
						{
  	          ctx.cb.execute ( cmd ) ;
    	        resultList.add ( cmd.result ) ;
	    	    }
					}
	      }
	      else
	      {
	        e.setStatus ( 1, "error", "invalid: " + e.getType() ) ;
	        e.setIsResult() ;
	        _send ( e ) ;
	        return ;
	      }
	      e.removeValue ( "parameter" ) ;
	    }
	    else
	    if ( e.getType().startsWith ( "client/info/" ) )
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
		    if ( e.getType().indexOf ( "/info/tp/" ) > 0 )
		    {
	        Map<String,Object> tracePointResult = TPStore.action ( null ) ;
          info.put ( "tracePointStatus", tracePointResult ) ;
		    }
		    else
		    if ( e.getType().equals ( "client/info/" ) )
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
				else
				{
					e.setStatus ( 1, "error", "no " + e.getType() ) ;
					e.setIsResult() ;
					_send ( e ) ;
					return ;
				}
		  }
			else
			{
				e.setStatus ( 1, "error", "no " + e.getType() ) ;
				e.setIsResult() ;
				_send ( e ) ;
				return ;
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
  public Stats getStats()
  {
  	return _stats ;
  }
	class Stats
	{
		int sum_in = 0 ;
		int sum_out = 0 ;
		int bytes_in = 0 ;
		int bytes_out = 0 ;
		int calls_in = 0 ;
		int calls_out = 0 ;
		Stats()
		{

		}
	  public String toString()
	  {
	    return "{ sum: { out: " + sum_out + ", in: " + sum_in + "}\n"
	         + "{ bytes: { out: " + bytes_out + ", in: " + bytes_in + "}\n"
	         + "{ calls: { out: " + calls_out + ", in: " + calls_in + "}\n"
	         ;
	  }
	  void clear()
	  {
	    calls_out = 0 ;
	    calls_in = 0 ;
	    bytes_out = 0 ;
	    bytes_in = 0 ;
	  }
	  void incrementOut ( int n )
	  {
	    calls_out += 1 ; 
	    sum_out += n ; 
	    bytes_out += n ; 
	  }
	  void incrementIn ( int n)
	  {
	    calls_in += 1 ;
	    sum_in += n ;
	    bytes_in += n ;
	  }
	}
}
