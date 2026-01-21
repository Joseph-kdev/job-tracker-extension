console.log('Background service worker started');

// Example: Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Job Tracker Extension installed');
});
