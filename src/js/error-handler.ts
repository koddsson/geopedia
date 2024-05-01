function handleError(event: ErrorEvent | PromiseRejectionEvent) {
  const searchParameters = new URLSearchParams(window.location.search);
  if (!searchParameters.has('debug')) {
    return;
  }

  if (event instanceof ErrorEvent) {
    alert(event.message);
  } else if (event instanceof PromiseRejectionEvent) {
    alert(event.reason);
  } else {
    alert(JSON.stringify(event, undefined, 4));
  }
}

window.addEventListener('error', handleError);
window.addEventListener('unhandledrejection', handleError);
