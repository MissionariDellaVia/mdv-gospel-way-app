/* eslint-disable no-console */
import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}service-worker.js`, {
        ready () {
            console.log('App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB')
        },
        registered (registration) {
            console.log('Service worker has been registered.')

            // Check for updates every hour
            setInterval(() => {
                registration.update();
            }, 1000 * 60 * 60);
        },
        cached () {
            console.log('Content has been cached for offline use.')
        },
        updatefound () {
            console.log('New content is downloading.')
        },
        // Fix line 40 - use _event instead of event
        updated (_event) {
            console.log('New content is available; please refresh.')

            // Dispatch a custom event that we can listen for in our app
            document.dispatchEvent(
                new CustomEvent('swUpdated', { detail: _event })
            )
        },
        offline () {
            console.log('No internet connection found. App is running in offline mode.')
        },
        // Fix line 45 - use _error instead of event (this looks like it might be an actual error in your code)
        error (_error) {
            console.error('Error during service worker registration:', _error)
        }
    })
}