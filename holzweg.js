(function(window, undefined){
	
	var holzweg = {};


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
	
	holzweg
		.addLang("de",[{source:"hello",translation:"Hallo {username}"}])
		.addLang("en",[{source:"hello",translation:"Hello {username}"}])
		.setLang("de");
		
	console.log( holzweg.translate( "hello", {username: "Phillip"} ) );	
	console.log( holzweg.setLang("en").translate( "hello", {username: "Phillip"} ) );

	window.holzweg = window.hw = holzweg;

})(window);


	
if( typeof console != "object" ){
	var fn = ["log","info","warn","clear","debug","group","groupCollapsed","groupEnd","time","timeEnd","profile","profileEnd"];
	console = {};
	for( var i = 0; i < fn.length; i++ )
		console[ fn[ i ] ] = function(){};
}

