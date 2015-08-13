
(function($) {
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(function() {
    //load("boat-dock.json");
    load("car-used.json");

    //alert((123).toString(36) + " => " + parseInt("kf12oi", 36)); // "kf12oi"
     // 12345

});


    function createField(field) {
        if(field.type == "COMPLEX") {
            var fieldset = $("<fieldset/>", {class: ""});
            $("<legend/>", {"text": field.description}).appendTo(fieldset);

            $.each(field.children, function(i, v) {
                createInput(v).appendTo(fieldset);
            });
            return fieldset;
        }
        else {
            return createInput(field);
        }
    }


    function createInput(value) {
        var group = $("<div/>", {class: "form-group"});
        if(value.mandatory) {
            group.addClass("has-error");
        }

        $("<label/>", {"for": value.name, "text" : value.description}).appendTo(group);

        if(value.type == "ENUM") {

            var select = $("<select/>", {"name": value.name, "class": "form-control"}).appendTo(group);
            if(value["multi-value"]) {
                select.attr("multiple", true);
            }
            $.each(value.values, function(i, v) {
                $("<option/>", {"value": v.code, "text": v.label}).appendTo(select);
            });
        }
        else if(value.type == "NUMBER") {
            $("<input/>", {"type": "number", "name": value.name, "class": "form-control"}).appendTo(group);
        }
        else if(value.type == "BOOLEAN") {
            $("<input/>", {"type": "checkbox", "name": value.name, "class": "form-control"}).appendTo(group);
        }
        else {
            $("<input/>", {"name": value.name, "class": "form-control"}).appendTo(group);
        }


        //$("<pre/>", {"text": JSON.stringify(value)}).appendTo(group);
        return group;
    }

    function load(file) {
        var url = "http://localhost:4730/" + file;

        $.getJSON(url,
            function(data) {
                $.each(data["field-definitions"], function( index, field ) {
                    createField(field).appendTo("form");
                });
            });
    }
} )(jQuery);