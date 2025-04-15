/* eslint-disable no-console */
import { register } from 'register-service-worker'

// Get the correct base path for service worker
const getBaseUrl = () => {
    // Check if we're on GitHub Pages
    if (window.location.pathname.includes('/mdv-gospel-way-app/')) {
        return '/mdv-gospel-way-app/'
    }
    // Default to whatever Vue provides
    return process.env.BASE_URL || '/'
}

// Register with the correct path
register(`${getBaseUrl()}service-worker.js`, {
    ready() {
        console.log('App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB')
    },
    registered(registration) {
        console.log('Service worker has been registered successfully.')

        // Check for updates every hour
        setInterval(() => {
            console.log('Checking for service worker updates...')
            registration.update()
                .catch(error => console.error('Error checking for SW updates:', error))
        }, 1000 * 60 * 60)
    },
    cached() {
        console.log('Content has been cached for offline use.')
    },
    updatefound() {
        console.log('New content is downloading.')
    },
    updated(registration) {
        console.log('New content is available; please refresh.')

        document.dispatchEvent(
            new CustomEvent('swUpdated', {
                detail: { registration }
            })
        )
    },
    offline() {
        console.log('No internet connection found. App is running in offline mode.')
    },
    error(error) {
        console.error('Error during service worker registration:', error)
        console.log('Registration attempted at:', `${getBaseUrl()}service-worker.js`)

        // Add more debug info
        if (error && error.message) {
            console.log('Error details:', error.message)
        }
    }
})