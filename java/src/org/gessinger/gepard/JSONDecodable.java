package org.gessinger.gepard ;

import java.util.Map ;
import java.io.IOException ;

public interface JSONDecodable
{
	public void fromJSON ( Map<String,Object> map ) throws IOException;
}
