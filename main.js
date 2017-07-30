"use strict";
var head;
var style;
var styleShowEl;
var commandString;
var highlight;
window.onload = function() {
    head = document.head || document.querySelector('head') || document.getElmentsByTagName('head')[0];
    prepareStyles();
    styleShowEl = document.getElementById("styles");
    fetchCSS(start);
};
var updateStyles = function(newStyles) {
    if(style.styleSheet)
        style.styleSheet.cssText = newStyles;
    else {
        if(style.firstChild) style.removeChild(style.firstChild);
        style.appendChild(document.createTextNode(newStyles));
    }
    styleShowEl.innerHTML = newStyles;
    if(highlight)
        hljs.highlightBlock(styleShowEl);
};
var enableHightlighting = function() {
    highlight = true;
    styleShowEl.classList.add("hljs");
    styleShowEl.classList.add("css");
};
var prepareStyles = function() {
    style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
};

var fetchCSS = function(callback) {
    var client = new XMLHttpRequest();
    client.open('GET', 'styles.css');
    client.onreadystatechange = function() {
        if(client.readyState === XMLHttpRequest.DONE && client.status === 200) {
            commandString = client.responseText;
            return callback();
        }
    }
    client.send();
};

var parse = function(str) {
    var re = /~cmd:(.*)$/gmi;
    var match;
    while((match = re.exec(str)) !== null) {
        var command = match[1];
        var index = match.index;
        console.log("Command " + command + " at " + index);
    }
    return str.replace(/~cmd.*$/g, '');
};

var commands = {};

var start = function() {
    var parsedString = parse(commandString);
    var length = parsedString.length;
    var place = 0;
    setInterval(function() {
        if(place < length) {
            // (commands[place])();
            updateStyles(parsedString.substring(0, ++place));
        }
    }, 50);
};
