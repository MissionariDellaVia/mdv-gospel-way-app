/* eslint-disable no-console */
import { register } from 'register-service-worker'

// Use the app version (not Date.now()) so SW only updates on a new build
const swUrl = `${process.env.BASE_URL}service-worker.js?v=${process.env.VUE_APP_VERSION}`

register(swUrl, {
    ready() {
        console.log('Service worker active, serving from cache.')
    },
    registered(reg) {
        console.log('Service worker registered.')
        // Optional: check for updates every hour
        setInterval(() => {
            console.log('Checking for SW update…')
            reg.update()
        }, 1000 * 60 * 60)
    },
    updatefound() {
        console.log('New service worker found, downloading…')
    },
    updated(reg) {
        console.log('New service worker available, dispatching swUpdated.')
        // Dispatch only when a new SW is actually waiting
        document.dispatchEvent(
            new CustomEvent('swUpdated', { detail: { registration: reg } })
        )
    },
    offline() {
        console.log('No internet connection — running offline.')
    },
    error(error) {
        console.error('SW registration error:', error)
    }
})