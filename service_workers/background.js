chrome.action.onClicked.addListener(async (tab) => {
    const { extensionEnabled = true } = await chrome.storage.local.get('extensionEnabled');
    const newState = !extensionEnabled;
    await chrome.storage.local.set({ extensionEnabled: newState });

    // Optionally update icon
    chrome.action.setIcon({
        path: newState
            ? { "16": "images/toggle_on-16.svg", "32": "images/toggle_on-32.svg" }
            : { "16": "images/toggle_on-16.svg", "32": "images/toggle_off-32.svg" }
    });

    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
        for (const t of tabs) {
            if (t.id) {
                chrome.tabs.sendMessage(t.id, { type: "TOGGLE_EXTENSION", enabled: newState });
            }
        }
    });
});