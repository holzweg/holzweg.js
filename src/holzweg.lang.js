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
