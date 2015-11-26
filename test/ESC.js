#!/usr/bin/env node
var ansiEscapes = require('ansi-escapes');
 
// moves the cursor two rows up and to the left 
// process.stdout.write(ansiEscapes.cursorUp(2) + ansiEscapes.cursorLeft);
//=> '\u001b[2A\u001b[1000D' 

var c = [ '|','/','-','\\','|','/','-','\\'] ;

var i = 1 ;
var first = true ;
process.stdout.write(ansiEscapes.cursorSavePosition);
process.stdout.write( c[i++] );
process.stdout.write(ansiEscapes.cursorRestorePosition);
var intervalId = setInterval ( function(p)
{
	process.stdout.write(ansiEscapes.cursorSavePosition);
	process.stdout.write( c[i] );
	process.stdout.write(ansiEscapes.cursorRestorePosition);
	i++ ;
	if ( i >= c.length )
	{
		clearInterval ( intervalId ) ;
	}
},100);

