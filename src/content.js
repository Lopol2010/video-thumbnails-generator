let hover = true
let delayHandle = null
let DELAY = 1000
document.addEventListener("mousehover", e => {
    if(e.target != null && e.target.tagName?.toLowerCase() == 'video')
    {
        hover = true
        if(delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY)
    }
})
document.addEventListener("mouseover", e => {
    if(e.target != null && e.target.tagName?.toLowerCase() == 'video')
    {
        console.log(e.target)
        hover = true
        if(delayHandle == null)
            delayHandle = setTimeout(onDelayEnd, DELAY)
    }
})
document.addEventListener("mouseout", e => {
    if(e.target != null && e.target.tagName?.toLowerCase() == 'video')
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

function onDelayEnd() {
    console.log('delay ended')
}