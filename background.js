// Handle getting auth token
async function getAuthToken() {
    console.log("🔑 Getting auth token...");

    // Retrieve the client ID from storage
    const clientId = await new Promise((resolve, reject) => {
        chrome.storage.local.get(['clientId'], function (result) {
            if (result.clientId) resolve(result.clientId);
            else reject(new Error("Client ID not set. Please enter it in the extension."));
        });
    });

    // Use the client ID to get the token
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                console.error("❌ Auth token error:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                console.log("✅ Auth token received:", token);
                resolve(token);
            }
        });
    });
}


// Handle appending to Google Sheets
async function appendToGoogleSheet(usernames) {
    try {
        if (!usernames || usernames.length === 0) {
            console.warn("⚠️ No usernames provided to append.");
            return;
        }

        console.log("📝 Attempting to append usernames:", usernames);

        const token = await getAuthToken();
        const { sheetId, sheetName } = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['sheetId', 'sheetName'], function (result) {
                if (result.sheetId && result.sheetName) resolve(result);
                else reject(new Error('Sheet ID or Sheet Name not set.'));
            });
        });

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`;
        console.log("🔗 Making request to URL:", url);
        const values = usernames.map(username => [username]);
        console.log("📤 Sending data:", values);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values }),
        });

        const responseData = await response.text();
        console.log("📥 Response status:", response.status);
        console.log("📥 Response data:", responseData);

        if (!response.ok) {
            throw new Error(`Failed to append to sheet: ${responseData}`);
        }

        console.log("✅ Successfully appended to sheet");
        return true;
    } catch (error) {
        console.error('❌ Error appending to Google Sheet:', error);
        throw error;
    }
}

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("📨 Received message in background:", message);
    
    if (message.command === "appendUsernames") {
        console.log("📋 Processing usernames:", message.usernames);
        
        appendToGoogleSheet(message.usernames)
            .then(() => {
                console.log("✅ Successfully processed usernames");
                sendResponse({ success: true });
            })
            .catch(error => {
                const errorMessage = error.message || "An unexpected error occurred.";
                console.error("❌ Error processing usernames:", errorMessage);
                sendResponse({ success: false, error: errorMessage });
            });
        return true; // Will respond asynchronously
    }
});

console.log("🚀 Background script loaded");
