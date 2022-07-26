const teams = [
    {
        name: 'cc', id: '626f8c46f7f94f30b0bc78d4', devs: [
            {"trigram" : "gza", "name": "Guillaume", id: "58480f8e35511bf7f82b961a"},
            {"trigram" : "jgt", "name": "Jose", id: "61483b5e4b18e97915fa94b9"},
            {"trigram" : "jla", "name": "Julien L", id: "5770de0b7cc5c29c20e1c935"},                         
            {"trigram" : "mbo", "name": "Marcin", id: "59b2635100bc9d3ead969dc9"},
            {"trigram" : "mdd", "name": "Mickael", id: "571f321e3d0918a2cde3a2a8"},
            {"trigram" : "rle", "name": "Rémi", id: "5c7fc4f442826f14c0a7e497"},            
            {"trigram" : "sci", "name": "Samuel", id: "615488db3da53285d95402dc"},                                
            {"trigram" : "ygr", "name": "Yann", id: "59b02122d3bc2d40e1a1ecb8"},
            {"trigram" : "jkl", "name": "Julien K", id: "61c205b702268157e004b923"},
            {"trigram" : "sao", "name": "Safi", id: "62a73ac1eeaf9f117353911a"}
        ]
    },
    {
        name: 'integration', id: '6180fec4c1f0071005db2e8c', devs: [
            {"trigram" : "anp", "name": "Anaïs", id: "5dd3f667cfe7b67ee3695081"},
            {"trigram" : "pst", "name": "Philippe", id: "57357594b69d9fd7e3cf8037"},
            {"trigram" : "afo", "name": "Antonin", id: "617a5c4c59490938673593f0" },
            {"trigram" : "cda", "name": "Christophe", id: "5721daa1b7364971e546197a"},                         
            {"trigram" : "mil", "name": "Michael", id: "61828a4b9c03d460e173385e" },
            {"trigram" : "nmi", "name": "Nicolas", id: "52933ef71af028a5410087b3" },
            {"trigram" : "vml", "name": "Vincent", id :"6182a222015f9d30b7ae7620"},
            {"trigram" : "skf", "name" : "Salim", id: "62dfa8865f56db0ad39af728"}
        ]
    }
];
const getTeam = () => {
    const tab = document.querySelector('.selected.tab');
    if (!tab){
        return retrieveTeam();
    }
    const id = tab.getAttribute('data-trello-id');
    const team = teams.filter(e => e.id === id);
    return team[0].name;
}
const retrieveDevList = () => {    
    return getStorageItem(`devList_${getTeam()}`);
}
const retrieveTeam = () => {
    const t = getStorageItem('team');
    if (!t){
        return teams[0].name;
    }
}
const getStorageItem = (key) => {
    return localStorage.getItem(key);
}
function loadJSON(callback) {   
    var data = teams;
    callback(data);
 }
 /**
 * Get the dev list as an array from coucou
 * the input set in the corresponding textarea.
 * @returns the dev list.
 */
const getDevList = () => {
    const items = document.querySelectorAll('.dev.column li');
    const res = [...items].reduce((prev, cur, i, arr) => {
        const input = cur.querySelector('input');
        if (input.checked){
            prev.push(input.value);
        }
        return prev;
    }, []);
    return res;
}
 const saveDevList = () => {
    localStorage.setItem(`devList_${getTeam()}`, getDevList());
}
 function initDevList() {
    const ul = document.querySelector('.dev.column');
    ul.innerHTML = '';
    const selectedDev = retrieveDevList();
    loadJSON((data) => { 
        const devs = data.find(e => e.name === getTeam()).devs;
        devs.forEach(e => { 
            const li = document.createElement('li');
            li.setAttribute('data-user-id', e.id);                        
            const div = document.createElement('div');
            div.classList.add('label');
            div.setAttribute('id', e.trigram);
            const label = document.createElement('label');
            label.classList.add('name-label');
            label.setAttribute('for', e.trigram);
            label.textContent = e.name;
            const chk = document.createElement('input');
            chk.setAttribute('value', e.trigram);
            chk.setAttribute('id', e.trigram);
            chk.setAttribute('type', 'checkbox');
            if (selectedDev)
                chk.checked = selectedDev.indexOf(e.trigram) > -1;
            else{
                chk.checked = true;
            }
            li.append(div);
            div.append(label);
            li.append(chk);
            ul.append(li);
        })
    });
    saveDevList();
   }
   initDevList();
//#region Constants
const SQRT_PI = Math.sqrt(Math.PI);
const COLORS = ['#6867AC', '#A267AC', '#CE7BB0', '#FFBCD1', '#705089', '#A267AC', '#CE7BB0', '#ef628c', '#a83f5d','#af1642'];
//#endregion

//#region Global variables
let pickerRadius;
let devList = [];
let remainingDevs = [];
let pickedDevs = [];
let $canvas;
let ctx;
let startTimestamp;
let iMessage = 0;
//#endregion


//#region Utils
/**
 * Get the single DOM element corresponding to an id.
 * @param {string} id DOM identifier.
 * @returns An HTML element.
 */
const $ = id => document.getElementById(id);

/**
* Error function.
* see https://www.wolframalpha.com/input/?i=1%2F2+sqrt%28%CF%80%29+erf%28x%29
* and https://en.wikipedia.org/wiki/Error_function#Numerical_approximations
* @param {number} x Input
* @returns Error function of input.
*/
const erf = x => {
    // save the sign of x
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    // constants
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;

    // A&S formula 7.1.26
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y; // erf(-x) = -erf(x);
}

/**
 * Get a random number into 2 numbers included in the interval.
 * cf. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
 * @param {number} min 
 * @param {*} max 
 * @returns 
 */
const rand = (min, max) => Math.random() * (max - min) + min;

/**
 * Add a message to the corresponding area.
 * @param {string} txt Message text.
 * @param {*} type Message type ('success' / 'warning' / 'error').
 */
const addMessage = (txt, type) => {
    const msgId = 'message-' + iMessage;
    $('messages').innerHTML += `<div id='${msgId}' class='message message-${type}'>${txt}</div>`;
    setTimeout(() => {
        const $msg = $(msgId);
        $msg.parentNode.removeChild($msg);
    }, 3000);
    iMessage++;
}

/**
 * Compare elements of an old array and of a new one (possibly not in the same order).
 * It returns an object that contains:
 *  - a flag indicating if both arrays are similar (areIdentical)
 *  - a list of new items (addedItems)
 *  - a list of items no longer present (removedItems)
 * @param {T[]} oldArray 
 * @param {T[]} newArray 
 * @returns an object describing the comparison.
 */
const compareArrays = (oldArray, newArray) => {
    const result = {
        areIdentical: true,
        addedItems: [],
        removedItems: []
    };

    // Check for removed items
    for (const elt1 of oldArray) {
        const idx2 = newArray.indexOf(elt1);
        if (idx2 === -1) {
            result.removedItems.push(elt1);
            result.areIdentical = false;
        }
    }

    // Check for new items
    for (const elt2 of newArray) {
        const idx1 = oldArray.indexOf(elt2);
        if (idx1 === -1) {
            result.addedItems.push(elt2);
            result.areIdentical = false;
        }
    }

    return result;
}

const replaceArrayInplace = (oldArray, newArray) => {
    oldArray.length = newArray.length;
    for (let i = 0; i < oldArray.length; i++)
        oldArray[i] = newArray[i];
}
//#endregion


//#region Canvas utilities
/**
 * Initialize a canvas context to draw things in this canvas.
 */
const initCanvasContext = () => {
    $canvas = $('picker');
    ctx = $canvas.getContext('2d');
    pickerRadius = $canvas.width / 2;
}

/**
 * Draw a wedge area.
 * @param {number} i Position of the region in the list.
 * @param {string} dev Developer trigram.
 * @param {number} n Number of regions to draw.
 * @param {string} color Color code.
 * @param {number} deltaStartAngle Adds a start angle offset to rotate the wheel.
 */
const drawCircularArea = (i, dev, n, color, deltaStartAngle) => {
    const baseStartAngle = deltaStartAngle - Math.PI / 2;
    const startAngle = baseStartAngle + 2 * Math.PI * i / n - Number.EPSILON;
    const endAngle = baseStartAngle + 2 * Math.PI * (i + 1) / n;

    ctx.beginPath();
    ctx.moveTo(pickerRadius, pickerRadius);
    ctx.arc(pickerRadius, pickerRadius, pickerRadius, startAngle, endAngle);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.globalAlpha = .75;
    ctx.fill();

    ctx.save();
    ctx.translate(pickerRadius, pickerRadius);
    ctx.rotate((startAngle + endAngle) / 2 + Math.PI / 2);
    ctx.font = "bold 19px Segoe UI";
    ctx.fontWeight = 600;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    // ctx.fillRect(-25, - 3 * pickerRadius / 4 - 16, 50, 22);
    // ctx.fillStyle = '#111';
    ctx.fillText(dev, 0, - 3 * pickerRadius / 4);
    ctx.restore();
}

/**
 * Draw the rule to pick a developer and the circle at the center of the wheel.
 */
const drawPickerRule = () => {
    ctx.beginPath();
    ctx.arc(pickerRadius, pickerRadius, 6, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = '#333';
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(pickerRadius, pickerRadius);
    ctx.lineTo(pickerRadius, 0);
    ctx.stroke();
}

/**
 * Create a diagram for developers
 * in the corresponding area.
 * @param {string[]} devList List of developer's trigram.
 * @param {number} deltaStartAngle Adds a start angle offset to rotate the wheel.
 */
const createDiagram = (devList, deltaStartAngle = 0) => {
    const nbDevs = devList.length;
    devList.forEach((dev, i) => {
        const index = i;//(i * 7) % COLORS.length;        
        drawCircularArea(i, getDevName(dev), nbDevs, COLORS[index], deltaStartAngle);
    });
}

/**
 * Redraw the whole canvas (wheel / dev trigrams / picker).
 * @param {string[]} devList List of developer trigrams.
 * @param {number} deltaStartAngle Delta start angle for the wheel.
 */
const redrawAll = (devList, deltaStartAngle = 0) => {
    ctx.clearRect(0, 0, pickerRadius * 2, pickerRadius * 2);
    createDiagram(devList, deltaStartAngle);
    drawPickerRule();
}

/**
 * Rotate the wheel.
 * @param {number} timestamp Current timestamp (provided by rAF).
 * @param {*} initialSpeed Initial wheel's rotating speed.
 * @param {*} deceleration Wheel's deceleration.
 */
const rotateWheel = (timestamp, initialSpeed, deceleration) => {
    if (typeof startTimestamp === 'undefined')
        startTimestamp = timestamp;

    const elapsedTime = (timestamp - startTimestamp) / 1000;
    const sqrtDeceleration = Math.sqrt(deceleration);
    const offsetAngle = initialSpeed * SQRT_PI * erf(sqrtDeceleration * elapsedTime) / (2 * sqrtDeceleration);

    // Refresh the diagram at the new angle + the picker
    redrawAll(remainingDevs, offsetAngle);

    const currentSpeed = initialSpeed * Math.exp(-deceleration * elapsedTime * elapsedTime);

    // If the wheel is about stopped, we exit
    if (currentSpeed < 0.2) {
        startTimestamp = undefined;

        const rotatedAngleNormalized = offsetAngle % (2 * Math.PI);

        const iDev = remainingDevs.length - 1 - Math.floor(Math.abs(rotatedAngleNormalized * remainingDevs.length / (2 * Math.PI)));
        setDevAsCurrent(remainingDevs[iDev]);

        return;
    }

    window.requestAnimationFrame(timestamp => rotateWheel(timestamp, initialSpeed, deceleration));
}
//#endregion


//#region Dev utilities
const setDevAsCurrent = dev => {
    buildCards(dev);
    if(pickedDevs.length){
        stopDevTimer(pickedDevs[pickedDevs.length - 1]);
    }
    $('txtDevCurrent').innerHTML = `Current: ${getDevName(dev)}`;
    const iDev = remainingDevs.indexOf(dev);
    remainingDevs.splice(iDev, 1);
    pickedDevs.push(dev);
    startDevTimer(dev);
    document.title = `${dev} - Scrum picker`;
}

const updateDevListsIfRequired = () => {
    const newDevList = getDevList();
    const result = compareArrays(devList, newDevList);

    // If they are identical, that's ok, we continue
    if (result.areIdentical)
        return;

    // Else, we first update the current dev list with the new one.
    replaceArrayInplace(devList, newDevList);

    // Then we update the remainingDevs list
    for (const added of result.addedItems)
        remainingDevs.push(added);

    for (const removed of result.removedItems) {
        const idx = remainingDevs.indexOf(removed);
        if (idx > -1)
            remainingDevs.splice(idx, 1);
    }

    addMessage('List correctly updated', 'success');
}
var countdown;
stopTimer = false;
const startCountDown =() => {
    var countDownDate = addMinutes(new Date(), 15).getTime();
    // Update the count down every 1 second
    var countdown = setInterval(function() {
        // Get today's date and time
        var now = new Date().getTime();    
        // Find the distance between now and the count down date
        var distance = countDownDate - now;    
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTime(minutes, seconds); 
        stopTimer = stopTimer | (minutes === 0 && seconds === 0);
        if (stopTimer) {
            clearInterval(countdown);            
        }
    }, 1000);
}
const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes*60000);
}
const devSpeakingTime = {};
const startDevTimer = (dev) => {
    devSpeakingTime[dev] = new Date();
}
const stopDevTimer = (dev) => {
    var endDate = new Date();
    var distance = endDate.getTime() - devSpeakingTime[dev].getTime();
    var container = document.querySelector(`.label[id="${dev}"]`);   
    var timeDiv = document.createElement('span');  
    timeDiv.classList.add('time-speaking'); 
    timeDiv.appendChild(document.createTextNode(dateTostring(distance)));
    container.after(timeDiv)
}
const dateTostring = (distance) => {
    // Time calculations for days, hours, minutes and seconds        
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    // Display the result in the element with id="demo"
    return  minutes + "m" + seconds + "s ";
}
/**
 * Run the wheel and pick a developer.
 */
const pickDev = () => {
    stopTimer = false;
    // First, check if the list has been changed since the last run
    updateDevListsIfRequired();

    // No remaining dev to pick -> we do nothing
    if (remainingDevs.length === 0) {
        stopDevTimer(pickedDevs[pickedDevs.length - 1]);
        stopTimer = true;
        addMessage('No remaining dev -> please reset the picker before picking another one!', 'warning');
        return;
    }

    // If wheel is rotating, waiting for completion
    if (typeof startTimestamp !== 'undefined') {
        addMessage('The wheel is always rotating, please wait...', 'warning');
        return;
    }
    if (pickedDevs.length === 0){
        startCountDown();
    }     
    // If some dev as already been picked, move it to the done part
    if ($('txtDevCurrent').innerHTML.indexOf('Current: ') > -1){                
        $('txtDevDone').innerHTML = pickedDevs.map(dev => `<span class='dev-trigram'>${getDevName(dev)}</span>`).join(', ');
    }
        

    // and set the current text to 'PICKING...'
    $('txtDevCurrent').innerHTML = 'Picking...';

    if (remainingDevs.length === 1) {
        redrawAll(remainingDevs, Math.PI);
        setDevAsCurrent(remainingDevs[0]);
        return;
    }

    // Run the wheel
    const initialSpeed = rand(7, 23);
    const deceleration = rand(0.71, 2.53);
    window.requestAnimationFrame(timestamp => rotateWheel(timestamp, initialSpeed, deceleration));
}
const getDevName = (dev) => {
    if (dev.toLowerCase() === 'mbo')
        return 'Chaton';
    return dev.toUpperCase();
}
const saveTeam = () => {
    localStorage.setItem('team', getTeam());
}
//#endregion


const resetPicker = () => {
      
    stopTimer = true;    
    $('txtDevDone').innerHTML = '';
    devList = getDevList();
    remainingDevs = [...devList];
    pickedDevs = [];
    document.title = `Scrum dev picker`;
    redrawAll(remainingDevs);
    const cards = document.querySelector('#cards');
    if(cards){
        cards.innerHTML = '';
    } 
    setTime('15', '0');
    if (typeof trelloCards !== 'undefined') {
        trelloCards = [];        
    } 
    if (typeof lists !== 'undefined') {        
        lists = [];
    } 
}

const captureKey = evt => {
    if (evt.key === 'Enter')
        $('btnPick').click();
}

/**
 * Register events for the page.
 */
const initEvents = () => {
    $('btnPick').addEventListener('click', pickDev);
    $('btnReset').addEventListener('click', resetPicker);
    document.querySelectorAll('input').forEach(item => {
        item.addEventListener('change', event => {
            saveDevList();
        })
      });
    document.addEventListener('keypress', captureKey);
}


/**
 * Start point of the application.
 */
const init = () => {
    retrieveDevList();
    initCanvasContext();
    resetPicker();
    initEvents();
}



jQuery(function () {
    init();  
  });
