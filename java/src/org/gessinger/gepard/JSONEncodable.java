package org.gessinger.gepard ;

import java.util.Map ;
import java.io.IOException ;

public interface JSONEncodable
{
	public Map<String,Object> toJSON() throws IOException;
}
