/*
* @Author: Hans Jürgen Gessinger
* @Date:   2016-04-13 18:50:44
* @Last Modified by:   Hans Jürgen Gessinger
* @Last Modified time: 2016-04-16 09:33:07
*/

package org.gessinger.nutil ;

import org.gessinger.gepard.* ;

import java.util.* ;
import java.io.* ;

public class JWT
{
  public static void main ( String[] args )
  {
  	try
  	{
String token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpZCI6Im1pbGxlciIsImNvbnRleHQiOiJXRUIiLCJfcHdkIjoiIiwia2V5Ijo3LCJncm91cHMiOnsia2V5cyI6eyJBZG1pbkdyb3VwIjozLCJDdXN0b21lckdyb3VwIjo1LCJLZXlBY2NvdW50Q3VzdG9tZXJHcm91cCI6Nn0sInJpZ2h0cyI6eyJBZG1pbkdyb3VwIjp7IkNBTl9FRElUX1VTRVIiOiJ0cnVlIn0sIkN1c3RvbWVyR3JvdXAiOnsiQ0FOX1BVUkNIQVNFX1BST0RVQ1RTIjoidHJ1ZSJ9LCJLZXlBY2NvdW50Q3VzdG9tZXJHcm91cCI6eyJDQU5fUFVSQ0hBU0VfR09MRF9DQVJEIjoidHJ1ZSJ9fX0sInJpZ2h0cyI6eyJDQU5fRURJVF9VU0VSIjoidHJ1ZSIsIkNBTl9QVVJDSEFTRV9QUk9EVUNUUyI6InRydWUiLCJDQU5fUFVSQ0hBU0VfR09MRF9DQVJEIjoidHJ1ZSJ9LCJpYXQiOjE0NjA1Njk5ODN9.S5vS5ksbY-RLfhJcd7BA_PMfR-PodChuNPVEECLB5AwRzVU3iCKoVDqwtbvq9lYq4rUNqz0K3VVrOelKCMBHo_uEzlTLOYXSQeXHheL99WJLd0N6YcT25Nu3Q85GRoq7q5BuNf0T0J8f_Jp9oJTGv6UpgnwqvOi9QHi1QMRK-0S91hMRlDjjHDjBz0yuNojLi5sv_2-hZnTnitNUYi5W0FbiYgQ1ncQ-TtZMjDIzJH2vaPQ_bMj06QRx__sZgsMYRQAEr6bxTz8f6wBgdh5yJqmIaSroNgJ5c8eeKvNgY7MTh0QwS-Q7y5tUuV2JFMVvVCVIgvVMkkLHZbb6yN8n-g";      
      JWT jwt = new JWT ( token ) ;
      System.out.println ( jwt ) ;
      System.out.println ( "issued at=" + jwt.issuedAt() );
      System.out.println ( "expiration time=" + jwt.expirationTime() );
    }
    catch ( Exception exc )
    {
      exc.printStackTrace() ;
    }
  }
  Map<String,Object> head = null ;
  Map<String,Object> payload = null ;
  String token ;
  public JWT ( String token )
  throws Exception
  {
    this.token = token ;
    String[] jwtParts = token.split ( "\\." ) ;
    String h = new String ( Base64.getDecoder().decode ( jwtParts[0] ) ) ;
    String p = new String ( Base64.getDecoder().decode ( jwtParts[1] ) ) ;
    head = (Map<String,Object>) Util.fromJSON ( h, HashMap.class ) ;
    payload = (Map<String,Object>) Util.fromJSON ( p, HashMap.class ) ;
  }
  public String toString()
  {
    return "(JWT)[head=" + Util.toString ( head ) + "]\n[payload=" + Util.toString ( payload ) + "]" ;
  }
  public String getToken()
  {
    return token ;
  }
  public Map<String,Object> getHead()
  {
    return head ;  
  }
  public Map<String,Object> getPayload()
  {
    return payload ;  
  }
  public Date issuedAt()
  {
    Double d = (Double) payload.get ( "iat" ) ;
    if ( d == null ) return  new Date ( 0L ) ;
    return new Date ( d.longValue() * 1000 ) ;
  }
  public Date expirationTime()
  {
    Double d = (Double) payload.get ( "exp" ) ;
    if ( d == null ) return  new Date ( 9999-1900, 0, 1 ) ;
    return new Date ( d.longValue() * 1000 ) ;
  }
}