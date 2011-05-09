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