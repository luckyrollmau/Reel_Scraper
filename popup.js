document.addEventListener('DOMContentLoaded', function () {
    const inputs = {
        clientId: document.getElementById('clientIdInput'),
        sheetId: document.getElementById('sheetIdInput'),
        sheetName: document.getElementById('sheetNameInput'),
    };
    const displays = {
        clientId: document.getElementById('currentClientId'),
        sheetId: document.getElementById('currentSheetId'),
        sheetName: document.getElementById('currentSheetName'),
    };
    const statusDiv = document.getElementById('status');

    function updateStatus(message, error = false) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.style.color = error ? 'red' : 'green';
    }
    
    // Validate Client ID before saving
    document.getElementById('saveClientId').addEventListener('click', function () {
        const clientId = document.getElementById('clientIdInput').value.trim();
        if (clientId) {
            chrome.storage.local.set({ clientId }, function () {
                updateStatus("Client ID saved successfully!");
            });
        } else {
            updateStatus("Please enter a valid Client ID.", true);
        }
    });
    

    function updateDisplay(field, value) {
        displays[field].textContent = value
            ? `Current ${field.replace('Id', ' ID')}: ${value}`
            : `No ${field.replace('Id', ' ID')} saved.`;
    }

    // Load saved data from Chrome storage
    chrome.storage.local.get(['clientId', 'sheetId', 'sheetName'], function (result) {
        for (const [key, input] of Object.entries(inputs)) {
            if (result[key]) {
                input.value = result[key];
                updateDisplay(key, result[key]);
            } else {
                updateDisplay(key, null);
            }
        }
    });

    // Save input values
    for (const [key, input] of Object.entries(inputs)) {
        document.getElementById(`save${key.charAt(0).toUpperCase() + key.slice(1)}`).addEventListener('click', function () {
            const value = input.value.trim();
            if (value) {
                chrome.storage.local.set({ [key]: value }, function () {
                    updateStatus(`${key.replace('Id', ' ID')} saved successfully!`);
                    updateDisplay(key, value);
                });
            } else {
                updateStatus(`Please enter a valid ${key.replace('Id', ' ID')}.`, true);
            }
        });
    }

    // Start scraping
    document.getElementById('start').addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs[0]?.id) {
                updateStatus('Error: No active tab', true);
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { command: 'start' }, function (response) {
                if (chrome.runtime.lastError) {
                    updateStatus('Error: ' + chrome.runtime.lastError.message, true);
                    return;
                }
                updateStatus('Scraping started');
            });
        });
    });

    // Stop scraping
    document.getElementById('stop').addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs[0]?.id) {
                updateStatus('Error: No active tab', true);
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { command: 'stop' }, function (response) {
                if (chrome.runtime.lastError) {
                    updateStatus('Error: ' + chrome.runtime.lastError.message, true);
                    return;
                }
                updateStatus('Scraping stopped');
            });
        });
    });
});
