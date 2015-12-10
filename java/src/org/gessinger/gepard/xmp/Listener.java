package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

public class Listener
{
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      Listener j = new Listener() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Listener()
  throws Exception
  {
    final Client client = Client.getInstance() ;
    final TracePoint tp = client.registerTracePoint ( "BLARM_REMOVED" ) ;

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
    client.onActionInfo ( new ActionInfoCallback()
    {
      public void info ( ActionInfo info )
      {
        info.add ( "kill", "Shut down this client." ) ;
      }
    });
    client.onActionCmd ( new ActionCmdCallback()
    {
      public void execute ( ActionCmd cmd )
      {
        cmd.setResult ( "I don't " + cmd.getCmd() + "!!" ) ;
      }
    });
    String[] name = new String[] { "ALARM", "BLARM" } ;
    System.out.println ( "Listen for events with name=ALARM,BLARM" ) ;
    client.on ( name, new EventListener()
    {
      public void event ( Event e )
      {
        if ( e.getName().equals ( "BLARM" ) )
        {
          try
          {
            client.remove ( "BLARM" ) ;
            tp.log ( "BLARM is removed." ) ;
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
        System.out.println ( e ) ;
      }
    } ) ;
    if ( client.isReconnect() )
    {
      Thread.sleep ( Long.MAX_VALUE ) ;
    }
  }
}
