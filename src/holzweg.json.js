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
