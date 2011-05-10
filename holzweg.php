<?php
$files = explode(",", $argv[1] );

$output = "";

foreach( $files as $file ){
    $c = file_get_contents( "src/holzweg.$file.js" );
    
    if( ! in_array( $file, array( "intro", "outro" ) ) )
        $c = str_replace( PHP_EOL, PHP_EOL . "\t", PHP_EOL . $c );
    
    
    $output .= $c . PHP_EOL . PHP_EOL;
}


echo $output;