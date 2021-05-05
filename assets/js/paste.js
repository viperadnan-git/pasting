json.heading ? $("#heading").text(json.heading): $("#heading").text(window.location.hostname);
json.raw ? $("#raw-button").removeClass("d-none") : null;
if (json.code) {
  $("#body").html("<pre id='code'></pre>");
  $("#code").text(json.body);
} else {
  $("#body").html(marked(json.body));
}
json.footer ? $("#is-footer").removeClass("d-none") : null;
json.heading ? document.title = json.heading : document.title = window.location.hostname;