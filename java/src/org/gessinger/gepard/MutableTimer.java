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
    timer.schedule ( rc.task, 0, rc.period ) ;
  }
  public void stop()
  {
    for ( RunnableContext rc : taskList )
    {
      rc.task.cancel() ;
    }
  }
  public void start()
  {
    for ( RunnableContext rc : taskList )
    {
      _schedule ( rc ) ;
    }
  }
  public void start ( long nuperiod )
  {
    for ( RunnableContext rc : taskList )
    {
      rc.period = nuperiod ;
      _schedule ( rc ) ;
    }
  }
  public void cancel ( String taskName )
  {
    ArrayList<RunnableContext> toBeRemoved = new ArrayList<RunnableContext>() ;
    for ( RunnableContext rc : taskList )
    {
      if ( rc.name.equals ( taskName ) )
      {
        rc.task.cancel() ;
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
      rc.task.cancel() ;
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
    System.out.format("About to schedule task.%n");
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
    Thread.sleep ( 2000 ) ;
    gt.start(100) ;
    Thread.sleep ( 2000 ) ;
    gt.cancelAll() ;
    System.out.format("Task scheduled.%n");
    gt.schedule ( 500, "R2", new Runnable()
    {
      public void run()
      {
        System.out.println ( "boop" ) ;
      }
    }) ;
    // gt.schedule ( 500, () -> System.out.println ( "boop" ) ) ;
    Thread.sleep ( 5000 ) ;
    // gt.cancelAll() ;
    // gt.cancel() ;
  }
}
