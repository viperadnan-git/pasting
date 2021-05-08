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