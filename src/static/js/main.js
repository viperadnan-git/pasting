const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    // timerProgressBar: true,
    showCloseButton: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})


const rawRadio = $('#is-raw');
const codeRadio = $('#is-code');
const liveOutputRadio = $('#live-output');
const inputTextarea = $("#inputext");
const contentDiv = $('#content');
const saveButton = $("#save");


$(document).ready((event) => {
    [
        {
            'id': 'is-raw',
            'jqObj': rawRadio
        },
        {
            'id': 'is-code',
            'jqObj': codeRadio
        },
        {
            'id': 'live-output',
            'jqObj': liveOutputRadio
        }
    ].forEach((value, index, arr) => {
        if (Cookies.get(value.id) == 'true') {
            if (value.id == 'live-output') {
                value.jqObj.click()
            } else {
                value.jqObj.prop("checked", true);
            }
        } else if (Cookies.get(value.id) == 'false') {
            value.jqObj.prop("checked", false);
        }
        if (value.id != 'live-output') {
            value.jqObj.click((event) => {
                if (value.jqObj.is(":checked")) {
                    Cookies.set(value.id, 'true', { expires: 365 })
                } else {
                    Cookies.set(value.id, 'false', { expires: 365 })
                }
            })
        }
    })
})


saveButton.click(function () {
    saveButton.html(`<div class="spinner-border text-light spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>`);
    inputData = {
        "heading": $("#heading").text(),
        "content": inputTextarea.val(),
        "code": codeRadio.is(":checked") ? true : false,
        "raw": rawRadio.is(":checked") ? true : false,
        "key": $("#key-name").val()
    }
    // if ($("#key-name").val()) {
    //     inputData.key = 
    // }
    $.ajax({
        "url": "/api",
        "method": "POST",
        "timeout": 0,
        "data": JSON.stringify(inputData),
        "headers": {
            "Content-Type": "application/json"
        }
    }).done((response) => {
        window.location.href = '/' + response.key;
    }).fail((request, status, error) => {
        let errorMessage = request.responseText;
        try {
            errorMessage = JSON.parse(errorMessage).error
        } catch (e) { console.log(e); }
        Toast.fire({
            title: error,
            text: errorMessage,
            icon: 'error'
        })
    }).always(() => {
        saveButton.html(`<img src="/static/images/save.svg"/>`);
    })
});


inputTextarea.keyup(function () {
    if (!contentDiv.hasClass("d-none")) {
        if (codeRadio.is(":checked")) {
            contentDiv.html("<pre><xmp id='code'></xmp></pre>");
            $("#code").text($(this).val());
        } else {
            contentDiv.html(marked.parse($(this).val()));
        }
    }
});


liveOutputRadio.click(function () {
    if (liveOutputRadio.is(":checked")) {
        inputTextarea.css("height", (screen.height / 1.5) + "px");
        contentDiv.addClass("d-none");
        Cookies.set('live-output', 'true', { expires: 365 })
    } else {
        inputTextarea.css("height", (screen.height / 3) + "px");
        contentDiv.removeClass("d-none");
        Cookies.set('live-output', 'false', { expires: 365 })
    }
});


$('#upload-file').change((event) => {
    const input = event.target;
    if ('files' in input && input.files.length > 0) {
        readFileContent(input.files[0]).then(content => {
            inputTextarea.val(content);
        }).catch(error => alert(error));
    }
});


function readFileContent(file) {
    const reader = new FileReader();
    if (file.type.includes("image")) {
        return new Promise((resolve, reject) => {
            reader.onload = event => resolve("<img src=\"" + event.target.result + "\" alt=\"image\" class=\"w-100\"/>");
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