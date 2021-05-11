import "./popup.sass"
let m = require('mithril')



async function getActiveTab()
{
    return await chrome.tabs.query({ active: true, lastFocusedWindow: true })
}

function save(data) {
    chrome.storage.local.set(data, () => chrome.runtime.lastError ?? console.log(chrome.runtime.lastError))
}


let App = {
    view: function () {
        return (
            <div>
                <p>
                    Enabled on this site?
                    <input type="checkbox" id="enabled" onclick ={ function () {  } }/>
                </p>
            </div>
        )
    }
}


m.render(document.body, <App/>)