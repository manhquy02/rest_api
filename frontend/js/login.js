
$('form').submit(function (e) {
            e.preventDefault();
            $.post('http://localhost:5555/login', {
                email: this.email.value,
                password: this.password.value
            }, function (response) {
                console.log(response);
                alert(response.message);

                if (response.token) {
                    localStorage.setItem('access_token', response.token);
                    console.log('token saved to localStorage')

                    if(response.user){
                        localStorage.setItem('user',JSON.stringify(response.user))
                    }
                window.location.href = 'index.html'
                }
            });
        });