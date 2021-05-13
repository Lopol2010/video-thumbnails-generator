import Hls from 'hls.js'


var $output
var scale = 0.25
var duration = 0
var slices = 10
var slicetimeIter
var output_images = []
let MAXWAIT = 5000
let ISDONE = false
let onImageRecievedCallback

function makeSlicetimeIter() {
    let done = false
    let curSlice = { currentSlice: 0, currentTime: 0 }
    return {
        next() {
            if (curSlice.currentSlice == slices) {
                return { done: true }
            }
            curSlice.currentSlice++
            curSlice.currentTime = getSliceTime(curSlice.currentSlice)
            return { done: false, value: curSlice }
        },
        current() {
            return curSlice
        },
        isDone() {
            return curSlice.currentSlice == slices
        }
    }
}

function onVideoSeeked() {

    
    let curSlice = slicetimeIter.next().value
    let img = slice(this, curSlice.currentSlice)
    // console.log("curslice " , curSlice.currentSlice, " isdone ", slicetimeIter.isDone(), img)
    output_images.push(img)
    onImageRecievedCallback(img)

    if(slicetimeIter.isDone())
    {
        output_images = output_images.sort((a, b) => { console.log(b.getAttribute('position')); return a.getAttribute('position') < b.getAttribute('position') ? -1 : 1; })
        console.log('done from isDone ! ' + JSON.stringify(slicetimeIter.current(), output_images))
        // document.body.append(output_images)
        return
    }

}

/**
 * 
 * @param {HTMLVideoElement} video target video to get preview images from
 * @param {(image: HTMLImageElement) => void} onImageRecieved newly loaded images will be passed in this callback 
 * @param {number} timeout max allowed time to wait for images
 * @returns 
 */
export function getImages(video, onImageRecieved, timeout = MAXWAIT) {
    beingSlicing(video)
    onImageRecievedCallback = onImageRecieved
    return new Promise((resolve, reject) => {
        
        let rate = 50
        let interval = setInterval(() => {
            console.log('interval')
            if (slicetimeIter.isDone()) {
                resolve(output_images)
                clearInterval(interval)
            }
            else if (timeout > 0) {
                timeout -= rate
            }
            else if (timeout <= 0) {
                resolve(output_images)
                clearInterval(interval)
            }
        }, rate)
    })
}
export function getPreview(video, threads) {
    try {
        beingSlicing(video)
    } catch (error) {
        console.log(error)
    }
    return new Promise((resolve, reject) => {
        let waittime = MAXWAIT
        let rate = 100
        let interval = setInterval(() => {
            console.log('interval')
            if (slicetimeIter.isDone()) {
                resolve(output_images)
                clearInterval(interval)
            }
            else if (waittime > 0) {
                waittime -= rate
            }
            else if (waittime <= 0) {
                resolve(output_images)
                clearInterval(interval)
            }
        }, rate)
    })
}
function getSliceTime(sliceNum) {
    return Math.floor(duration / slices * sliceNum - (duration/slices/2));
}
function beingSlicing(video, threads = true) {

    duration = video.duration
    slicetimeIter = makeSlicetimeIter(video)
    if (threads) {
        for (let i = 0; i < slices; i++) {
            if (video.src.search('.m3u8') != -1 || video.querySelector('source').src.search('.m3u8') != -1) {
                if (Hls.isSupported()) {
                    let hls = new Hls();
                    hls.loadSource(video.querySelector('source').src);
                    let newVideoElem = document.createElement('video')
                    document.body.prepend(newVideoElem)
                    hls.attachMedia(newVideoElem);
                    hls.on(Hls.Events.BUFFER_APPENDED, (e, buf) => console.log("BUFFER_APPENDED: "+buf))
                    newVideoElem.addEventListener('seeked', onVideoSeeked)
                    newVideoElem.currentTime = getSliceTime(i+1)
                    console.log('slicing threaded ', newVideoElem, (video.querySelector('source').src))
                }
                else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoSrc;
                }
            }
            else {

            }
        }
    }
    else {
        console.log('duration set: ' + duration)
        video.addEventListener('seeked', onVideoSeeked)
        video.currentTime = 1 //slicetimeIter.next(this).value.currentTime
    }
}

// $(video).on('loadedmetadata', function () {
//     duration = this.duration
//     slicetimeIter = makeSlicetimeIter(this)
//     console.log('duration set: ' + duration)
//     this.currentTime = 1 //slicetimeIter.next(this).value.currentTime
// })

function slice(video, index) {

    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    var img = document.createElement("img");

    canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log("slicing at " + getSliceTime(index))
    img.src = canvas.toDataURL();
    img.setAttribute('position', index)

    return img
}