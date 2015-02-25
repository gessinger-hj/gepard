package org.gessinger.gepard ;

import java.io.* ;
public class StringPrintWriter extends PrintWriter
{
    private StringBuilder _sb = new StringBuilder ( 256 ) ;

    public StringPrintWriter()
    {
      super(System.out, false);
    }
    public String toString()
    {
      return new String ( _sb ) ;
    }

    public void write(int p) { _sb.append ( (char)p ) ; }

    public void write(byte b[], int off, int len) {
      int start = off ;
      int cur   = start ;
      int end   = off + len - 1 ;

      while (( start < end) && ( b[start] < 32 )) {
        start++;
      }
      while (( start < end) && ( b[end] < 32 )) {
        end--;
      }
      if ( start <= end ) {
        _sb.append ( new String ( b, start, end - start + 1 ) ) ;
      }
    }
    public void write ( String p ) { _sb.append ( p ) ; }
    public void write ( char[] ca )
    {
      _sb.append ( ca ) ;
    }
    public void write ( char[] ca, int off, int len )
    {
      _sb.append ( ca, off, len ) ;
    }
    public void write ( String s, int off, int len )
    {
      char[] ca = new char[len] ;
      s.getChars ( off, off+len, ca, 0 ) ;
      _sb.append ( ca ) ;
    }

    public void flush() { }
    public void close() { }
    public boolean checkError() { return false; }

    public void print(Object p) { _sb.append ( p ) ; }
    public void print(String p) { _sb.append ( p ) ; }
    public void print(char p[]) { _sb.append ( p ) ; }
    public void print(char p) { _sb.append ( p ) ; }
    public void print(int p) { _sb.append ( p ) ; }
    public void print(long p) { _sb.append ( p ) ; }
    public void print(float p) { _sb.append ( p ) ; }
    public void print(double p) { _sb.append ( p ) ; }
    public void print(boolean p) { _sb.append ( p ) ; }
    public void println() { _sb.append ( "\n" ) ; }

    public void println(Object p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(String p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(char p[]) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(char p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(int p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(long p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(float p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(double p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
    public void println(boolean p) { _sb.append ( p ) ; _sb.append ( "\n" ) ; }
}
