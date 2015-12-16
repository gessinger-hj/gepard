var util = require  ( "util" ) ;
var path = require  ( "path" ) ;
if ( ! String.prototype.contains )
{
  /*
   * Description
   * @param {} needle
   * @return BinaryExpression
   */
  String.prototype.contains = function ( needle )
  {
    if ( ! needle ) return false ;
    return this.indexOf ( needle ) >= 0 ;
  } ;
}
if ( ! String.prototype.startsWith )
{
  /*
   * Description
   * @param {} needle
   * @return BinaryExpression
   */
  String.prototype.startsWith = function ( needle )
  {
    if ( ! needle ) return false ;
    return this.indexOf ( needle ) == 0 ;
  } ;
}
if ( ! String.prototype.endsWith )
{
  /*
   * Description
   * @param {} needle
   * @return Literal
   */
  String.prototype.endsWith = function ( needle )
  {
    if ( ! needle ) return false ;
    var pos = this.indexOf ( needle ) ;
    if ( pos < 0 ) return false ;
    if ( this.length - needle.length == pos ) return true ;
    return false ;
  };
}
if ( ! Array.remove )
{
  Array.prototype.remove = function ( element )
  {
    var length = this.length ;
    if ( typeof ( element ) == 'number' )
    {
      var index = Math.floor ( element ) ;
      if ( index < 0 ) return null ;
      if ( index >= length ) return null ;
      var obj = this[index] ;
      this.splice ( index, 1 ) ;
      return obj ;
    }
    var i = this.indexOf ( element ) ;
    if ( i < 0 ) return null ;
    this.splice ( i, 1 ) ;
    return element ;
  } ;
}

/**
 * @constructor
 * Description
 */
var TangoClass = function()
{
  this.jsClassName = "TangoClass" ;
  this._monthNames = {} ;
  this._monthNames["en"] = new Array (
    'January',   'February', 'March',    'April'
  , 'May',       'June',     'July',     'August'
  , 'September', 'October',  'November', 'December'
  , 'Jan',       'Feb',      'Mar',      'Apr'
  , 'May',       'Jun',      'Jul',      'Aug'
  , 'Sep',       'Oct',      'Nov',      'Dec'
  );
  this._monthNames["de"] = new Array (
    'Januar',    'Februar',  'März',     'April'
  , 'Mai',       'Juni',     'Juli',     'August'
  , 'September', 'Oktober',  'November', 'Dezember'
  , 'Jan',       'Feb',      'Mrz',      'Apr'
  , 'Mai',       'Jun',      'Jul',      'Aug'
  , 'Sep',       'Okt',      'Nov',      'Dez'
  ) ;
  this._dayNames = {} ;
  this._dayNames["en"] = new Array(
    'Sunday' ,'Monday' ,'Tuesday' ,'Wednesday' ,'Thursday' ,'Friday' ,'Saturday'
  , 'Sun' ,'Mon' ,'Tue' ,'Wed' ,'Thu' ,'Fri' ,'Sat'
  );
  this._dayNames["de"] = new Array(
    'Sonntag' ,'Montag' ,'Dienstag' ,'Mittwoch' ,'Donnerstag' ,'Freitag' ,'Samstag'
  , 'So' ,'Mo' ,'Di' ,'Mi' ,'Do' ,'Fr' ,'Sa'
  );
};
/**
 * Description
 * @return BinaryExpression
 */
TangoClass.prototype.toString = function ( value )
{
  if ( typeof value === 'undefined' )
  {
    return "(" + this.jsClassName + ")" ;
  }
  if ( value instanceof Error )
  {
    if ( util.isError ( value ) )
    {
      var str = value.toString() ;
      var stackTrace = util.inspect ( value.stack ) ;
      stackTrace = stackTrace.split ( "\\n" ) ;
      if ( stackTrace.length > 0 )
      {
        stackTrace.splice ( 0, 1 ) ;
      }
      if ( stackTrace.length )
      {
        str += "\n" + stackTrace.join ( "\n" ) ;
      }
      return str ;
    }
  }
  else
  if ( typeof value === 'object' )
  {
    return util.inspect ( value, { showHidden: false, depth: null } )
  }
  return value ;
};
/**
 * Description
 * @param {} args
 * @return Literal
 */
TangoClass.prototype.isArguments = function ( args )
{
  if ( args === null ) return false;
  if ( typeof args !== 'object' ) return false;
  if ( typeof args.callee !== 'function' ) return false;
  if ( typeof args.length !== 'number' ) return false;
  if ( args.constructor !== Object ) return false;
  return true;
};
/**
 * Description
 * @param {} a
 * @return LogicalExpression
 */
TangoClass.prototype.isObject = function (a) { return a && typeof a == 'object'; } ;

/**
 * Description
 * @param {} a
 * @return LogicalExpression
 */
TangoClass.prototype.isArray = function (a) { return this.isObject(a) && a.constructor == Array; } ;
/**
 * Description
 * @param {} a
 * @return LogicalExpression
 */
TangoClass.prototype.isDate = function (a) { return this.isObject(a) && a.constructor == Date; } ;

/**
 * Description
 * @param {} thiz
 * @param {} parentClass
 */
TangoClass.prototype.initSuper = function ( thiz, parentClass )
{
  // thiz._super_ = parentClass.prototype ;
  // Apply parent's constructor to this object
  if( arguments.length > 2 )
  {
    // Note: 'arguments' is an Object, not an Array
    parentClass.apply ( thiz, Array.prototype.slice.call( arguments, 2 ) ) ;
  }
  else
  {
    parentClass.call ( thiz ) ;
  }
};
/**
 * Description
 * @param {} clazz
 * @param {} parentClazz
 */
TangoClass.prototype.inherits = function ( clazz, parentClazz )
{
  clazz.prototype = Object.create ( parentClazz.prototype ) ;
  clazz.prototype.constructor = this;
};

/**
 * Description
 * @param {} from
 * @param {} to
 */
TangoClass.prototype.mixin = function ( from, to )
{
  for ( var key in from )
  {
    if ( ! from.hasOwnProperty (key) ) continue ;
    if ( to.hasOwnProperty ( key ) ) continue ;
    if ( from[key] && typeof ( from[key] ) === 'object' && typeof ( from[key].create ) === 'function' )
    {
      to[key] = from[key].create.call() ;
      continue ;
    }
    to[key] = from[key] ;
  }
};
/**
 * Description
 * @param {} obj
 * @param {} name
 * @param {} a
 */
TangoClass.prototype.callSuper = function ( obj, name, a )
{
	if  ( ! obj ) return ;
	if  ( ! name ) return ;
	var proto = Object.getPrototypeOf  ( obj ) ;
	while ( proto )
	{
		proto = Object.getPrototypeOf  ( proto ) ;
		if ( ! proto ) break ;
		if ( typeof ( proto[name] ) === 'function' )
		{
			if ( ! a )
			{
				proto[name].call ( obj ) ;
			}
			else
			if ( this.isArguments ( a ) )
			{
				proto[name].apply ( obj, a ) ;
			}
			else
			if ( this.isArray ( a ) )
			{
				proto[name].call ( obj, a ) ;
			}
			else
			{
				var aa = [ a ] ;
				proto[name].call ( obj, aa ) ;
			}
			break ;
		}
	}
};
var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

/**
 * Description
 * @param {} str
 */
TangoClass.prototype.lwhere = function ( str )
{
  if (!hasStacks) {
      return;
  }
  try
  {
    throw new Error();
  }
  catch (e)
  {
    var lines = e.stack.split ("\n") ;
    var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
    firstLine = firstLine.trim() ;
    if ( firstLine.indexOf ( "at " ) === 0 ) firstLine = firstLine.substring ( 3 ) ;
    var p1 = firstLine.lastIndexOf ( "(" ) ;
    var p2 = firstLine.indexOf ( ")", p1 ) ;
    if ( p1 >= 0 && p2 >= 0 && p2 > p1 )
    {
      var p_slash = firstLine.lastIndexOf ( "/", p2 ) ;
      if ( p_slash < 0 )
      {
        p_slash = firstLine.lastIndexOf ( "\\", p1 ) ;
      }
      if ( p_slash > p1 && p_slash < p2 )
      {
        firstLine = firstLine.substring ( 0, p1+1 ) + firstLine.substring ( p_slash + 1 ) ;
      }
    }
    if ( str )
    {
      console.log ( str + ": " + firstLine ) ;
    }
    else
    {
      console.log ( firstLine ) ;
    }
  }
}
/**
 * Description
 * @param {} indexOfLine
 */
TangoClass.prototype.where = function ( indexOfLine )
{
  if (!hasStacks) {
      return;
  }
  if ( ! indexOfLine ) indexOfLine = 0 ;
  try
  {
    throw new Error();
  }
  catch (e)
  {
    var lines = e.stack.split ("\n") ;
    var firstLine = lines[0].indexOf("@") > 0 ? lines[indexOfLine+1] : lines[indexOfLine+2];
    if ( firstLine.indexOf ( "at " ) === 0 ) firstLine = firstLine.substring ( 3 ) ;
    return firstLine ;
  }
}
/**
 * Description
 * @param {} iterable
 * @return results
 */
TangoClass.prototype.toArray = function (iterable)
{
  if ( !iterable ) return []; 
  if (iterable.toArray)
  {
    return iterable.toArray();
  }
  var results = [];
  for ( var i = 0 ; i < iterable.length ; i++ )
  {
    results.push(iterable[i]);
  }     
  return results;
};
/**
 * Description
 * @param {} name
 * @param {} value
 */
TangoClass.prototype.setProperty = function ( name, value )
{
  if ( ! this._envMap ) this._envMap = {} ;
  this._envMap[name] = value ;
};
/**
 * Description
 * @param {} name
 * @param {} defaultValue
 */
TangoClass.prototype.getBool = function ( name, defaultValue )
{
  var v = this.getProperty ( name ) ;
  if ( ! v ) return defaultValue ;
  if ( v === "true" || v === "1" || v === "yes" || v === "y" ) return true ;
  return false ;
};
/**
 * Description
 * @param {} name
 * @param {} defaultValue
 */
TangoClass.prototype.getInt = function ( name, defaultValue )
{
  var v = this.getProperty ( name ) ;
  if ( ! v ) return defaultValue ;
  var n = parseInt ( v ) ;
  if ( isNaN ( n ) ) return defaultValue ;
  return n ;
};
/**
 * Description
 * @param {} name
 * @param {} defaultValue
 * @return defaultValue
 */
TangoClass.prototype.getProperty = function ( name, defaultValue )
{
  var value ;
  if ( this._envMap )
  {
    value = this._envMap[name] ;
    if ( typeof value !== 'undefined' )
    {
      if ( typeof value === 'object' ) return defaultValue ? defaultValue : "true" ;
      return value ;
    }
  }
  if ( ! this._envMap )
  {
    this._envMap = {} ;
  }
  var i ;
  if ( ! this.argsDone )
  {
    this.argsDone = true ;
    for ( i = 2 ; i < process.argv.length ; i++ )
    {
      var p = process.argv[i] ;
      if ( p.indexOf ( "-D" ) === 0 )
      {
        if (  p.length < 3
           || p.charAt ( 2 ) == '='
           )
        {
          console.log ( "Missing option name: " + p ) ;
          return ;
        }
        var pos = p.indexOf ( '=' ) ;
        if ( pos < 0 )
        {
          this.setProperty ( p.substring ( 2 ), {} ) ;
        }
        else
        {
          this.setProperty ( p.substring ( 2, pos )
                           , p.substring ( pos + 1 )
                            ) ;
        }
        continue ;
      }
      if ( p.indexOf ( "--" ) === 0 )
      {
        if (  p.length < 3
           || p.charAt ( 2 ) == '='
           )
        {
          console.log ( "Missing option name: " + p ) ;
          return ;
        }
        var pos = p.indexOf ( '=' ) ;
        if ( pos < 0 )
        {
          this.setProperty ( p.substring ( 2 ), {} ) ;
        }
        else
        {
          this.setProperty ( p.substring ( 2, pos )
                           , p.substring ( pos + 1 )
                            ) ;
        }
      }
    }
  }
  value = this._envMap[name] ;
  if ( typeof value !== 'undefined' )
  {
    if ( typeof value === 'object' ) return defaultValue ? defaultValue : "true" ;
    return value ;
  }
  value = process.env[name] ;
  if ( ! value && typeof value !== 'string' && name.indexOf ( '.' ) > 0 )
  {
    name = name.replace ( /\./g, '_' ) ;
    value = process.env[name] ;
    if ( ! value && typeof value !== 'string' )
    {
      name = name.toUpperCase() ;
      value = process.env[name] ;
    }
  }
  if ( typeof value !== 'undefined' )
  {
    this._envMap[name] = value ;
    return value ;
  }

  return defaultValue ;
};
/**
 * Description
 * @param {} object
 */
TangoClass.prototype.log = function ( object )
{
  if ( util.isError ( object ) )
  {
    var ttt = object.toString() ;
    var tt = util.inspect ( object.stack ) ;
    tt = tt.split ( "\\n" ) ;
    if ( tt.length > 0 )
    {
      tt.splice ( 0, 1 ) ;
    }
    if ( tt.length )
    {
      object = ttt + "\n" + tt.join ( "\n" ) ;
    }
    else
    {
      object = ttt ;
    }
    console.log ( object ) ;
    return ;
  }
  console.log ( util.inspect ( object, { showHidden: false, depth: null } ) ) ;
};
/**
 * Description
 * @return __dirname
 */
TangoClass.prototype.getConfigPath = function()
{
  return __dirname ;
};
/**
 * Description
 * @param {} str
 * @return list
 */
TangoClass.prototype.splitJSONObjects = function ( str, max )
{
  var list = [] ;
  var pcounter = 1 ;
  var q = "" ;
  var i0 = 0 ;
  var i = 1 ;
  for ( i = 1 ; i < str.length ; i++ )
  {
    if ( max && i - i0 > max )
    {
      return { invalid: true, size: true, max: max, actual: i - i0 } ;
    }
    var c = str.charAt ( i ) ;
    if ( c === '"' || c === "'" )
    {
      q = c ;
      for ( var j = i+1 ; j < str.length ; j++ )
      {
        if ( max && j - i0 > max )
        {
          return { invalid: true, size: true, max: max, actual: j - i0 } ;
        }
        c = str.charAt ( j ) ;
        if ( c === q )
        {
          if ( str.charAt  ( j - 1 ) === '\\' )
          {
            continue ;
          }
          i = j ;
          break ;
        }
      }
    }
    if ( c === '{' )
    {
      pcounter++ ;
      continue ;
    }
    if ( c === '}' )
    {
      pcounter-- ;
      if ( pcounter === 0 )
      {
        list.push ( str.substring ( i0, i + 1 ) ) ;
        i0 = i + 1 ;
        for ( ; i0 < str.length ; i0++ )
        {
          if ( str.charAt ( i0 ) === '{' )
          {
            i = i0 - 1 ;
            break ;
          }
        }
      }
      continue ;
    }
  }
  if ( i0 < str.length )
  {
    list.push ( str.substring ( i0 ) ) ;
  }
  return { list: list, lastLineIsPartial: pcounter ? true : false } ;
};
/**
 * Description
 * @param {} obj
 */
TangoClass.prototype.serialize = function ( obj )
{
  var old = Date.prototype.toJSON ;
  try
  {
    /**
     * Description
     * @return ObjectExpression
     */
    Date.prototype.toJSON = function()
    {
      return { type:'Date', 'value': this.toISOString() } ;
    };
    return JSON.stringify ( obj ) ; //+ "\r\n" ;
  }
  finally
  {
    Date.prototype.toJSON = old ;
    // console.log ( exc ) ;
  }
};
/**
 * Description
 * @param {} obj
 */
TangoClass.prototype.deepDeserializeClass = function ( obj )
{
  if ( ! obj ) return ;
  for ( var k in obj )
  {
    if ( ! obj.hasOwnProperty ( k ) ) continue ;

    var o = obj[k] ;
    if ( ! o ) continue ;
    
    if ( typeof o.type === 'string' )
    {
      if ( o.type === 'Date' )
      {
        obj[k] = new Date ( o.value ) ;
        continue ;
      }
      if ( o.type === "Buffer" && this.isArray ( o.data ) )
      {
        obj[k] = new Buffer ( o.data ) ;
        continue ;
      }
    }
    if ( o.className && typeof o.className === 'string' )
    {
// console.log ( "o.className=" + o.className ) ;
    }
    if ( typeof o === 'object' )
    {
      this.deepDeserializeClass ( o ) ;
    }
  }
}
/**
 * Description
 * @param {} serializedObject
 * @param {} classNameToConstructor
 * @param {} deepClassInspection
 * @return that
 */
TangoClass.prototype.deserialize = function ( serializedObject, classNameToConstructor, deepClassInspection )
{
  var that ;
  var obj = serializedObject ;
  if ( deepClassInspection !== false ) deepClassInspection = true ;
  if ( typeof serializedObject === 'string' )
  {
    obj = JSON.parse ( serializedObject ) ;
  }
  if ( deepClassInspection ) this.deepDeserializeClass ( obj ) ;
  if ( obj.className && typeof obj.className === 'string' )
  {
    var f ;
    if ( classNameToConstructor )
    {
      var mcn = classNameToConstructor[obj.className] ;
      if ( mcn )
      {
        that = f = new mcn() ;
      }
    }
    if ( ! f )
    {
      f = eval ( obj.className ) ;
      that = Object.create ( f.prototype ) ;
    }
    for ( var k in obj )
    {
      if ( ! obj.hasOwnProperty ( k ) ) continue ;
      var o = obj[k] ;
      if ( o && typeof o === 'object' )
      {
        if ( o.className && typeof o.className === 'string' )
        {
          that[k] = this.deserialize ( o ) ;
          continue ;
        }
      }
      that[k] = obj[k]  ;
    }
  }
  return that ;
};
/**
 * @param {string} src string to be resolved
 * @return {string} src with environment-variables rsolved
 */
TangoClass.prototype.resolve = function ( src, map, delimiter )
{
  if ( ! src ) return src ;
  if ( src.length == 0 ) return src ;
  if ( ! delimiter )
  {
    if ( src.indexOf ( "${" ) >= 0 )
    {
      delimiter = "{" ;
    }
    else
    {
      delimiter = '%' ;
    }
  }
  var v ;

  var pos = src.indexOf ( delimiter ) ;
  if ( pos < 0 ) return src ;

  var tgt = "" ;

  var i, j, sb2, cc, c, name, n, v ;

  if ( delimiter === '{' )
  {
    for ( i = 0 ; i < src.length ; i++ )
    {
      c = src.charAt ( i ) ;
      if ( c === '$' && src.length > i && src.charAt ( i+1 ) === '{' )
      {
        sb2 = "" ;
        var pCount = 1 ;
        var found = false ;
        var lastWasBackSlash = false ;
        for ( j = i + 2 ; j < src.length ; j++ )
        {
          cc = src.charAt ( j ) ;
          if ( cc === '{' )
          {
            if ( ! lastWasBackSlash ) pCount++ ;
            lastWasBackSlash = false ;
          }
          else
          if ( cc === '}' )
          {
            if ( ! lastWasBackSlash ) pCount-- ;
            lastWasBackSlash = false ;
          }
          else
          {
            if ( lastWasBackSlash ) sb2 += "\\" ;
            lastWasBackSlash = false ;
          }
          if ( pCount === 0 )
          {
            found = true ;
            i = j ;
            break ;
          }
          sb2 += cc ;
          if ( cc === '\\' ) lastWasBackSlash = true ;
        }
        if ( ! found )
        {
          tgt += c ;
          continue ;
        }

        name = sb2 ;
        v = null ;
        if ( map ) v = map[name] ;
  
        if ( typeof v !== 'string' )
        {
          v = this.getProperty ( name ) ;
        }
        if ( v && v.indexOf ( "${" ) >= 0  )
        {
          v = this.resolve ( v, map, delimiter ) ;
        }
        if ( typeof v !== 'string' && name === 'HOME' )
        {
          var hp = this.getProperty ( "HOMEPATH" ) ;
          var hd = this.getProperty ( "HOMEDRIVE" ) ;
          if ( hp && hd )
          {
            v = hd + hp ;
          }
        }
        if ( typeof v === 'string' )
        {
          tgt += v ;
        }
        else
        {
          tgt += "${" ;
          tgt += name ;
          tgt += "}" ;
        }
      }
      else
      {
        tgt += c ;
      }
    }
  }
  else
  {
    for ( i = 0 ; i < src.length ; i++ )
    {
      c = src.charAt ( i ) ;
      if ( c === delimiter )
      {
        j = src.indexOf ( delimiter, i+1 ) ;
        if ( j > 0 )
        {
          name = "" ;
          for ( i++ ; i < j ; i++ )
          {
            name += src.charAt ( i ) ;
          }
          n = name ;
          v = null ;
          if ( map ) v = map[n] ;
          if ( typeof v !== 'string' )
          {
            v = this.getProperty ( n ) ;
          }
          if ( v && v.indexOf ( delimiter ) >= 0  )
          {
            v = this.resolve ( v, map, delimiter ) ;
          }
          if ( typeof v !== 'string' && name === 'HOME' )
          {
            var hp = this.getProperty ( "HOMEPATH" ) ;
            var hd = this.getProperty ( "HOMEDRIVE" ) ;
            if ( hp && hd )
            {
              v = hd + hp ;
            }
          }
          if ( typeof v === 'string' )
          {
            tgt += v ;
          }
          else
          {
            tgt += delimiter ;
            tgt += name ;
            i-- ;
          }
        }
        else tgt += c ;
      }
      else
      {
        tgt += c ;
      }
    }
  }
  return tgt ;
}
TangoClass.prototype.isWindows = function()
{
  return path.sep === '\\' ;
};
TangoClass.prototype.isUnix = function()
{
  return path.sep === '/' ;
};
TangoClass.prototype.getUSERNAME = function()
{
  if ( this.isWindows() )
  {
    // USERPROFILE=C:\Users\<user-name>
    return process.env["USERNAME"] ;
  }
  else
  {
    return process.env["LOGNAME"] ;
  }
};
TangoClass.prototype.formatDate = function ( date, format )
{
  if ( typeof format === 'string' && format.indexOf ( "'" ) >= 0 )
  {
    var aa = format.split ( "'" ) ;
    var tt = "" ;
    for ( var ii = 0 ; ii < aa.length ; ii++ )
    {
      if ( ! aa[ii] )
      {
        continue ;
      }
      if ( ii & 0x01 )
      {
        tt += aa[ii] ;
      }
      else
      {
        tt += this.formatDate ( date, aa[ii] ) ;
      }
    }
    return tt ;
  }
  var language = "en" ;
  var mn = this._monthNames[language] ;
  var dn = this._dayNames[language] ;

  if ( ! format ) format = "yyyy-MM-ddTHH:mm:ss.SSS" ;

  format=format+"";
  var result="";
  var i_format=0;
  var c="";
  var token="";
  var y=date.getFullYear()+"";
  var M=date.getMonth()+1;
  var d=date.getDate();
  var E=date.getDay();
  var H=date.getHours();
  var m=date.getMinutes();
  var s=date.getSeconds();
  var milliRest = date.getTime() % 1000 ;
  var yyyy,yy,MMMM,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
  var value=new Object();
  if ( y.length < 4 )
  {
    y=""+(y-0+1900);
  }
  value["y"]=""+y;
  value["yyyy"]=y;
  value["yy"]=y.substring(2,4);
  value["M"]=M;
  value["MM"]=this._LZ(M);
  value["MMM"]=mn[M+11];
  value["MMMM"]=mn[M-1];
  value["d"]=d;
  value["dd"]=this._LZ(d);
  value["E"]=dn[E+7];
  value["EE"]=dn[E];
  value["H"]=H;
  value["HH"]=this._LZ(H);
  if ( H == 0 )
  {
    value["h"]=12;
  }
  else
  if ( H>12 )
  {
    value["h"]=H-12;
  }
  else
  {
    value["h"]=H;
  }
  value["hh"]=this._LZ(value["h"]);
  if ( H>11 )
  {
    value["K"]=H-12;
  }
  else
  {
    value["K"]=H;
  }
  value["k"]=H+1;
  value["KK"]=this._LZ(value["K"]);
  value["kk"]=this._LZ(value["k"]);
  if ( H > 11)
  {
    value["a"]="PM";
  }
  else
  {
    value["a"]="AM";
  }
  value["m"]=m;
  value["mm"]=this._LZ(m);
  value["s"]=s;
  value["ss"]=this._LZ(s);
  value["SSS"]=this._LZ2(milliRest);
  while ( i_format < format.length )
  {
    c = format.charAt ( i_format ) ;
    token="";
    while (  ( format.charAt ( i_format ) == c )
          && ( i_format < format.length )
          )
    {
      token += format.charAt ( i_format++ ) ;
    }
    if ( value[token] != null )
    {
      result += value[token];
    }
    else
    {
      result += token;
    }
  }
  return result;
};
TangoClass.prototype._LZ = function (x){return(x<0||x>9?"":"0")+x;} ;
TangoClass.prototype._LZ2 = function (x)
{
  if ( x < 0 || x >= 100 ) return "" + x ;
  if ( x >= 10 || x < 100 ) return "0" + x ;
  return "00" + x ;
} ;
TangoClass.prototype._MLZ = function (x)
{
  if ( x == "" ) return 0 ;
  if ( x == "0" ) return 0 ;
  if ( x == "00" ) return 0 ;
  var i = 0 ;
  var rc = "" ;
  var found = false ;
  for ( i = 0 ; i < x.length ; i++ )
  {
    if ( ! found && x.charAt ( i ) == '0' ) continue ;
    found = true ;
    rc += x.charAt ( i ) ;
  }
  return rc ;
};
TangoClass.prototype.toRFC3339String = function ( date )
{
  var to = date.getTimezoneOffset() ;
  var signum = to > 0 ? "-" : "+" ;
  if ( to < 0 ) to *= -1 ;
  var t = this.formatDate ( date )
        + signum
        + this._LZ ( Math.round ( to / 60 ) )
        + ":"
        + this._LZ ( to % 60 )
        ;
  return t ;
};
var Tango = null ;

if ( typeof org === 'undefined' ) org = {} ;
if ( typeof org.gessinger === 'undefined' ) org.gessinger = {} ;
if ( typeof org.gessinger.tangojs === 'undefined' ) org.gessinger.tangojs = {} ;

if ( ! org.gessinger.tangojs.Tango )
{
  org.gessinger.tangojs.Tango = new TangoClass() ;
}
if ( ! Date.toRFC3339String )
{
  Date.prototype.toRFC3339String = function ()
  {
    return org.gessinger.tangojs.Tango.toRFC3339String ( this ) ;
  };
}
module.exports = org.gessinger.tangojs.Tango ;
