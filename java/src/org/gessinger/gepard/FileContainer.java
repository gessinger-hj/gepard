package org.gessinger.gepard ;

import java.util.* ;
import java.io.* ;
import java.text.* ;

public class FileContainer implements JSONEncodable, JSONDecodable, HasSetTargetIsLocalHost
{
	String path                         = "" ;
	String name                         = "" ;
	byte[] data                         = null ;
	transient boolean targetIsLocalHost = false ;
	public FileContainer ( String file )
	throws Exception
	{
	  if ( file != null )
	  {
	    path = file.replace ( '\\', '/' ) ;
	    path = new File ( path ).getCanonicalPath() ;
	    path = path.replace ( '\\', '/' ) ;
	    name = path.substring ( path.lastIndexOf ( "/" ) + 1 ) ;
	  }
	}
	public FileContainer()
	throws Exception
	{
	}
	public String toString()
	{
	  return "(" + this.getClass().getName() + ")[\n  path=" + path + "\n  name=" + name + "\n  date=" + Util.toString ( data ) + "\n]" ;
	}
	public void setTargetIsLocalHost ( boolean state )
	{
	  targetIsLocalHost = state ;
	}
	public void fromJSON ( Map<String,Object> map )
	throws IOException
	{
		path = (String) map.get ( "path" ) ;
		name = (String) map.get ( "name" ) ;
		data = (byte[]) map.get ( "data" ) ;
	}
	public Map<String,Object> toJSON()
	throws IOException
	{
		byte[] d = this.data ;
		if ( ! targetIsLocalHost && data == null )
		{
		  data = getBytes() ;
		}
		HashMap<String,Object> hm = new HashMap<String,Object>() ;
		hm.put ( "className", "FileContainer" ) ;
		hm.put ( "path", path ) ;
		hm.put ( "name", name ) ;
		hm.put ( "data", data ) ;
    Util.convertJavaTypedDataToNodeJS ( targetIsLocalHost, hm ) ;
		return hm ;
	}
	public byte[] getBytes()
	throws IOException
	{
	  if ( data != null )
	  {
	    return data ;
	  }
	  return Util.getBytes ( new File ( path ) ) ;
	}
	public String getName()
	{
	  return this.name ;
	};
	public String getPath()
	{
	  return this.path ;
	};
	public void write ( String fullFileName )
	throws Exception
	{
		InputStream in = null ;
		OutputStream out = null ;
		if ( data != null )
		{
			in = new ByteArrayInputStream ( data ) ;
		}
		else
		{
			in = new FileInputStream ( path ) ;
		}
		try
		{
			out = new FileOutputStream ( fullFileName ) ;
			Util.copy ( in, out ) ;
		}
		catch ( Exception exc )
		{
			System.err.println ( Util.toString ( exc ) ) ;
			throw exc ;
		}
    finally
    {
      if ( in != null ) try { in.close() ; } catch ( Exception e ) {}
      if ( out != null ) try { out.close() ; } catch ( Exception e ) {}
    }
	}
}
