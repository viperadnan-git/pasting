var post_options = {
    "url": "/api",
    "method": "POST",
    "timeout": 0,
    "headers": {
        "Content-Type": "application/json"
    }
};
$("#save").click(function() {
    $("#save").html(`<div class="spinner-border text-light spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>`);
    post_options.data = JSON.stringify({
        "heading": $("#heading").text(),
        "content": $("#inputext").val(),
        "code": $("#is-code").is(":checked") ? true: false,
        "raw": $("#is-raw").is(":checked") ? true: false,
        "footer": $("#is-footer").is(":checked") ? true: false
    });
    $.ajax(post_options).done(function (response) {
        window.location.href = response;
    }).fail(function(request, status, error) {
        alert(`${request.status} ${status} - ${error}`);
        $("#save").html(`<img width="24" src="assets/images/save.png">`);
    });
});
$("#inputext").keyup(function() {
    if (!$("#content").hasClass("d-none")) {
        if ($("#is-code").is(":checked")) {
            $("#content").html("<pre><xmp id='code'></xmp></pre>");
            $("#code").text($(this).val());
        } else {
            $("#content").html(marked($(this).val()));
        }
    }
});
$("#live-output").click(function() {
    if ($(this).is(":checked")) {
        $("#inputext").css("height", (screen.height / 1.6) + "px");
        $("#content").addClass("d-none");
    } else {
        $("#inputext").css("height", "180px");
        $("#content").removeClass("d-none");
    }
});

$('#upload-file').change((event) => {
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
        readFileContent(input.files[0]).then(content => {
            $("#inputext").val(content);
        }).catch(error => alert(error));
    }
});
function readFileContent(file) {
    const reader = new FileReader();
    if (file.type.includes("image")) {
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve("<img src=\""+event.target.result+"\" alt=\"image\" class=\"w-100\"/>");
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    } else {
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    }
}