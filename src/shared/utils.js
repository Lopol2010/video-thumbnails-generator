/**
 * Concatenate strings
 * Helper for work with class
 * @param  {...any} args strings to concatenate
 * @returns string
 */
export function s(...args) {
    return args.filter(v => typeof v === 'string').join(' ')
}

export function getVideoSrc(video) {
    let src = video.src ? video.src : video.querySelector('source').src 
    return src
}