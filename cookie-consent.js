function checkCookie(){

let cookie = localStorage.getItem("cookieConsent");

if(cookie === null){
document.getElementById("cookieBanner").style.display="flex";
}else{
document.getElementById("cookieBanner").style.display="none";
}

}

function acceptCookies(){
localStorage.setItem("cookieConsent","accepted");
document.getElementById("cookieBanner").style.display="none";
}

function denyCookies(){
localStorage.setItem("cookieConsent","denied");
document.getElementById("cookieBanner").style.display="none";
}

document.addEventListener("DOMContentLoaded", checkCookie);