/*!!
 * Crossroads - JavaScript Routes
 * Released under the MIT license <http://www.opensource.org/licenses/mit-license.php>
 * @author Miller Medeiros
 * @version 0.3
 * @build 18 (05/03/2011 04:01 AM)
 */
(function(global){
		
	var crossroads,
		Route,
		patternLexer,
		_toString = Object.prototype.toString;
	
	// Helpers -----------
	//====================
	
	function arrayIndexOf(arr, val){
		var n = arr.length;
		//Array.indexOf doesn't work on IE 6-7
		while(n--){
			if(arr[n] === val) return n;
		}
		return -1;
	}
	
	function isType(type, val){
		return '[object '+ type +']' === _toString.call(val);
	}
	
	function isRegExp(val){
		return isType('RegExp', val);
	}
	
	function isArray(val){
		return isType('Array', val);
	}
	
	function isFunction(val){
		return isType('Function', val);
	}
			
	// Crossroads --------
	//====================
	
	crossroads = (function(){
		
		var _routes = [],
			_bypassed = new signals.Signal(),
			_routed = new signals.Signal();
		
		function addRoute(pattern, callback, priority){
			var route = new Route(pattern, callback, priority);
			sortedInsert(route);
			return route;
		}
		
		function sortedInsert(route){
			//simplified insertion sort
			var n = getNumRoutes();
			do { --n; } while (_routes[n] && route._priority <= _routes[n]._priority);
			_routes.splice(n+1, 0, route);
		}
		
		function getNumRoutes(){
			return _routes.length;
		}
		
		function removeRoute(route){
			var i = getRouteIndex(route);
			if(i >= 0) _routes.splice(i, 1);
			route._destroy();
		}
		
		function getRouteIndex(route){
			return arrayIndexOf(_routes, route);
		}
		
		function removeAllRoutes(){
			var n = getNumRoutes();
			while(n--){
				_routes[n]._destroy();
			}
			_routes.length = 0;
		}
		
		function parse(request){
			request = request || '';
			var route = getMatchedRoute(request),
				params = route? getParamValues(request, route) : null;
			if(route){
				params? route.matched.dispatch.apply(route.matched, params) : route.matched.dispatch();
				_routed.dispatch(request, route, params);
			}else{
				_bypassed.dispatch(request);
			}
		}
		
		function getMatchedRoute(request){
			var i = getNumRoutes(), route;
			while(route = _routes[--i]){ //should be decrement loop since higher priorities are added at the end of array  
				if(route.match(request)) return route;
			}
			return null;
		}
		
		function getParamValues(request, route){
			return patternLexer.getParamValues(request, route._matchRegexp);
		}
		
		//API
		return {
			_routes : _routes,
			addRoute : addRoute,
			removeRoute : removeRoute,
			removeAllRoutes : removeAllRoutes,
			parse : parse,
			bypassed : _bypassed,
			routed : _routed,
			getNumRoutes : getNumRoutes,
			toString : function(){
				return '[crossroads numRoutes:'+ getNumRoutes() +']';
			}
		};
		
	}());
	
			
	// Route --------------
	//=====================
	 
	Route = function (pattern, callback, priority){
		this._pattern = pattern;
		this._matchRegexp = isRegExp(pattern)? pattern : patternLexer.compilePattern(pattern);
		this.matched = new signals.Signal();
		if(callback) this.matched.add(callback);
		this._priority = priority || 0;
	};
	
	Route.prototype = {
		
		rules : void(0),
		
		match : function(request){
			return this._matchRegexp.test(request) && (isRegExp(this._pattern) || this._validateParams(request)); //if regexp no need to validate params
		},
		
		_validateParams : function(request){
			var rules = this.rules, 
				prop;
			for(prop in rules){
				if(rules.hasOwnProperty(prop)){ //filter prototype
					if(! this._isValidParam(request, prop) ) return false;
				}
			}
			return true;
		},
		
		_isValidParam : function(request, prop){
			var validationRule = this.rules[prop],
				values = this._getParamValuesObject(request),
				val = values[prop],
				isValid;
			
			if(isRegExp(validationRule)){
				isValid = validationRule.test(val);
			}else if(isArray(validationRule)){
				isValid = arrayIndexOf(validationRule, val) !== -1;
			}else if(isFunction(validationRule)){
				isValid = validationRule(val, request, values);
			}
			
			return isValid || false; //fail silently if validationRule is from an unsupported type
		},
		
		_getParamValuesObject : function(request){
			var ids = patternLexer.getParamIds(this._pattern),
				values = patternLexer.getParamValues(request, this._matchRegexp),
				o = {}, 
				n = ids.length;
			while(n--){
				o[ids[n]] = values[n];
			}
			return o;
		},
		
		dispose : function(){
			crossroads.removeRoute(this);
		},
		
		_destroy : function(){
			this.matched.dispose();
			this.matched = this._pattern = this._matchRegexp = null;
		},
		
		toString : function(){
			return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
		}
		
	};
	
	
	// Pattern Lexer ------
	//=====================
	
	patternLexer = crossroads.patternLexer = (function(){

		var ESCAPE_CHARS_REGEXP = /[\\\.\+\*\?\^\$\[\]\(\)\{\}\/\'\#]/g,
			SEGMENT_REGEXP = /([^\/]+)/,
			PARAMS_REGEXP = /\{([^\}]+)\}/g,
			SAVE_PARAMS = '___CR_PARAM___',
			SAVED_PARAM_REGEXP = new RegExp(SAVE_PARAMS, 'g');
		
		function getParamIds(pattern){
			var ids = [], match;
			while(match = PARAMS_REGEXP.exec(pattern)){
				ids.push(match[1]);
			}
			return ids;
		}
	
		function compilePattern(pattern){
			pattern = pattern? saveParams(pattern) : '';
			pattern = escapePattern(pattern); //make sure chars that need to be escaped are properly converted
			pattern = convertSavedParams(pattern);
			return new RegExp('^'+ pattern + '$');
		}
		
		function saveParams(pattern){
			return pattern.replace(PARAMS_REGEXP, SAVE_PARAMS);
		}
		
		function convertSavedParams(pattern){
			return pattern.replace(SAVED_PARAM_REGEXP, SEGMENT_REGEXP.source);
		}
		
		function escapePattern(pattern){
			return pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
		}
		
		function getParamValues(request, regexp){
			var vals = regexp.exec(request);
			if(vals){
				vals.shift();
				vals = typecastValues(vals);
			}
			return vals;
		}
		
		function typecastValues(values){
			var n = values.length, 
				result = [],
				val;
			while(val = values[--n]){
				result[n] = (val === null || val === '' || isNaN(val))? val : parseFloat(val); //parseFloat(null || '') returns NaN
			}
			return result;
		}
		
		//API
		return {
			getParamIds : getParamIds,
			getParamValues : getParamValues,
			compilePattern : compilePattern
		};
	
	}());
	
	global.routes = crossroads;
	
}( holzweg ));