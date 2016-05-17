var parseInput = function(s, t, r) {
    s = s.replace(/,/g, '');

    var object = {beatArray: []};
    var beats = s.substring(0, 3);
    var beatNumber = parseInt(beats.substring(0, 2));
    if (!isNaN(beatNumber) && beats[2] == ':') {
        object.beats = beatNumber;
    } else {
        return {
            success: 0,
            error: 'Invalid beats thingy'
        };
    }

    var gettingNumber = false;
    var currentNumber = '';

    //Now do the individual beats.
    for (var i = 3; i < s.length; i++) {
        var c = s[i];

        if (gettingNumber) {
            if ( isNaN( parseInt(c) ) ) {
                //Then it's a character! Add that many characters.
                addMultipleCharacters(object, c, currentNumber);
                gettingNumber = false;
                currentNumber = '';
            } else {
                //Then it's a number! Keep counting!
                currentNumber+=c;
            }
        } else {
            if ( isNaN( parseInt(c) ) ) {
                //Then it's a letter or a dash.
                if (!addSingleCharacter(object, c, gettingNumber, currentNumber)) {
                    return error('message');
                }

            } else {
                //It's a number! Complete the number!
                //Then, once we're out of numbers, add that many characters.
                gettingNumber = true;
                currentNumber = c;
            }
        }
    };

    object.repeat = r;
    object.success = true;
    object.barTime = t;
    object.barCount = object.beatArray.length / object.beats;
    object.beatInterval = object.barTime / object.beats;
    return object;
};

var error = function(string) {
    return {
        success: 0,
        error: string
    };
};

var addToObject = function(o, c) {
    o.beatArray.push(c);
};

//Returns false if reached an error, true if successfuly added.
var addSingleCharacter = function(o, c) {
    switch(c) {
        case 'R':
            addToObject(o, c);
            break;
        case 'L':
            addToObject(o, c);
            break;
        case '-':
            addToObject(o, c);
            break;
        default:
            return false;
    }

    return true;
};

//Same as add single character but multiple times.
var addMultipleCharacters = function(o, c, n) {
    var toAdd = parseInt(n);
    var good = true;
    for (var i = 0; i < toAdd; i++) {
        if (!addSingleCharacter(o, c)) {
            good = false;
        }
    }

    return good;
};