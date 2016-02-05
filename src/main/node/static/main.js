(function ($) {
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            console.log(this.name + " " + this.value);
            if (this.value) {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            }
        });
        return o;
    };

    function fixNested(data) {
        var fixed = {};
        $.each(data, function(name, value) {
            if(name.indexOf(".") > -1) {
                var parts = name.split(".");
                if(fixed[parts[0]] == undefined) {
                    fixed[parts[0]] = {};
                }
                fixed[parts[0]][parts[1]] = value;
            }
            else {
                fixed[name] = value;
            }
        });
        return fixed;
    }

    $(function () {
        var user = getCredentials();
        $("#loggedin abbr").text(" " + user);

        $("#logout").click(function () {
            logout();
        });

        $("#create").click(function () {
            var user = localStorage.getItem("user");
            create(user, function (data) {
                load(data.id, data.version);
            });
        });

        load(window.location.hash.substring(1));

        $("form").on("submit", function (event) {
            event.preventDefault();

            var id = $("#id").val();
            var user = localStorage.getItem("user");
            var data = fixNested($('form').serializeObject());


            var current = $('form').data("current") || {};

            var diff = jsonpatch.compare(current, data);
            if(diff.length < 1) {
                $("#debug pre").text("Data has not changed.:\n");
                return;
            }

            $("#debug pre").text("Sending:\n" + JSON.stringify(diff));

            console.log("Storing: %s with user %s", JSON.stringify(diff), user);

            store(id, user, diff, function (data) {
                load(data.id, data.version);
            });

        });
    });


    function create(user, callback) {
        var url = "http://benjohan.finn.no:4730/ad/";

        $.ajax(url, {
            beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':password'));
            }
            , data: {}
            , type: 'POST'
            , success: function (data) {
                callback(data);
            }
        });
    }

    function store(id, user, diff, callback) {
        var url = "http://benjohan.finn.no:4730/ad/" + id;

        $.ajax(url, {
            beforeSend: function (req) {
                req.setRequestHeader('Authorization', 'Basic ' + btoa(user + ':password'));
            }
            , data: JSON.stringify(diff)
            , contentType: 'application/json'
            , type: 'PUT'
            , success: function (data) {
                callback(data);
            }
        });
    }

    function getCredentials() {
        var user = localStorage.getItem("user");
        if (!user) {
            user = prompt("Please \"Log in\"", "");
            localStorage.setItem("user", user);
            $("#loggedin abbr").text(" " + user);
        }
        return user;
    }

    function logout() {
        localStorage.removeItem("user");
        getCredentials();
    }


    function load(id, version) {

        var url = "http://benjohan.finn.no:4730/ad/" + id;
        if (version) {
            url += "/" + version;
        }


        $.getJSON(url,
            function (data) {
                window.location.hash = data.id;
                $("form").data("current", data.data);

                $("#id").val(data.id);
                if (!data.data) {
                    data.data = {};
                }

                if (!data.data.contact) {
                    data.data.contact = {};
                }

                $("#title").val(data.data.title);
                $("#description").val(data.data.description);
                $("#price").val(data.data.price);
                $("#contactname").val(data.data.contact.name);
                $("#contactemail").val(data.data.contact.email);


                $("#versiontable tbody").empty();

                $.each(data.versions, function (index, value) {
                    var row = $("<tr/>").appendTo("#versiontable tbody");
                    if (value.id == version) {
                        row.addClass("success");
                    }
                    $("<td/>", {text: value.root}).appendTo(row);
                    $("<td/>", {text: value.id}).appendTo(row);
                    $("<td/>", {text: value.created}).appendTo(row);
                    $("<td/>", {text: value.username}).appendTo(row);

                    row.click(function () {
                        load(id, value.id);
                    });

                });
            });

    }
})(jQuery);