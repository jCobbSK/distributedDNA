/**
 * Script providing automatic refreshing of client's results on results page.
 * It calls getresults route for updates every 2 secs and update results table accordingly.
 */
$(document).ready(function(){
  setInterval(function(){
    $.ajax({
      url: '/getresults'
    })
      .done(function(res){
        if (res) {
          location.reload();
        }
      })
      .fail(function(err){
        alert('Something went wrong... ' + err);
      })
  }, 5000);
});