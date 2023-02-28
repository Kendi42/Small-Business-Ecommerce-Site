// CLIENT SIDE INPUT VALIDATION
// loginform
const form = document.getElementById("form");
const email = document.getElementById("floatingInput");
const pass = document.getElementById("floatingPassword");


const emaillb = document.getElementById("emaillb");
const passlb = document.getElementById("passlb");


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
    const emailValue = email.value.trim();
    const passValue = pass.value.trim();
    let successcount=0;

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

    if(successcount== 2){
        return true;
    }
    else{
        return false;
    }

};
