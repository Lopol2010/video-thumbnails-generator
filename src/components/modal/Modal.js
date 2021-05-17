import styles from './Modal.sass'
import {s} from '../../shared/utils'
let m = require('mithril')

export function Modal() {

    return {
        view: (vnode) => {
            return (
                <div class={s(styles.overlay, vnode.attrs.hidden ? styles.hidden : '')} onclick={vnode.attrs.onclick}>
                    <div class={styles.overlayModalContainer}>
                        <div class={`${styles.modal}`} onclick={vnode.attrs.onclick}>
                            <div class={styles.gallery}>
                                {vnode.attrs.images.map(v =>
                                    <div class={styles.galleryItem}>
                                        <img position={v.index} src={v.dataUrl} class={styles.galleryImage} key={v.index}></img>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}