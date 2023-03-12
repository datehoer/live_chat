let checkBoxFields = ['isLive', 'withCredentials', 'hasAudio', 'hasVideo'];
let streamURL, mediaSourceURL;
function flv_load() {
    console.log('isSupported: ' + flvjs.isSupported());
    if (mediaSourceURL.className === '') {
        let url = document.getElementById('msURL').value;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function (e) {
            var mediaDataSource = JSON.parse(xhr.response);
            flv_load_mds(mediaDataSource);
        }
        xhr.send();
    } else {
        let i;
        let mediaDataSource = {
            type: 'flv'
        };
        for (i = 0; i < checkBoxFields.length; i++) {
            let field = checkBoxFields[i];
            /** @type {HTMLInputElement} */
            let checkbox = document.getElementById(field);
            mediaDataSource[field] = checkbox.checked;
        }
        mediaDataSource['url'] = document.getElementById('sURL').value;
        console.log('MediaDataSource', mediaDataSource);
        flv_load_mds(mediaDataSource);
    }
}

function flv_load_mds(mediaDataSource) {
    let element = document.getElementsByName('videoElement')[0];
    if (typeof player !== "undefined") {
        if (player != null) {
            player.unload();
            player.detachMediaElement();
            player.destroy();
            player = null;
        }
    }
    player = flvjs.createPlayer(mediaDataSource, {
        enableWorker: false,
        lazyLoadMaxDuration: 3 * 60,
        seekType: 'range',
    });
    player.attachMediaElement(element);
    player.load();
}

function flv_start() {
    player.play();
}

function flv_pause() {
    player.pause();
}

function flv_destroy() {
    player.pause();
    player.unload();
    player.detachMediaElement();
    player.destroy();
    player = null;
}

function flv_seekto() {
    let input = document.getElementsByName('seekpoint')[0];
    player.currentTime = parseFloat(input.value);
}

function switch_url() {
    streamURL.className = '';
    mediaSourceURL.className = 'hidden';
    saveSettings();
}

function switch_mds() {
    streamURL.className = 'hidden';
    mediaSourceURL.className = '';
    saveSettings();
}

function ls_get(key, def) {
    try {
        let ret = localStorage.getItem('flvjs_demo.' + key);
        if (ret === null) {
            ret = def;
        }
        return ret;
    } catch (e) {
    }
    return def;
}

function ls_set(key, value) {
    try {
        localStorage.setItem('flvjs_demo.' + key, value);
    } catch (e) {
    }
}

function saveSettings() {
    if (mediaSourceURL.className === '') {
        ls_set('inputMode', 'MediaDataSource');
    } else {
        ls_set('inputMode', 'StreamURL');
    }
    var i;
    for (i = 0; i < checkBoxFields.length; i++) {
        let field = checkBoxFields[i];
        /** @type {HTMLInputElement} */
        let checkbox = document.getElementById(field);
        ls_set(field, checkbox.checked ? '1' : '0');
    }
    let msURL = document.getElementById('msURL');
    let sURL = document.getElementById('sURL');
    ls_set('msURL', msURL.value);
    ls_set('sURL', sURL.value);
    console.log('save');
}

function loadSettings() {
    let i;
    for (i = 0; i < checkBoxFields.length; i++) {
        let field = checkBoxFields[i];
        /** @type {HTMLInputElement} */
        let checkbox = document.getElementById(field);
        let c = ls_get(field, checkbox.checked ? '1' : '0');
        checkbox.checked = c === '1' ? true : false;
    }

    let msURL = document.getElementById('msURL');
    let sURL = document.getElementById('sURL');
    msURL.value = ls_get('msURL', msURL.value);
    sURL.value = ls_get('sURL', sURL.value);
    if (ls_get('inputMode', 'StreamURL') === 'StreamURL') {
        switch_url();
    } else {
        switch_mds();
    }
}

function showVersion() {
    let version = flvjs.version;
    // document.title = document.title + " (v" + version + ")";
    document.title = document.title + " (鸡你太美) ";
}

let logcatbox = document.getElementsByName('logcatbox')[0];
flvjs.LoggingControl.addLogListener(function (type, str) {
    logcatbox.value = logcatbox.value + str + '\n';
    logcatbox.scrollTop = logcatbox.scrollHeight;
});

document.addEventListener('DOMContentLoaded', function () {
    streamURL = document.getElementById('streamURL');
    mediaSourceURL = document.getElementById('mediaSourceURL');
    loadSettings();
    showVersion();
    flv_load();
});