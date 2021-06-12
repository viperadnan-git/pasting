//-------------------------------------
const TOAST_CONTAINER = document.createElement("div");
    TOAST_CONTAINER.id = "toastContainer";
    TOAST_CONTAINER.className = "toast-container position-fixed bottom-0 end-0 m-2";
    TOAST_CONTAINER.setAttribute("aria-live", "polite");
    TOAST_CONTAINER.style.zIndex = 1081;
    document.body.appendChild(TOAST_CONTAINER);
    const TOAST_TEMPLATE = document.createElement("div");
    TOAST_TEMPLATE.className = "toast align-items-center";
    TOAST_TEMPLATE.setAttribute("role", "status");
    TOAST_TEMPLATE.setAttribute("aria-live", "polite");
    TOAST_TEMPLATE.setAttribute("aria-atomic", "true");
    TOAST_TEMPLATE.innerHTML = `<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;

    function Notify(text, style = null) {
        let toast = TOAST_TEMPLATE.cloneNode(true);
        let toastTitle = toast.querySelector(".toast-body");
        toastTitle.innerText = text;
        if (style) {
            toast.className += ` ${style}`;
        }
        TOAST_CONTAINER.appendChild(toast);
        var bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => {
            TOAST_CONTAINER.removeChild(toast);
        });
    }
// -------------------------------------

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
        "footer": $("#is-footer").is(":checked") ? true: false,
        "key": $("#key-name").val() ? $("#key-name").val() : false,
    });
    $.ajax(post_options).done(function (response) {
        window.location.href = response;
    }).fail(function(request, status, error) {
        Notify(`${request.status} - ${request.responseText}`, 'bg-danger text-white');
        $("#save").html(`<img width="24" src="/static/images/save.png">`);
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