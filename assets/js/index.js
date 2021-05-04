var post_options = {
  "url": "/api",
  "method": "POST",
  "timeout": 0,
  "headers": {
    "Content-Type": "text/plain"
  }
};
$("#save").click(function() {
  post_options.data = JSON.stringify({
          "heading": $("#heading").text(),
          "body": $("#is-code").is(":checked") ? "<pre>" + $("#inputext").val() + "</pre>" : $("#inputext").val(),
          "footer": $("#is-footer").is(":checked") ? false : true
        });
  $.ajax(post_options).done(function (response) {
    window.location.href = response;
  }).fail(function(response) {
    alert(response.status);
  });
});
$("#inputext").keyup(function() {
  $("#body").show().html(marked($("#is-code").is(":checked")?"<pre>"+$("#inputext").val()+"</pre>": $("#inputext").val()))});