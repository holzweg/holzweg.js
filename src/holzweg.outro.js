	window.holzweg = window.hw = holzweg;

})(window);


	
if( typeof console != "object" ){
	var fn = ["log","info","warn","clear","debug","group","groupCollapsed","groupEnd","time","timeEnd","profile","profileEnd"];
	console = {};
	for( var i = 0; i < fn.length; i++ )
		console[ fn[ i ] ] = function(){};
}