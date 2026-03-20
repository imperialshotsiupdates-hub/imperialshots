function updateOnlineStatus(){

const screen = document.getElementById("offlineScreen");

if(navigator.onLine){

screen.classList.add("hidden");

}else{

screen.classList.remove("hidden");

}

}

function retryConnection(){

if(navigator.onLine){

location.reload();

}else{

alert("Still offline. Please check your internet connection.");

}

}

// page load
window.addEventListener("load",updateOnlineStatus);

// internet reconnect
window.addEventListener("online",updateOnlineStatus);

// internet disconnect
window.addEventListener("offline",updateOnlineStatus);