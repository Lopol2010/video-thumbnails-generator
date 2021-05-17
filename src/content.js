import { MSG_ENABLED, MSG_DISABLED, MSG_SELECT_VIDEO, MSG_SHOW_IMAGES_MODAL } from './shared/messages'
import { getImages, getPreview } from './prev'
import { Notifications, addInfo } from './components/notification/NotificationComponent'
import { Modal } from './components/modal/Modal' 
import { getVideoSrc } from './shared/utils'

// TODO: load this from one place, instead of embedding in both popup and content
let m = require('mithril')

let hover = true
let delayHandle = null
let startLoadDelay = 1000
let enabled = false
let isLoadingImages = false
let root = null

let state = {
    images: [],
    overlay: false,
    modal: false,
}

init()

let App = {
    view: () => {
        return (
            <div>
                <Notifications></Notifications>
                <Modal onclick={e => state.modal = false} hidden={!state.modal} images={state.images}></Modal>
            </div>
        )
    }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
    switch (msg?.id) {
        case MSG_ENABLED:
            onEnabled()
            break;
        case MSG_DISABLED:
            onDisable()
            break;
        case MSG_SELECT_VIDEO:
            if(!enabled)
            {
                onSelectVideo()
            }
            break;
        case MSG_SHOW_IMAGES_MODAL:
            state.modal = true
            state.images = msg.images
            m.redraw()
            break;
        default:
            break;
    }
})

function init() {
    root = document.createElement('div')
    document.addEventListener('DOMContentLoaded', DOMContentLoaded)
    document.addEventListener("mousehover", mousehover)
    document.addEventListener("mouseover", mouseover)
    document.addEventListener("mouseout", mouseout)
    chrome.storage.local.get(location.hostname, (items) => {
        if(items[location.hostname]?.enabled)
        {
            onEnabled()
        }
    })
}

function onSelectVideo() {
    onEnabled()
    addInfo({text: "Enabled for 10 seconds", subtext: "Hover cursor over target video"})
    let timeout = 10000
    let interval = setInterval(() => {
        timeout -= 1

        if(timeout <= 0 || isLoadingImages)
        {
            clearInterval(interval)
            onDisable()
        }
    }, 1)
}

function onEnabled() {
    enabled = true
    // console.log('enbled')
    m.mount(root, App)
}
function onDisable() {
    enabled = false

    state.images = []
    // state.overlay = false
    m.mount(root, null)
}

function DOMContentLoaded() {
    document.body.append(root)
}

function mousehover (e) {
    if(!enabled) return
    if (e.target?.tagName == 'VIDEO') {
        hover = true
        if (delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, startLoadDelay, e.target)
    }
}
function mouseover (e){
    if(!enabled) return
    if (e.target?.tagName == 'VIDEO') {
        hover = true
        if (delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, startLoadDelay, e.target)
    }
}
function mouseout (e){
    if(!enabled) return
    if (e.target?.tagName == 'VIDEO') {
        hover = false
        if (delayHandle != null) {
            clearTimeout(delayHandle)
            delayHandle = null
        }
    }
}

function onDelayEnd(video) {
    if (delayHandle != null) {
        // console.log("timeout cleared")
        clearTimeout(delayHandle)
        delayHandle = null
    }

    let hostname = location.hostname
    let src = getVideoSrc(video)

    if(!src)
    {
        addInfo({text: "ERROR: video source not found"})
        return
    }
    
    chrome.storage.local.get('videos', data => {
        console.log("data" ,data, src)
        if(!data.videos?.[src])
        {
            getImages(video, onImageRecieved)
            .then(images => {
                thumbnailCreated(images,  src, hostname)
            }).catch(uncompleteImagesList => {
            }).finally(() => {
                isLoadingImages = false
                addInfo({text: "Thumbnails ready!", subtext: "Click to see", onclick: () => { state.modal = true }})
                m.redraw()
            })
            
            isLoadingImages = true
            addInfo({text: "Started loading previews...", subtext: "Click to see", onclick: () => { state.modal = true }})
            state.images = []
            // state.overlay = false

        } else {
            addInfo({text: "Thumbnails ready!", subtext: "Click to see", onclick: () => { state.modal = true }})
            addInfo({text: "Or generate new thumbnails", subtext: "Click here to start", onclick: () => { 
                let videos = {}
                videos[src] = ''
                chrome.storage.local.set({ videos: videos }, () => {
                    // chrome.storage.local.get('videos', ndata => { console.log('new data: ', ndata, "object set: ", videos) })
                    // console.log("src cleared")
                    onDelayEnd(video)
                })
             }})
        }
        m.redraw()
    })

    // console.log('delay ended')
}

function thumbnailCreated(images, src, hostname) {

    chrome.storage.local.get('videos', data => {

        data.videos = data.videos ?? {}
        data.videos[src] = images
        chrome.storage.local.set(data, () => {
            if(chrome.runtime.lastError) console.log(chrome.runtime.lastError)
            console.log('saved images ', src, data.videos)
        })
    })
}
function onImageRecieved(image) {

    state.images.push(image)
    state.images.sort((a,b) => {
        return Number.parseInt(a.index) - Number.parseInt(b.index)
    })

    // state.overlay = true
    // console.log("recieved image: ", image)
    m.redraw()
    
}
