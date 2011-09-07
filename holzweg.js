(function(window, undefined){
	
	var holzweg = {};


	holzweg.base = function(){}
	
	holzweg.base.extend = function( instance, static ){
		var extend = holzweg.base.prototype.extend;
	
		holzweg.base._prototyping = true;
	
		var proto = new this;
		extend.call(proto, instance);
	
		proto.base = function() {};
	
		delete holzweg.base._prototyping;
	
		var constructor = proto.constructor;
		var klass = proto.constructor = function() {
			if (!holzweg.base._prototyping) {
				if (this._constructing || this.constructor == klass) { 
					this._constructing = true;
					constructor.apply(this, arguments);
					delete this._constructing;
				} else if (arguments[0] != null) { 
					return (arguments[0].extend || extend).call(arguments[0], proto);
				}
			}
		};
	
		klass.ancestor = this;
		klass.extend = this.extend;
		klass.forEach = this.forEach;
		klass.implement = this.implement;
		klass.prototype = proto;
		klass.toString = this.toString;
		klass.valueOf = function(type) {
			return (type == "object") ? klass : constructor.valueOf();
		};
		extend.call(klass, static );
	
		if (typeof klass.init == "function") klass.init();
		return klass;
	}
	
	holzweg.base.prototype = {	
		extend: function(source, value) {
			if (arguments.length > 1) { 
				var ancestor = this[source];
				if (ancestor && (typeof value == "function") && 
					(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
					/\bbase\b/.test(value)) {
				
					var method = value.valueOf();
			
					value = function() {
						var previous = this.base || Base.prototype.base;
						this.base = ancestor;
						var returnValue = method.apply(this, arguments);
						this.base = previous;
						return returnValue;
					};
			
					value.valueOf = function(type) {
						return (type == "object") ? value : method;
					};
					value.toString = Base.toString;
				}
				this[source] = value;
			} else if (source) { 
				var extend = holzweg.base.prototype.extend;
		
				if (!holzweg.base._prototyping && typeof this != "function") {
					extend = this.extend || extend;
				}
				var proto = {toSource: null};
		
				var hidden = ["constructor", "toString", "valueOf"];
		
				var i = holzweg.base._prototyping ? 0 : 1;
				while (key = hidden[i++]) {
					if (source[key] != proto[key]) {
						extend.call(this, key, source[key]);
	
					}
				}
				for (var key in source) {
					if (!proto[key]) extend.call(this, key, source[key]);
				}
			}
			return this;
		}
	};
	holzweg.base = holzweg.base.extend({
		constructor: function() {
			this.extend(arguments[0]);
		}
	}, {
		ancestor: Object,
	
		forEach: function(object, block, context) {
			for (var key in object) {
				if (this.prototype[key] === undefined) {
					block.call(context, object[key], key, object);
				}
			}
		},
	
		implement: function() {
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "function") {
					arguments[i](this.prototype);
				} else {
					this.prototype.extend(arguments[i]);
				}
			}
			return this;
		},
	
		toString: function() {
			return String(this.valueOf());
		}
	});


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


	//     keymaster.js
	//     (c) 2011 Thomas Fuchs
	//     keymaster.js may be freely distributed under the MIT license.
	
	;(function(global){
	  var k,
	    _handlers = {},
	    _mods = { 16: false, 18: false, 17: false, 91: false },
	    _scope = 'all',
	    // modifier keys
	    _MODIFIERS = {
	      '⇧': 16, shift: 16,
	      option: 18, '⌥': 18, alt: 18,
	      ctrl: 17, control: 17,
	      command: 91, '⌘': 91
	    },
	    // special keys
	    _MAP = {
	      backspace: 8, tab: 9, clear: 12,
	      enter: 13, 'return': 13,
	      esc: 27, escape: 27, space: 32,
	      left: 37, up: 38,
	      right: 39, down: 40,
	      del: 46, 'delete': 46,
	      home: 36, end: 35,
	      pageup: 33, pagedown: 34,
	      ',': 188, '.': 190, '/': 191,
	      '`': 192, '-': 189, '=': 187,
	      ';': 186, '\'': 222,
	      '[': 219, ']': 221, '\\': 220  
	    };
	
	  for(k=1;k<20;k++) _MODIFIERS['f'+k] = 111+k;
	
	  // IE doesn't support Array#indexOf, so have a simple replacement
	  function index(array, item){
	    var i = array.length;
	    while(i--) if(array[i]===item) return i;
	    return -1;
	  }
	
	  // handle keydown event
	  function dispatch(event){
	    var key, tagName, handler, k, i, modifiersMatch;
	    tagName = (event.target || event.srcElement).tagName;
	    key = event.keyCode;
	
	    // if a modifier key, set the key.<modifierkeyname> property to true and return
	    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
	    if(key in _mods) {
	      _mods[key] = true;
	      // 'assignKey' from inside this closure is exported to window.key
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
	      return;
	    }
	
	    // ignore keypressed in any elements that support keyboard data input
	    if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA') return;
	
	    // abort if no potentially matching shortcuts found
	    if (!(key in _handlers)) return;
	
	    // for each potential shortcut
	    for (i = 0; i < _handlers[key].length; i++) {
	      handler = _handlers[key][i];
	
	      // see if it's in the current scope
	      if(handler.scope == _scope || handler.scope == 'all'){
	        // check if modifiers match if any
	        modifiersMatch = handler.mods.length > 0;
	        for(k in _mods)
	          if((!_mods[k] && index(handler.mods, +k) > -1) ||
	            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
	        // call the handler and stop the event if neccessary
	        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
	          if(handler.method(event, handler)===false){
	            if(event.preventDefault) event.preventDefault();
	              else event.returnValue = false;
	            if(event.stopPropagation) event.stopPropagation();
	            if(event.cancelBubble) event.cancelBubble = true;
	          }
	        }
	      }
		}
	  };
	
	  // unset modifier keys on keyup
	  function clearModifier(event){
	    var key = event.keyCode, k;
	    if(key == 93 || key == 224) key = 91;
	    if(key in _mods) {
	      _mods[key] = false;
	      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
	    }
	  };
	
	  // parse and assign shortcut
	  function assignKey(key, scope, method){
	    var keys, mods, i, mi;
	    if (method === undefined) {
	      method = scope;
	      scope = 'all';
	    }
	    key = key.replace(/\s/g,'');
	    keys = key.split(',');
	
	    if((keys[keys.length-1])=='')
	      keys[keys.length-2] += ',';
	    // for each shortcut
	    for (i = 0; i < keys.length; i++) {
	      // set modifier keys if any
	      mods = [];
	      key = keys[i].split('+');
	      if(key.length > 1){
	        mods = key.slice(0,key.length-1);
	        for (mi = 0; mi < mods.length; mi++)
	          mods[mi] = _MODIFIERS[mods[mi]];
	        key = [key[key.length-1]];
	      }
	      // convert to keycode and...
	      key = key[0]
	      key = _MAP[key] || key.toUpperCase().charCodeAt(0);
	      // ...store handler
	      if (!(key in _handlers)) _handlers[key] = [];
	      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
	    }
	  };
	
	  // initialize key.<modifier> to false
	  for(k in _MODIFIERS) assignKey[k] = false;
	
	  // set current scope (default 'all')
	  function setScope(scope){ _scope = scope || 'all' };
	
	  // cross-browser events
	  function addEvent(object, event, method) {
	    if (object.addEventListener)
	      object.addEventListener(event, method, false);
	    else if(object.attachEvent)
	      object.attachEvent('on'+event, function(){ method(window.event) });
	  };
	
	  // set the handlers globally on document
	  addEvent(document, 'keydown', dispatch);
	  addEvent(document, 'keyup', clearModifier);
	
	  // set window.key and window.key.setScope
	  global.key = assignKey;
	  global.key.setScope = setScope;
	
	  if(typeof module !== 'undefined') module.exports = key;
	
	})(holzweg);


	holzweg.json = {};
	
	holzweg.json.parse = function( data ){
		return (new Function( "return " + data ))();
	}
	
	holzweg.json.stringify = JSON.stringify || function ( obj ) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			if (t == "string") obj = '"'+obj+'"';
			return String(obj);
		}
		else {
			var n, v, json = [], arr = (obj && obj.constructor == Array);
			for (n in obj) {
				v = obj[n]; t = typeof(v);
				if (t == "string") v = '"'+v+'"';
				else if (t == "object" && v !== null) v = JSON.stringify(v);
				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	};
	


	holzweg.tmplCache = {};
	
	holzweg.tmpl = function(str, data){
		
		var fn = !/\W/.test(str) ?
			holzweg.tmplCache[str] = holzweg.tmplCache[str] ||
			holzweg.tmpl(document.getElementById(str).innerHTML) :
		
		new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
			
			"with(obj){p.push('" +
			
			str
				.replace(/[\r\t\n]/g, " ")
				.split("<?").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("?>").join("p.push('")
				.split("\r").join("\\'")
		+ "');}return p.join('');");
		
		return data ? fn( data ) : fn;
	};
	
	holzweg.microtmpl = function( template, data ){
		for( var key in data )
			template = template.replace( new RegExp('{'+key+'}','g'), data[key] );
		return template;
	}


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


	holzweg.lang = {};
	
	holzweg.lang.activeLanguage_ = undefined;
	
	
	holzweg.lang.setLang = function( lang ){
		holzweg.lang.activeLanguage_ = lang;
		return holzweg.lang;
	}
	
	holzweg.lang.getLang = function(){
		return holzweg.lang.activeLanguage_;
	}
	
	holzweg.lang.addLang = function( lang, translations ){
		holzweg.lang[ lang ] = {};
		
		holzweg.lang.addTranslations( lang, translations );
		return holzweg.lang;
	}
	
	holzweg.lang.addTranslation = function( lang, source, translation ){
		holzweg.lang[ lang ][ source ] = translation;
		return holzweg.lang;
	}
	
	holzweg.lang.addTranslations = function( lang, translations ){
		for( var i = 0, tr; tr = translations[ i ]; i++ )
			holzweg.lang.addTranslation( lang, tr.source, tr.translation );
		return holzweg.lang;
	}
	
	holzweg.lang.translate = function( source, opt_templateVars ){
		
		var translation = holzweg.lang[ holzweg.lang.getLang() ][ source ];
		
		if( ! opt_templateVars )
			return translation;
		
		return holzweg.microtmpl( translation, opt_templateVars );
	}
	
	holzweg.translate = holzweg.lang.translate;
	holzweg.setLang   = holzweg.lang.setLang;
	holzweg.getLang   = holzweg.lang.getLang;
	holzweg.addLang   = holzweg.lang.addLang;
	

	window.holzweg = window.hw = holzweg;

})(window);


	
if( typeof console != "object" ){
	var fn = ["log","info","warn","clear","debug","group","groupCollapsed","groupEnd","time","timeEnd","profile","profileEnd"];
	console = {};
	for( var i = 0; i < fn.length; i++ )
		console[ fn[ i ] ] = function(){};
}

