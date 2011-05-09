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