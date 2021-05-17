import "./popup.sass"
import { MSG_SELECT_VIDEO, MSG_DISABLED, MSG_ENABLED, MSG_SHOW_IMAGES_MODAL } from "../shared/messages"
let m = require('mithril')

let state = {
    enabled: false,
    history: []
}

init()

function init() {
    getActiveTabHostname().then(hostname => {
        chrome.storage.local.get(hostname, (items) => {
            state.enabled = (items[hostname]?.enabled) ?? false
            m.redraw()       
        })
    })
    chrome.storage.local.get('videos', (data) => {
        if(data.videos)
        {
            for (let key in data.videos)
            {
                state.history.push(data.videos[key]) // get array of {id, dataUrl} objects
            }
            console.log('obtained history: ', history, history[0], data.videos)
        }
        m.redraw()       
    })

}

async function getActiveTab()
{
    let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true, windowType: 'normal' })
    return tabs[0]
}

async function getActiveTabHostname() {

    let tab = await getActiveTab()
    let hostname = getBaseUrl(tab.url)
    return hostname
}

function getBaseUrl(url) {
    return new URL(url).hostname
}
async function onClickButtonSelectVideo(e) {
    let tab = await getActiveTab()
    chrome.tabs.sendMessage(tab.id, { id: MSG_SELECT_VIDEO })
}

async function onClickCheckboxEnabled(e) {
    let tab = await getActiveTab()
    let hostname = getBaseUrl(tab.url)
    let data = {}
    state.enabled = !e.target.checked
    data[hostname] = { enabled: state.enabled }
    chrome.storage.local.set(data, () => { 
        if(chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError) 
            return
        }
        chrome.tabs.sendMessage(tab.id, { id: state.enabled ? MSG_ENABLED : MSG_DISABLED })
    })
    m.redraw()
}
async function onClickHistoryEntry(images) {
    let tab = await getActiveTab()
    chrome.tabs.sendMessage(tab.id, { id: MSG_SHOW_IMAGES_MODAL, images: images })
}
let App = {
    view: function () {
        return (
            <div>
                <p>
                    Enabled on this site?
                    <input type="checkbox" id="enabled" checked={state.enabled} onclick ={ function (e) { onClickCheckboxEnabled(e) } }/>
                </p>
                {/* <button onclick={ e => onClickButtonSelectVideo()}>Select video</button> */}
                { state.history.map(images => {

                    return <div onclick={e => onClickHistoryEntry(images)}>
                        {images.map(src => {
                            return <img src={src.dataUrl} key={src.index} width={30}></img>
                        })}
                    </div>
                }) }
            </div>
        )
    }
}

m.mount(document.body, App)