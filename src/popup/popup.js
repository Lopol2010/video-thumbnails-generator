import "./popup.sass"
let m = require('mithril')



async function getActiveTab()
{
    let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return tabs[0]
}

function save(data) {
    chrome.storage.local.set(data, () => chrome.runtime.lastError ?? console.log(chrome.runtime.lastError))
}

function getBaseUrl(url) {
    let a = document.createElement('a')
    a.href = url
    return a.hostname
}

async function onClickCheckboxEnabled(e) {
    let tab = getActiveTab()
    let hostname = getBaseUrl(tab.url)
    let data = {}
    data[hostname] = JSON.stringify({ enabled: e.target.value })
    save(data)
}

let App = {
    view: function () {
        return (
            <div>
                <p>
                    Enabled on this site?
                    <input type="checkbox" id="enabled" onclick ={ function (e) { onClickCheckboxEnabled(e) } }/>
                </p>
            </div>
        )
    }
}


m.render(document.body, <App/>)