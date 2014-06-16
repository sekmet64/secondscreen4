function getIdFromCurrentUrl() {
    var parts = document.URL.split('/');
    return parts[parts.length - 1];
}