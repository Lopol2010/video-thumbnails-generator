import styles from './content.sass'
import { MESSAGE_ENABLED, MESSAGE_DISABLED, MESSAGE_SELECT_VIDEO } from './messages'
import { getImages, getPreview } from './prev'
let m = require('mithril')

let hover = true
let delayHandle = null
let DELAY = 1000
let enabled = false
let startedLoadImages = false

let state = {
    images: [],
    overlay: false
}

let root = document.createElement('div')
document.addEventListener('DOMContentLoaded', DOMContentLoaded)
document.addEventListener("mousehover", mousehover)
document.addEventListener("mouseover", mouseover)
document.addEventListener("mouseout", mouseout)
init()

console.log("content.js")

chrome.runtime.onMessage.addListener((msg, sender) => {
    switch (msg?.id) {
        case MESSAGE_ENABLED:
            onEnabled()
            break;
        case MESSAGE_DISABLED:
            onDisable()
            break;
        case MESSAGE_SELECT_VIDEO:
            if(!enabled)
            {
                onSelectVideo()
            }
            break;
        default:
            break;
    }
})

function init() {
    chrome.storage.local.get(location.hostname, (items) => {
        if(items[location.hostname]?.enabled)
        {
            onEnabled()
        }
    })
}

function onSelectVideo() {
    onEnabled()
    let timeout = 10000
    let interval = setInterval(() => {
        timeout -= 1

        if(timeout <= 0 || startedLoadImages)
        {
            clearInterval(interval)
            onDisable()
        }
    }, 1)
}

function onEnabled() {
    enabled = true
    
    m.mount(root, Modal)
}
function onDisable() {
    enabled = false

    state.images = []
    state.overlay = false
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
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
    }
}
function mouseover (e){
    if(!enabled) return
    if (e.target?.tagName == 'VIDEO') {
        hover = true
        if (delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
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
    getImages(video, onImageRecieved)
    .then(images => {
        let src = video.src == "" ? video.querySelector('source').src : video.src
        thumbnailCreated(images,  src, hostname)
    }).catch(uncompleteImagesList => {
    }).finally(() => {
        startedLoadImages = false

    })
    
    startedLoadImages = true
    state.images = []
    state.overlay = false

    m.redraw()

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


let Modal = {
    view: () => {
        return <div class={`${styles.overlay} ${state.overlay ? "" : styles.hidden}`} onclick={e => state.overlay = false}>
            <div class={styles.overlayModalContainer}>


                <div class={ `${styles.modal}`} onclick={ e => state.overlay = false }>
                    <div class={styles.gallery}>
                        {state.images.map(v =>
                            <div class={styles.galleryItem}>
                                <img position={v.index} src={v.dataUrl} class={styles.galleryImage} key={v.index}></img>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    }
}
