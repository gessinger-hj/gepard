package org.gessinger.gepard.xmp ;
import org.gessinger.gepard.* ;

import java.util.List ;
import java.util.Date ;

public class RequesterMassTest
{
  int j = 0 ;
  int m = 0 ;
  int n = 0 ;
  static public void main ( String[] args )
  {
    Util.argsToProperties ( args ) ;
    try
    {
      RequesterMassTest j = new RequesterMassTest() ;
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  RequesterMassTest()
  throws Exception
  {
    final Client client = Client.getInstance() ;

    int nb = Util.getInt ( "b", 0 ) ;
    n = Util.getInt ( "n", 10 ) ;
    if ( n < 1 )
    {
      System.out.println ( "invalid n=" + n ) ;
      return ;
    }

    String name = "mass-test" ;
    m = n ;
    client.emit ( "mass-test-start" ) ;
    String txt = "" ;
    if ( nb > 0 )
    {
      for ( int i = nb ; i > 0 ; i-- )
      {
        txt += "A" ;
      }
    }
    final long T0 = new Date().getTime() ;
    for ( int i = n ; i > 0 ; i-- )
    {
      Event event = new Event ( name ) ;
      JSAcc jsacc = new JSAcc ( event.getControl() ) ;
      jsacc.add ( "sequenceNumber",  i ) ;
      jsacc.add ( "sequenceNumber_j",  j ) ;
      j++ ;
      if ( txt.length() > 0 )
      {
        event.putValue ( "TEXT", txt ) ;
      }
      client.request ( name, new ResultCallback()
      {
        public void result ( Event e )
        {
          try
          {
            m-- ;
            if ( m < 1 )
            {
System.out.println ( "m=" + m ) ;
              long T1 = new Date().getTime() ;
              long millis = T1 - T0 ;
              double millisPerCall = (double)millis / (double)n ;
              System.out.println ( "millis=" + millis ) ;
              System.out.println ( "millisPerCall=" + millisPerCall ) ;
              client.emit ( "mass-test-end" ) ;
              System.out.println ( client.getStats () ) ;
              client.close() ;
            }
          }
          catch ( Exception exc )
          {
            System.out.println ( Util.toString ( exc ) ) ;
          }
        }
      });
    }
  }
}
