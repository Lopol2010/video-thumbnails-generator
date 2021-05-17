// import styles from '../../content.sass'
import styles from './NotificationComponent.sass'
import {s} from '../../shared/utils'

let m = require('mithril')

// {
//     text: "",
//     subtext: "",
//     duration: 3000,
//     id: Date.UTC,
//     onclick: handler
// }
let state = {
    list: [],
    destroy: (opts) => {
        let idx = state.list.findIndex(v => v.id === opts.id)
        state.list.splice(idx, 1)
    }
}



export function addInfo({ text = "", subtext = "", duration = 4000, onclick = null } = {}) {
    let opts = {}
    opts.text = text
    opts.subtext = subtext
    opts.duration = duration
    opts.onclick = onclick
    opts.id = Date.now()
    state.list.push(opts)
}

export function Notifications() {
    return {
        view: () => {
            return (
                <div class={styles.notificationsList}>
                    {
                        state.list.map(v => {
                            return (
                                <div key={v.id}>{m(NotificationComponent, v)}</div>
                            )
                        })
                    }
                </div>
            )
        }
    }
}
export function NotificationComponent() {

    function destroy(vnode) {
        vnode.dom.classList.add(styles.notificationDisappear)
        setTimeout(() => {
            state.destroy(vnode.attrs)
            m.redraw()
        }, 300)
    }

    return {
        oninit: (vnode) => {
            // console.log(vnode.attrs)
            setTimeout(() => {
                destroy(vnode)
            }, vnode.attrs.duration)
        },

        view: (vnode) => {

            return (
                <div class={s(styles.notification, styles.notificationAppear)} onclick={vnode.attrs.onclick}>
                    <div class={styles.notificationText}>
                        {vnode.attrs.text}
                    </div>
                    <div class={styles.notificationSubtext}>{vnode.attrs.subtext}</div>
                </div>
            )
        }
    }
}

