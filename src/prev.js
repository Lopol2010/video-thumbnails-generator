var $output
var scale = 0.25
var duration = 0
var slices = 5
var slicetimeIter
var output_images = []
let MAXWAIT = 5000

// let video = $("video").get(0);
// $output = $("#output");
// $("#capture").on('click', captureImage);



function makeSlicetimeIter(video) {
    let map = new Map()
    map.set(video, { currentSlice: 0, currentTime: 0 })
    let done = false

    console.log("slicetime called")
    return {
        next (video) {
            let cur = map.get(video)
            let curSlice = { currentSlice: ++cur.currentSlice, currentTime: Math.floor(video.duration / slices * cur.currentSlice) }
            if(cur.currentSlice >= slices)
            {
                map.set(video, curSlice)
                done = true
                return { done: true }
            }
            else
            {
                map.set(video, curSlice)
                return { done: false, value: curSlice }
            }
        },
        current (video) {
            return map.get(video)
        },
        isDone(video) {
            return done
        }
    }
}

function onVideoSeeked() {
    if(slicetimeIter.isDone())
    {
        console.log('done from isDone! ' + JSON.stringify(slicetimeIter.current(this)))
        // $('#output img').sort((a,b) => { console.log($(b).attr('position')); return $(a).attr('position') < $(b).attr('position') ? -1 : 1;  }).appendTo($output)
        output_images = output_images.sort((a,b) => { console.log(b.getAttribute('position')); return a.getAttribute('position') < b.getAttribute('position') ? -1 : 1;  })
        return
    }

    console.log('seeked')
    let curSlice = slicetimeIter.current(this)
    let img = slice(this, curSlice.currentTime, curSlice.currentSlice)
    output_images.push(img)
    // $output.prepend(img);

    // if(!slicetimeIter) return

    let next = slicetimeIter.next(this)
    if(next.done)
    {
        console.log('done!')
    }
    else
    {
        console.log('KKEE! ' + next.value.currentTime)
        this.currentTime = next.value.currentTime 
    }

}

export function getPreview(video) {
    beingSlicing(video)
    return new Promise((resolve, reject) => {
        let waittime = MAXWAIT
        let rate = 100
        let interval = setInterval(() => {
            console.log('interval')
            if(slicetimeIter.isDone())
            {
                resolve(output_images)
                clearInterval(interval)
            }
            else if(waittime > 0)
            {
                waittime -= rate
            }
            else if(waittime < 0)
            {
                resolve(output_images)
                clearInterval(interval)
            }
        }, rate)
    })
}

function beingSlicing(video) {
    duration = video.duration
    
    slicetimeIter = makeSlicetimeIter(video)
    console.log('duration set: ' + duration)
    video.addEventListener('seeked', onVideoSeeked)
    video.currentTime = 1 //slicetimeIter.next(this).value.currentTime
}

// $(video).on('loadedmetadata', function () {
//     duration = this.duration
//     slicetimeIter = makeSlicetimeIter(this)
//     console.log('duration set: ' + duration)
//     this.currentTime = 1 //slicetimeIter.next(this).value.currentTime
// })

function slice(video, time, index) {

    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    video.currentTime = time
    var img = document.createElement("img");

    canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log("slicing at " + time)
    img.src = canvas.toDataURL();
    img.setAttribute('position', index)

    return img
}