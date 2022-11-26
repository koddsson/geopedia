function handleError(event: ErrorEvent | PromiseRejectionEvent) {
  const searchParams = new URLSearchParams(window.location.search)
  if (!searchParams.has('debug')) {
    return
  }

  if (event instanceof ErrorEvent) {
    alert(event.message)
  } else if (event instanceof PromiseRejectionEvent) {
    alert(event.reason)
  } else {
    alert(JSON.stringify(event, null, 4))
  }
}

window.addEventListener("error", handleError)
window.addEventListener('unhandledrejection', handleError)
