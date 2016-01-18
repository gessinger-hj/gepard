package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class FullFeaturedListener
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      FullFeaturedListener j = new FullFeaturedListener() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  FullFeaturedListener()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    final TracePoint tracePoint = client.registerTracePoint ( "BLARM_REMOVED" ) ;

    String name = Util.getProperty ( "name" ) ;
    if ( name == null )
    {
      name = "ALARM,BLARM" ;
    }
    final String[] nameArray = name.split ( "," ) ;

    System.out.println ( "Listen for events with name=" + name ) ;
    final EventListener func = new EventListener()
    {
      public void event ( Event e )
      {
        if ( e.getName().equals ( "BLARM" ) )
        {
          try
          {
            client.remove ( "BLARM" ) ;
            tracePoint.log ( "BLARM is removed." ) ;
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
        System.out.println ( e ) ;
      }
    } ;
    client.on ( nameArray, func ) ;

    client.onShutdown ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        c.setReconnect ( false ) ;
        System.out.println ( e.getName() + "/" + e.getType() ) ;
        System.exit ( 0 ) ;
      }
    });
    client.onClose ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e.getName() + "/" + e.getType() ) ;
      }
    });
    client.onReconnect ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e.getName() + "/" + e.getType() ) ;
      }
    });
    client.onDisconnect ( new InfoCallback()
    {
      public void info ( Client c, Event e )
      {
        System.out.println ( e.getName() + "/" + e.getType() ) ;
      }
    });
    client.onAction ( "kill", new ActionCmdCallback()
    {
      public void execute ( ActionCmd cmd )
      {
        try
        {
          cmd.setResult ( "done") ;
          client.close() ;
          System.exit ( 0 ) ;
        }
        catch ( Exception exc )
        {
          System.out.println ( Util.toString ( exc ) ) ;
        }
      }
    });
    client.onAction ( "rmname", new ActionCmdCallback()
    {
      public void execute ( ActionCmd cmd )
      {
        try
        {
          cmd.setResult ( "done") ;
          client.remove ( nameArray ) ;
        }
        catch ( Exception exc )
        {
          System.out.println ( Util.toString ( exc ) ) ;
        }
      }
    });
    client.onAction ( "rmfunc", new ActionCmdCallback()
    {
      public void execute ( ActionCmd cmd )
      {
        try
        {
          cmd.setResult ( "done") ;
          client.remove ( func ) ;
        }
        catch ( Exception exc )
        {
          System.out.println ( Util.toString ( exc ) ) ;
        }
      }
    });
    if ( client.isReconnect() )
    {
      Thread.sleep ( Long.MAX_VALUE ) ;
    }
  }
}
