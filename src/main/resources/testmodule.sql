select plv8_startup();
do language plv8 'load_module("jsonpatch");';
do language plv8 $$

var myobj = { firstName:"Albert", contactDetails: { phoneNumbers: [ ] } };
var patches = [
   {op:"replace", path:"/firstName", value:"Joachim" },
   {op:"add", path:"/lastName", value:"Wester" },
   {op:"add", path:"/contactDetails/phoneNumbers/0", value:{ number:"555-123" }  }
   ];
jp.apply( myobj, patches );

plv8.elog(NOTICE, "jsonpatch : " + JSON.stringify(myobj));

$$;