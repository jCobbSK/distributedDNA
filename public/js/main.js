$(document).ready(function(){
  /**
   * Admin page scripts
   */

  $('#createUserSubmit').click(function(){
    var username = $('#username').val();
    var password1 = $('#password1').val();
    var password2 = $('#password2').val();
    var email = $('#email').val();
    var isClient = $('#client').is(':checked')?true:false;

    //validation
    var valid = true;
    if (!username || username.length < 4) {
      valid = false;
      $('#username').addClass('invalid');
    }

    if (!password1 || !password2 || password1 != password2) {
      valid = false;
      $('#password1').addClass('invalid');
      $('#password2').addClass('invalid');
    }

    if (!email || $('#email').hasClass('invalid')) {
      if (!email)
        $('#email').addClass('invalid');
      valid = false;
    }

    if (!valid)
      return;

    $.ajax({
      url: '/users/register',
      type: 'POST',
      data: {
        username: username,
        password: password1,
        email: email,
        isClient: isClient
      },
      success: function() {
        window.location = '/';
      },
      error: function() {
        alert('Some error during creation');
      }
    })
  });

  /**
   * //Aadmin page scripts
   */

  /**
   * Set task (create sample)
   */

  $('#createSample').click(function(){
    //TODO validation of fields
    $('#setTaskForm').submit();
  });

  /**
   * //Set task
   */
})

