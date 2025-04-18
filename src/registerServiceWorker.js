/* eslint-disable no-console */
import {register} from 'register-service-worker'

// stamp the SW URL only when your app version changes
const swUrl = `${process.env.BASE_URL}service-worker.js?v=${process.env.VUE_APP_VERSION}`

register(swUrl, {
    ready() {
        console.log('SW active, serving from cache.')
    },
    registered(reg) {
        console.log('SW registered.')
        // hourly update checks
        setInterval(() => {
            console.log('Checking for SW update…')
            reg.update()
        }, 1000 * 60 * 60)
    },
    updatefound() {
        console.log('New SW found, downloading…')
    },
    updated(reg) {
        console.log('New SW available, dispatching swUpdated.')
        document.dispatchEvent(
            new CustomEvent('swUpdated', {detail: {registration: reg}})
        )
    },
    offline() {
        console.log('Offline mode.')
    },
    error(err) {
        console.error('SW registration error:', err)
    }
})