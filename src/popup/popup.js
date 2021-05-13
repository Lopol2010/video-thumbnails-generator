import "./popup.sass"
let m = require('mithril')



async function getActiveTab()
{
    let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return tabs[0]
}

function save(data) {
    console.log("saved data ", data, typeof data) 
    chrome.storage.local.set(data, () => { 
        if(chrome.runtime.lastError) console.log(chrome.runtime.lastError) 
    })
}

function getBaseUrl(url) {
    return new URL(url).hostname
}

async function onClickCheckboxEnabled(e) {
    let tab = await getActiveTab()
    let hostname = getBaseUrl(tab.url)
    let data = {}
    data[hostname] = { enabled: e.target.checked }
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