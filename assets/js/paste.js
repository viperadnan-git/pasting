$("#heading").text(json.heading);
if (json.raw) {
  $("#raw-button").removeClass("d-none");
}
if (json.code) {
  $("#body").html("<pre id='code'></pre>");
  $("#code").text(json.body);
} else {
  $("#body").html(marked(json.body));
}
if (json.footer) {
  $("#is-footer").removeClass("d-none");
}
document.title = json.heading;