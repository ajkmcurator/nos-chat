var socket = io();

function getUrlVars() {
    var vars = {};
    var parts = window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

room = getUrlVars()['room']
console.log(room);

if (room !== undefined) {
    console.log('connected');
}
