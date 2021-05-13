import './content.sass'
import { getImages, getPreview } from './prev'
let m = require('mithril')

let hover = true
let delayHandle = null
let DELAY = 1000

console.log("contejs")

chrome.storage.onChanged.addListener(onStorageChange)
function onStorageChange(changes, area) {
    console.log("changed", changes)
    if (changes[location.hostname]?.newValue) {
        console.log("CHANGES")
        console.log(changes)
    }
}

document.addEventListener("mousehover", e => {
    if (e.target != null && e.target.tagName == 'VIDEO') {
        hover = true
        if (delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
    }
})
document.addEventListener("mouseover", e => {
    if (e.target != null && e.target.tagName == 'VIDEO') {
        console.log(e.target)
        hover = true
        if (delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
    }
})
document.addEventListener("mouseout", e => {
    if (e.target != null && e.target.tagName == 'VIDEO') {
        hover = false
        if (delayHandle != null) {
            console.log("timeout cleared")
            clearTimeout(delayHandle)
            delayHandle = null
        }
    }
})

function onDelayEnd(video) {
    if (delayHandle != null) {
        console.log("timeout cleared")
        clearTimeout(delayHandle)
        delayHandle = null
    }

    getImages(video, onImageRecieved)

    console.log('delay ended')
}
function onImageRecieved(image) {

    state.images.push(image)
    // console.log("recieved image: ", image)
    m.redraw()
}

let state = {
    images: []
}

let Modal = {
    view: () => {
        return <div class="overlay">
            <div class="overlay__modal-container">


                <div class={`modal ${state.images.length > 0 ? "" : "hidden"}`} onclick={function () {
                    this.remove()
                }}>
                    <div class="gallery">
                        {state.images.map(v =>
                            <div class="gallery__item">
                                <img src={v.src} class="gallery__image" key={v.getAttribute('position')}></img>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    }
}
let root = document.createElement('div')
document.body.append(root)
m.mount(root, Modal)