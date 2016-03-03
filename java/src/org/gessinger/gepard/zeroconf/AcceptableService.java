/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-02-29 19:36:54
* @Last Modified by:   hg02055
* @Last Modified time: 2016-03-03 14:23:54
*/
package org.gessinger.gepard.zeroconf ;
import org.gessinger.gepard.Client ;

public interface AcceptableService
{
  public boolean accept ( Client client, Service service ) ;
}