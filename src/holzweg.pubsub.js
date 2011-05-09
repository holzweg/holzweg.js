holzweg.pubsub = {};

holzweg.pubsub.cache = {};

holzweg.pubsub.publish = function( topic, opt_args, opt_scope ){
	
	var subscribers = holzweg.pubsub.cache[ topic ],
		len = subscribers ? subscribers.length : 0;
	
	while( len-- )
		subscribers[ len ].callback.apply( subscribers[ len ].scope || opt_scope || this, opt_args || [] );
	
}

holzweg.pubsub.subscribe = function( topic, callback, opt_scope ){
	if( ! holzweg.pubsub.cache[ topic ] )
		holzweg.pubsub.cache[ topic ] = [];
	
	holzweg.pubsub.cache[ topic ].push( {
		callback: callback,
		scope: opt_scope || {}
	} );
	
	return [ topic, callback, opt_scope ];
}

holzweg.pubsub.unsubscribe = function( handle ){
	var subscribers = holzweg.pubsub.cache[ handle[0] ],
		callback = handle[1],
		len = subscribers ? subscribers.length : 0;

	while( len-- ){
		if( subscribers[len].callback === callback ){
			subscribers.splice( len, 1 );
		}
	}
}


holzweg.publish     = holzweg.pubsub.publish;
holzweg.subscribe   = holzweg.pubsub.subscribe;
holzweg.unsubscribe = holzweg.pubsub.unsubscribe;