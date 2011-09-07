holzweg.js
==========

JavaScript Micro Library für Holzweg.

Build Script
------------

`php build.php intro,base,loops,keys,mouse,routes,json,tmpl,pubsub,lang,outro`


Plugins
-------


### hw.base

    User = hw.base.extend({
        vorname: "",
        nachname: "",
        constructor: function( vorname, nachname ){
            this.vorname = vorname;
            this.nachname = nachname;
        }
    })
    
    var phillip = new User( "Phillip", "Dornauer" );
    
    phillip.vorname; // "Phillip"

### hw.json

    json.parse( "{abc:123}" ) -> Object({abc:123})

    json.stringify( {abc:123} ) -> String("{abc:123}")


### hw.lang

    hw.addLang( "de", [{
        source: "hallo",
        translation: "Hallo {name}"
    }]).addLang( "en", [{
        source: "hallo",
        translaton: "hello {name}"
    }]).setLang("de");
    
    hw.translate( "hallo", {name: "Phillip"} );  --> String( "Hallo Phillip" )
    hw.setLang("en");
    hw.translate( "hallo", {name: "Phillip"} );  --> String( "hello Phillip" )


### hw.pubsub

    var handle = hw.pubsub.subscribe( "/some/topic", function( msg ){
        console.log( "Nachricht: " + msg );
    });
    
    hw.pubsub.publish( "/some/topic", "msg #1" ); // in der console steht: "Nachricht: msg #1"
    
    hw.pubsub.unsubscribe( handle ); 
    
    hw.pubsub.publish( "/some/topic", "msg #2" ); // in der console steht nichts



### hw.microtmpl

    hw.microtmpl( "Hallo {name}", {name: "Phillip"} ) --> String("Hallo Phillip")

### hw.tmpl

    <script type="text/html" id="hw_template">
      <? for ( var i = 0; i < users.length; i++ ) { ?>
        <li><a href="<?=users[i].url?>"><?=users[i].name?></a></li>
      <? } ?>
    </script>
    
    hw.tmpl("hw_template", {users: [
        {
            name: "Phillip",
            url: "http://phillip.dornauer.cc"
        },
        {
            name: "Mathias",
            url: "http://ailoo.net"
        }
    ]);     

## hw.key

[Documentation on github.com/madrobby/keymasters](https://github.com/madrobby/keymaster)

## Number.times()

    <script>
        // output:
        //  number: 0
        //  ...
        //  number: 4
        (5).times(function( i ){
            console.log( "number: " + i );
        });
    </script>

## Array.sequence, Array.each

#### Array.each
    <script>
        // output:
        //  a, 0
        //  b, 1
        //  c, 2
        //  d, 3
        ["a","b","c","d"].each(function( character, i, arr ){
            console.log( character + ", " + i );
        });
    </script>

#### Array.sequence
    <script>
        // output:
        //  dark, a
        //  light, b
        //  dark, c
        //  light, d
        
        ["a","b","c","d"].sequence( "dark", "light" ).each(function( style, character ){
            console.log( style + ", " + character );
        });
    </script>


