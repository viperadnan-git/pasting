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

function copyToClipboard(id) {
    var range = document.createRange();
    range.selectNode(document.getElementById(id));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
}

const copyButton = $('#copy-content');
copyButton.click(function (e) { 
    e.preventDefault();
    copyToClipboard('content')
    Toast.fire({
        icon: "success",
        title: "Copied Successfully",
        text: "Text copied to clipboard successfully."
    })
});