// Dependencies
var socket = io();

// HTML Elements
var user = document.getElementById("user"); // User input
var key = document.getElementById("passkey"); // Passkey input
var cKey = document.getElementById("confirmkey"); // Comfirm password input

// Functions
hashCode = function(str){
    var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function sendRequest() {
    uName = user.value;
    pwd = key.value;
    cPwd = key.value;
    if (pwd == cPwd) {
        socket.emit('new account', [uName, hashCode(pwd)]);
    } else {
        document.getElementById("err").InnerHTML = "Error: Make sure the passwords are the same!";
    }
}

// Callbacks
socket.on('user check failed', function(data){
    document.getElementById("err").InnerHTML = "Error: Username ["+data+"] is already in use!";
});
