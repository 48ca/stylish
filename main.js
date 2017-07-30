"use strict";
var head;
var style;
var styleShowEl;
var parsedString;
var commandString;
var highlight;
var charInterval = 25;
var globalCommandOffset = 0;

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
var enableHighlighting = function() {
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

var commands = {
    'HIGH': function(index, callback) {
        enableHighlighting();
        hljs.highlightBlock(styleShowEl);
        callback();
    },
    'STOP': function() {
        // Simply never calls the callback -- execution stops
    },
    'PAUSE500': function(index, callback) {
        setTimeout(callback, 500);
    },
    'REMLINE': function(index, callback) {
        var substr = parsedString.substring(0, index-1);
        var lineAt = substr.lastIndexOf('\n');
        var back = function(i) {
            updateStyles(parsedString.substring(0, i));
            if(i > lineAt) {
                setTimeout(function() {
                    back(i-1);
                }, charInterval);
            } else {
                globalCommandOffset += index - lineAt;
                var rem = parsedString.split('');
                rem.splice(lineAt < 0 ? 0 : lineAt, index-lineAt)
                parsedString = rem.join('');
                callback(lineAt - index);
            }
        };
        back(index);
    }
};
var commandsToExecute = {};

var parse = function(str) {
    var re = /~cmd:(.*)$/gmi;
    var match;
    var lengthOffset = 0;
    while((match = re.exec(str)) !== null) {
        var fullMatch = match[0];
        var cmds = match[1].split(',');
        var index = match.index;
        console.log("Command " + cmds + " at " + index);
        commandsToExecute[index-lengthOffset] = cmds;
        lengthOffset += fullMatch.length;
    }
    return str.replace(/~cmd.*$/gmi, '');
};

var onStop = function() {
    setTimeout(function() {
        window.location.href = "//jhoughton.me";
    }, 4000);
};

var start = function() {
    parsedString = parse(commandString);
    var length = parsedString.length;
    var place = 0;
    var step = function() {
        if(place >= length) return onStop();
        var finishFunction = function(indexChange) {
            if(indexChange) {
                place += indexChange;
            }
            updateStyles(parsedString.substring(0, ++place));
            setTimeout(step, charInterval);
        };
        var currentCmdPlace = place+globalCommandOffset; // This prevents early changes to globalCommandOffset from affecting results
        if(commandsToExecute[currentCmdPlace]) {
            var exec = function(i, ic) {
                ic = ic || 0;
                commands[commandsToExecute[currentCmdPlace][i]](place,
                        function(indexChange) {
                            if (commandsToExecute[currentCmdPlace][i+1])
                                exec(i+1, ic + (indexChange || 0));
                            else finishFunction(ic + (indexChange || 0));
                        });
            };
            exec(0);
        } else {
            finishFunction();
        }
    };
    step();
};
