import { getPreview } from './prev'

let hover = true
let delayHandle = null
let DELAY = 1000
document.addEventListener("mousehover", e => {
    if(e.target != null && e.target.tagName == 'VIDEO')
    {
        hover = true
        if(delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
    }
})
document.addEventListener("mouseover", e => {
    if(e.target != null && e.target.tagName == 'VIDEO')
    {
        console.log(e.target)
        hover = true
        if(delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY, e.target)
    }
})
document.addEventListener("mouseout", e => {
    if(e.target != null && e.target.tagName == 'VIDEO')
    {
        hover = false
        if(delayHandle != null)
        {
            console.log("timeout cleared")
            clearTimeout(delayHandle)
            delayHandle = null
        }
    }
})

function onDelayEnd(video) {
    if(delayHandle != null)
    {
        console.log("timeout cleared")
        clearTimeout(delayHandle)
        delayHandle = null
    }
    
    getPreview(video).then(images => {
        console.log(images)
    })

    console.log('delay ended')
}