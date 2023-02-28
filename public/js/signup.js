// CLIENT SIDE INPUT VALIDATION
// Signup Form
const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("useremail");
const pass = document.getElementById("password");
const confpass = document.getElementById("confirmpassword");


const usernamelb = document.getElementById("usernamelb");
const emaillb = document.getElementById("emaillb");
const passlb = document.getElementById("passlb");
const confpasslb = document.getElementById("confpasslb");

form.addEventListener('submit', e=>{
    if(!validateInputs()){
        e.preventDefault();
    }
    
});

const setError = (element, message) =>{
    const inputControl =element.parentElement;
    const errorDisplay = inputControl.querySelector(".error");

    inputControl.classList.add("error");
    inputControl.classList.remove("success");
    errorDisplay.innerText = message;

}

const setSuccess = element =>{
    const inputControl= element.parentElement;
    const errorDisplay = inputControl.querySelector(".error");

    errorDisplay.innerText="";
    inputControl.classList.add("success");
    inputControl.classList.remove("error");

}

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateInputs(){
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const passValue = pass.value.trim();
    const confpassValue = confpass.value.trim();
    let successcount=0;

    if(usernameValue ===""){
        usernamelb.innerHTML="";
        setError(username, "Username is required");

    }else{
        setSuccess(username);
        successcount=successcount+1;
    }

    if(emailValue ===""){
        emaillb.innerHTML="";
        setError(email, "Email is required");
    }else if (!isValidEmail(emailValue)) {
        emaillb.innerHTML="";
        setError(email, 'Provide a valid email address');
    }else{
        setSuccess(email);
        successcount=successcount+1;

    }

    if(passValue ===""){
        passlb.innerHTML="";
        setError(pass, "Password is required");
    }else if (passValue.length < 6 ) {
        passlb.innerHTML="";
        setError(pass, 'Password must be at least 6 characters.');
    }else{
        setSuccess(pass);
        successcount=successcount+1;

    }
    if(confpassValue ===""){
        confpasslb.innerHTML="";
        setError(confpass, "Please Confirm your password");
    }else if (confpassValue !== passValue) {
        confpasslb.innerHTML="";
        setError(confpass, "Passwords doesn't match");
    }else{
        setSuccess(confpass);
        successcount=successcount+1;
    }

    if(successcount== 4){
        return true;
    }
    else{
        return false;
    }

};
