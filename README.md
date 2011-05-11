holzweg.js
==========

JavaScript Micro Library Collection für Holzweg.


Thanks to
---------

* Thomas Fuchs < @thomasfuchs > for the Tweet-Sized Template Function - http://bit.ly/i2R6f3
* John Resig < @jeresig > for the Template Function - http://bit.ly/Dqa4
* Dean Edwards for the Base Class - http://bit.ly/Hztrk



Build Script
------------

`php build.php intro,base,json,tmpl,pubsub,lang,outro`


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





