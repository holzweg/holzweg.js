<?php

$minify = @ $argv[ 1 ] == "--min";

$files = "intro,base,loops,keys,mouse,routes,json,tmpl,pubsub,lang,outro";

$output = "";

foreach( explode( ",", $files ) as $file ){
    $c = file_get_contents( "src/holzweg.$file.js" );
    
    if( ! in_array( $file, array( "intro", "outro" ) ) )
        $c = str_replace( PHP_EOL, PHP_EOL . "\t", PHP_EOL . $c );
    
    
    $output .= $c . PHP_EOL . PHP_EOL;
}

file_put_contents( "holzweg.js", $output );

if( $minify )
    `java -jar bin/compiler.jar --js holzweg.js --js_output_file holzweg-min.js`;
