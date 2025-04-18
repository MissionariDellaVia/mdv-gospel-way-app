/* eslint-disable no-console */
import { register } from 'register-service-worker'

const swUrl = `${process.env.BASE_URL}service-worker.js?v=${process.env.VUE_APP_VERSION}`

register(swUrl, {
    ready() { console.log('SW active, serving from cache.') },
    registered(reg) {
        console.log('SW registered.')
        setInterval(() => reg.update(), 1000 * 60 * 60)
    },
    updatefound() { console.log('New SW found, downloading…') },
    updated(reg) {
        console.log('New SW available, dispatching swUpdated.')
        document.dispatchEvent(
            new CustomEvent('swUpdated', { detail: { registration: reg } })
        )
    }
})

// allow manual “pull to refresh” trigger
document.addEventListener('swUpdatedCheck', () => {
    navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
            reg.update()
        }
    })
})