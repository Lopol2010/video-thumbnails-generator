import Hls from 'hls.js'

var scale = 0.25
var duration = 0
var slices = 10
// var slicetimeIter
let currentSlice = 0
var output_images = []
let MAXWAIT = 60000
let onImageRecievedCallback

function makeSlicetimeIter() {
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

// function onVideoSeekedSeq() {
//     let curSlice = slicetimeIter.current().value
//     let img = slice(this, curSlice.currentSlice)
//     output_images.push(img)
//     onImageRecievedCallback(img)
//     this.currentTime = getSliceTime(curSlice.currentSlice)
// }

function onVideoSeeked(index, hls) {

    let img = slice(this, index)
    output_images.push(img)
    currentSlice ++
    onImageRecievedCallback(img)

    if(hls)
    {
        hls.stopLoad()
        hls.detachMedia()
        hls.destroy()
    }
    this.remove()
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
            // console.log('interval')
            if (currentSlice == slices) {
                resolve(output_images)
                clearInterval(interval)
            }
            else if (timeout > 0) {
                timeout -= rate
            }
            else if (timeout <= 0) {
                reject(output_images)
                clearInterval(interval)
            }
        }, rate)
    })
}
// export function getPreview(video, sequentially = false) {
//     try {
//         beingSlicing(video)
//     } catch (error) {
//         console.log(error)
//     }
//     return new Promise((resolve, reject) => {
//         let waittime = MAXWAIT
//         let rate = 100
//         let interval = setInterval(() => {
//             console.log('interval')
//             if (slicetimeIter.isDone()) {
//                 resolve(output_images)
//                 clearInterval(interval)
//             }
//             else if (waittime > 0) {
//                 waittime -= rate
//             }
//             else if (waittime <= 0) {
//                 resolve(output_images)
//                 clearInterval(interval)
//             }
//         }, rate)
//     })
// }
function getSliceTime(sliceNum) {
    return (duration / slices * sliceNum - (duration / slices / 2));
}

/**
 * 
 * @param {HTMLVideoElement} video 
 * @param {Boolean} sequentially Should load images one by one, or try to create video duplicates where each 
 *                              loads its own image (kind of multi-threading) 
 *                              currently only false value supported. 
 */
function beingSlicing(video, sequentially = false) {

    duration = video.duration
    // slicetimeIter = makeSlicetimeIter()
    if (!sequentially) {
        for (let i = 0; i < slices; i++) {
            let hlsSource = video.querySelector('source').src
            if (hlsSource.search('.m3u8') != -1) {
                if (Hls.isSupported()) {
                    let hls = new Hls({
                        startPosition: getSliceTime(i + 1),
                        maxBufferLength: 0.1,
                        backBufferLength: 0,
                        maxBufferSize: 5 * 1000 * 1000,
                    });

                    let newVideoElem = document.createElement('video')
                    newVideoElem.muted = true
                    newVideoElem.style.display = 'none'
                    newVideoElem.addEventListener('seeked', e => {
                        onVideoSeeked.call(newVideoElem, i + 1, hls)
                    })
                    document.body.prepend(newVideoElem)
                    hls.loadSource(video.querySelector('source').src);
                    hls.attachMedia(newVideoElem);
                    // console.log('slicing threaded ', newVideoElem, (video.querySelector('source').src), getSliceTime(i + 1))
                }
                else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    //TODO
                }
            }
            else {
                    let src = video.src == "" ? video.querySelector('source').src : video.src
                    duration = video.duration
                // video.addEventListener('loadedmetadata', function () {
                    let newVideoElem = document.createElement('video')
                    newVideoElem.src = src
                    newVideoElem.preload = 'metadata'
                    newVideoElem.muted = true
                    newVideoElem.style.display = 'none'
                    newVideoElem.addEventListener('seeked', e => {
                        onVideoSeeked.call(newVideoElem, i + 1)
                    })
                    document.body.prepend(newVideoElem)
                    // console.log('duration set: ' + duration)
                    // console.log(video.src, src, video.querySelector('source').src)
                    newVideoElem.currentTime = getSliceTime(i+1)
                    newVideoElem.load()
                // })
            }
        }
    }
    else {
        // Sequenced loading not need for now. Maybe implement in future if some domains gonna block non-sequenced loading.
        // video.addEventListener('loadedmetadata', function () {

        //     duration = this.duration
        //     slicetimeIter = makeSlicetimeIter()

        //     video.addEventListener('seeked', function () {
        //         onVideoSeekedSeq.call(this)
        //     })
        //     video.currentTime = slicetimeIter.next().value.currentTime
        // })
    }
}

function slice(video, index) {

    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);

    return { index: index, dataUrl: canvas.toDataURL("image/jpeg") }
}