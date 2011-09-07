Number.prototype.times = function( callback, opt_scope ){
	var max = this.valueOf();
	for( var i = 0; i < max; i++ )
		callback.call( opt_scope || this, i );
};

Array.prototype.each = function( callback, opt_scope ){
	
	var len = this.length,
		activeSequence = !! this.__sequence,
		seqLen = activeSequence ? this.__sequence.length : 0;
	
	
	for( var i = 0; i < len; i++ ){
		if( i in this ){
			
			callback.apply( opt_scope || this, 
				
				activeSequence 
					? 
						[ this.__sequence[ i % seqLen ], this[ i ], i, this ]
					: 
						[ this[ i ], i, this ] 
			
			);
		}
	}
	
};

Array.prototype.sequence = function( ){
	this.__sequence = Array.prototype.slice.call( arguments );
	
	return this;
};


/**

Example:
	["phill", "michi", "walter", "christian" ].sequence( "odd", "even" ).each(function( sequence, el ){
		console.log( "style: " +  sequence + " ; el: " + el );
	});
	
Result:
	style: odd ; el: phill
	style: even ; el: michi
	style: odd ; el: walter
	style: even ; el: christian
	
*/