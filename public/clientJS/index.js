console.log("Client-side script loaded.");

function loginSignUp(){
    try{
        var decider = document.getElementById('signInSignUp').textContent;
        console.log('decider ',decider);
        if(decider === "Sign in" || decider === "SIGN IN"){
            login();
        }else{
            SignUp();
        }            
    }
    catch(e){
        console.log("Exception In login: "+e);
    }
}

function login(){
    try{
        console.log("Logging In.");        
        var email = document.getElementById('inputEmail').value.toLowerCase(); 
        email = email.trim();        
        var password = document.getElementById('inputPassword').value; 
        password = password.trim();    
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;                 
        var userNameChk = re.test(email);
        var passwordChk = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,16}$/.test(password);
        if(userNameChk && passwordChk){
            var url = "/api/login";
            var data = {
                email,
                password
            }              
            axios.post(url, data)
            .then(function (response) {                 
                if(response.status = 200){
                    console.log('Headers', response.headers);
                    let xAuthToken = response.headers['x-auth-token'];
                    document.cookie = "jwt="+xAuthToken+"email="+email;                  
                    window.location.href = "Dashboard.html";                     
                }else{
                    alert("something wen't wrong. Please try again later.");
                }                                                                               
            })
            .catch(function (error) {
                console.log(error);
            });    
        }else{
            if(!userNameChk && !passwordChk){
                console.log("Invalid format: Username & Password");
            }else if(!userNameChk)            {
                console.log("Invalid format: Username");
            }else if(!passwordChk){
                console.log("Invalid format: Password");
            }            
        }  
    }catch(e){
        console.log("Exception In login: "+e);
    }
}

function SignUp(){
    try{
        console.log("Signing Up.");
        var username = document.getElementById('inputUsername').value.toLowerCase(); 
        username = username.trim(); 
        var email = document.getElementById('inputEmail').value.toLowerCase(); 
        email = email.trim();                
        var password = document.getElementById('inputPassword').value; 
        password = password.trim(); 
        var confirm_password = document.getElementById('inputConfirmPassword').value; 
        confirm_password = confirm_password.trim();         
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;                 
        var userNameChk = re.test(email);
        var passwordChk = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,16}$/.test(password);
        if(userNameChk && passwordChk){
            if(password === confirm_password){
                var url = "/api/signup";
                var data = {
                    username,
                    password,
                    email
                }  
                axios.post(url, data)
                .then(function (response) {                                
                    var res = response.data;
                    if(res.status === 200 ){                    
                        console.log("Signed Up Successfully");
                    }else{
                        console.log('Unable to signUp.')
                    }
                })
                .catch(function (error) {
                    console.log(error);
                }); 
            }else{
                console.log("Password doesn't match.")
            }            
        }else{
            if(!userNameChk && !passwordChk){
                console.log("Invalid format: email & Password");
            }else if(!userNameChk)            {
                console.log("Invalid format: email");
            }else if(!passwordChk){
                console.log("Invalid format: Password");
            }            
        }
    }catch(e)    {
        console.log("Exception In signUp: "+e);
    }
}

function emptyFields(){
    document.getElementById('inputUsername').value = '';            
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputPassword').value = '';
    document.getElementById('inputConfirmPassword').value = '';
}
function showSignup(){
    try{
        let ancText = document.getElementById('loginSignUpSwitch').text; 
        emptyFields();       
        if(ancText === "Don't have an account yet?   SIGN UP"){            
            document.getElementById('Username').style.display = 'block';            
            document.getElementById('confirm_password').style.display = 'block';
            document.getElementById('signInSignUp').textContent = 'SIGN UP';
            document.getElementById('rem-password').style.display = 'none';
            document.getElementById('loginSignUpSwitch').text = "Already have an account? SIGN IN";
        }else{
            document.getElementById('Username').style.display = 'none';
            document.getElementById('confirm_password').style.display = 'none';
            document.getElementById('rem-password').style.display = 'none';
            document.getElementById('customCheck1').checked = false;
            document.getElementById('signInSignUp').textContent = 'SIGN IN';
            document.getElementById('loginSignUpSwitch').text = "Don't have an account yet?   SIGN UP";
        }                
    }
    catch(e){
        console.log('Exception in showing showSignup: '+e);
    }
}
