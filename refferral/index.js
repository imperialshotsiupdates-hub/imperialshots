// FIREBASE CONFIG
const firebaseConfig = {
apiKey:"AIzaSyDmmcRlCs6K0PzxnFkuA0qv5U5K3V6x8QQ",
authDomain:"vendors-d084b.firebaseapp.com",
databaseURL:"https://vendors-d084b-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"vendors-d084b"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.database();

emailjs.init("SMJ7U80sPC5u7hocO");

let generatedOTP="";
let otpTime=0;


// SWITCH SCREENS
function showRegister(){
document.getElementById("loginBox").style.display="none";
document.getElementById("registerBox").style.display="block";
}

function showLogin(){
document.getElementById("loginBox").style.display="block";
document.getElementById("registerBox").style.display="none";
}



// SEND OTP
function sendOTP(){

let email=document.getElementById("email").value;

if(email==""){
alert("Enter email first");
return;
}

// GENERATE OTP
generatedOTP=Math.floor(100000+Math.random()*900000);
otpTime=Date.now();

let params={
email:email,
otp:generatedOTP
};

emailjs.send("service_2tfyw7h","template_7h4dwcp",params)
.then(()=>{

alert("OTP sent to email");

})
.catch(err=>{
alert("Email failed: "+err);
});

}



// VERIFY OTP
function verifyOTP(){

let entered=document.getElementById("otp").value;

// OTP expiry (5 min)
if(Date.now()-otpTime>300000){
alert("OTP expired. Send again.");
return;
}

if(entered!=generatedOTP){
alert("Wrong OTP");
return;
}

let name=document.getElementById("name").value;
let phone=document.getElementById("phone").value;
let email=document.getElementById("email").value;


// GENERATE USER DATA
let userId="USR"+Math.floor(100000+Math.random()*900000);
let password="IMP"+Math.floor(1000+Math.random()*9000);
let referral="REF"+Math.floor(100000+Math.random()*900000);


// SAVE USER
db.ref("users/"+userId).set({

name:name,
phone:phone,
email:email,
password:password,
referral:referral

});

alert(
"Account Created\n\n"+
"User ID: "+userId+"\n"+
"Password: "+password+"\n"+
"Referral Code: "+referral
);

showLogin();

}



// LOGIN
function login(){

let id=document.getElementById("loginId").value;
let pass=document.getElementById("loginPass").value;

if(id=="" || pass==""){
alert("Enter login details");
return;
}

db.ref("users/"+id).once("value")
.then(snap=>{

if(!snap.exists()){
alert("User not found");
return;
}

let data=snap.val();

if(data.password!=pass){
alert("Wrong password");
return;
}

localStorage.setItem("user",id);

window.location="dashboard.html";

});

}