
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
    load(2);

    $("form").on("submit", function( event ) {
        event.preventDefault();

        var id =  $("#id").val();
        var data = $('form').serializeObject();
        var current = $('form').data("current");

        var diff = jsonpatch.compare(current, data);

        console.log("Storing: %s", JSON.stringify(diff));
        store(id, diff, function(data) {
            load(data.id, data.version);
        });

    });
});


    function store(id, diff, callback) {
        var url = "http://localhost:4730/ad/" + id;
        $.ajax(url, {
            data : JSON.stringify(diff)
            ,contentType : 'application/json'
            ,type : 'POST'
            ,success: function (data) {
                callback(data);
            }
        });
    }

    function load(id, version) {

        var url = "http://localhost:4730/ad/" + id;
        if(version) {
            url += "/" + version;
        }


        $.getJSON(url,
            function(data) {
                $("form").data("current", data.data);

                $("#id").val(data.id);
                $("#title").val(data.data.title);
                $("#description").val(data.data.description);
                $("#price").val(data.data.price);

                $("#versiontable tbody").empty();
                $.each(data.versions, function( index, value ) {
                    var row = $("<tr/>").appendTo("#versiontable tbody");
                    if(value.id == version) {
                        row.addClass("success");
                    }
                    $("<td/>", {text: value.id}).appendTo(row);
                    $("<td/>", {text: value.created}).appendTo(row);

                    var actionCell = $("<td/>").appendTo(row);
                    var editButton = $("<button/>", {"text": "Redigér", "type": "button", "class":"btn btn-primary btn-sm"}).appendTo(actionCell);
                    editButton.click(function() {
                        load(id, value.id);
                    });

                });
            });

    }
} )(jQuery);