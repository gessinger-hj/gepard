package org.gessinger.gepard ;

import java.util.* ;

/**
 * Schedule a task that executes once every second.
 */

public class MutableTimer
{
  Timer timer;
  Vector<RunnableContext> taskList = new Vector<RunnableContext>() ;

  class RunnableContext
  {
    long period ;
    String name ;
    Runnable runnable ;
    TimerTask task = null ;
    RunnableContext ( long period, String name, Runnable runnable )
    {
      this.period   = period ;
      this.name     = name ;
      this.runnable = runnable ;
      this.task     = null ;
    }
    public String toString()
    {
      return "(" + getClass().getName() + ")[\nname=" + name + "\n,period=" + period + "\n,task=" + task + "\n]" ;
    }
  }
  public MutableTimer()
  {
    this ( true ) ;
  }
  public MutableTimer ( boolean isDaemon )
  {
    timer = new Timer ( isDaemon ) ;
  }
  public void schedule ( long period, Runnable runnable )
  {
    schedule ( period, "", runnable ) ;
  }
  public void schedule ( long period, String name, Runnable runnable )
  {
    RunnableContext rc = new RunnableContext ( period, name, runnable ) ;
    _schedule ( rc ) ;
    taskList.add ( rc ) ;
  }
  private void _schedule ( final RunnableContext rc )
  {
    TimerTask task = new TimerTask()
    {
      public void run()
      {
        rc.runnable.run() ;
      }
    };
    rc.task = task ;
    timer.schedule ( rc.task, rc.period, rc.period ) ;
  }
  public void add ( long period, Runnable runnable )
  {
    RunnableContext rc = new RunnableContext ( period, "", runnable ) ;
    taskList.add ( rc ) ;
  }
  public void add ( long period, String name, Runnable runnable )
  {
    RunnableContext rc = new RunnableContext ( period, name, runnable ) ;
    taskList.add ( rc ) ;
  }
  public void stop()
  {
    for ( RunnableContext rc : taskList )
    {
      if ( rc.task != null )
      {
        rc.task.cancel() ;
        rc.task = null ;
      }
    }
  }
  public void stop ( String name )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( name.equals ( rc.name ) )
      {
        if ( rc.task != null )
        {
          rc.task.cancel() ;
          rc.task = null ;
        }
      }
    }
  }
  public void start()
  {
    for ( RunnableContext rc : taskList )
    {
      if ( rc.task != null ) continue ;
      _schedule ( rc ) ;
    }
  }
  public void start ( long period )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( rc.task != null ) continue ;
      rc.period = period ;
      _schedule ( rc ) ;
    }
  }
  public void start ( String name )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( name.equals ( rc.name ) )
      {
        if ( rc.task != null ) continue ;
        _schedule ( rc ) ;
      }
    }
  }
  public void start ( long period, String name )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( name.equals ( rc.name ) )
      {
        if ( rc.task != null ) continue ;
        rc.period = period ;
        _schedule ( rc ) ;
      }
    }
  }

  public void restart ( long period )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( rc.task != null )
      {
        rc.task.cancel() ;
        rc.task = null ;
      }
      rc.period = period ;
      _schedule ( rc ) ;
    }
  }
  public void restart ( String name )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( name.equals ( rc.name ) )
      {
        if ( rc.task != null )
        {
          rc.task.cancel() ;
          rc.task = null ;
        }
        _schedule ( rc ) ;
      }
    }
  }
  public void restart ( long period, String name )
  {
    for ( RunnableContext rc : taskList )
    {
      if ( name.equals ( rc.name ) )
      {
        if ( rc.task != null )
        {
          rc.task.cancel() ;
          rc.task = null ;
        }
        rc.period = period ;
        _schedule ( rc ) ;
      }
    }
  }

  public void cancel ( String taskName )
  {
    ArrayList<RunnableContext> toBeRemoved = new ArrayList<RunnableContext>() ;
    for ( RunnableContext rc : taskList )
    {
      if ( rc.name.equals ( taskName ) )
      {
        if ( rc.task != null )
        {
          rc.task.cancel() ;
        }
        toBeRemoved.add ( rc ) ;
      }
    }
    for ( RunnableContext rc : toBeRemoved )
    {
      taskList.remove ( rc ) ;
    }
    toBeRemoved.clear() ;
  }
  public void cancelAll()
  {
    for ( RunnableContext rc : taskList )
    {
      if ( rc.task != null )
      {
        rc.task.cancel() ;
      }
    }
    taskList.clear() ;
  }
  public void cancel()
  {
    cancelAll() ;
    timer.cancel() ;
  }
  public static void main ( String args[] )
  throws Exception
  {
    MutableTimer gt = new MutableTimer() ;
    System.out.println ( "Schedule task R1" ) ;
    gt.schedule ( 1000, "R1", new Runnable()
    {
      public void run()
      {
        System.out.println ( "beep" ) ;
      }
    }) ;
    Thread.sleep ( 5000 ) ;
    // gt.cancel ( "R1" ) ;
    gt.stop() ;
    System.out.println ( "Sleep 2000" ) ;
    Thread.sleep ( 2000 ) ;
    gt.start(100) ;
    System.out.println ( "Sleep 2000" ) ;
    Thread.sleep ( 2000 ) ;
    gt.cancelAll() ;
    gt.schedule ( 500, "R2", new Runnable()
    {
      public void run()
      {
        System.out.println ( "boop" ) ;
      }
    }) ;
    // gt.schedule ( 500, () -> System.out.println ( "boop" ) ) ;
    System.out.println ( "Sleep 5000" ) ;
    Thread.sleep ( 5000 ) ;
    System.out.println ( "stop R2" ) ;
    gt.stop ( "R2" ) ;
    System.out.println ( "Add R3" ) ;
    gt.add ( 1000, "R3", new Runnable()
    {
      public void run()
      {
        System.out.println ( "baaaap" ) ;
      }
    });
    System.out.println ( "Start R3" ) ;
    gt.start ( "R3" ) ;
    System.out.println ( "Sleep 5000 for R3 1000" ) ;
    Thread.sleep ( 5000 ) ;
    System.out.println ( "Restart R3 500" ) ;
    gt.restart ( 100, "R3" ) ;
    System.out.println ( "Sleep 1000 for R3 100" ) ;
    Thread.sleep ( 1000 ) ;
    // gt.cancelAll() ;
    // gt.cancel() ;
  }
}
