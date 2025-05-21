$('form').submit(function (e) {
    e.preventDefault();
    $.post('http://localhost:5555/register', {
        username: this.username.value,
        email: this.email.value,
        password: this.password.value
    }, function (response) {
        console.log(response);
        alert(response.message);
        window.location.href ='login.html';
    }

    );

});