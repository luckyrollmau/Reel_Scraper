let isScrapingActive = false;
let collectedUsernames = [];
let checkInterval;

// Function to validate usernames
function isValidUsername(username) {
    username = username.trim();
    if (
        username.includes('Original audio') ||
        username.includes('·') ||
        username.includes('\n') ||
        username.includes('#') ||
        username.includes('(') ||
        username.includes(')') ||
        username.includes('Follow') ||
        username.includes('Hemenesy') ||
        username.includes('Solitude') ||
        username.includes('.mp3') ||
        username.startsWith('IN PARALLEL') ||
        /\d{2}:\d{2}/.test(username)
    ) {
        return false;
    }
    return /^[a-zA-Z0-9._]+$/.test(username);
}

// Function to extract usernames
function extractUsernames() {
    if (!isScrapingActive) return;

    const allLinks = document.querySelectorAll(
        'div[role="presentation"] a[role="link"][href^="/"]'
    );
    
    console.log("Found elements:", allLinks.length);

    let newUsernames = [];
    
    allLinks.forEach((usernameElement) => {
        const username = usernameElement.innerText.trim();
        if (username && !collectedUsernames.includes(username) && isValidUsername(username)) {
            collectedUsernames.push(username);
            newUsernames.push(username);
        }
    });

    if (newUsernames.length > 0) {
        console.log("✨ New usernames found:", newUsernames);
        chrome.runtime.sendMessage(
            { 
                command: "appendUsernames", 
                usernames: newUsernames 
            },
            function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError);
                } else {
                    console.log("✅ Successfully saved to Google Sheets");
                }
            }
        );
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "start") {
        isScrapingActive = true;
        // Initial check
        extractUsernames();
        
        // Set up periodic checking
        checkInterval = setInterval(extractUsernames, 1000); // Check every second
        
        sendResponse({ status: "Scraping started" });
    } else if (message.command === "stop") {
        isScrapingActive = false;
        // Clear the interval when stopping
        if (checkInterval) {
            clearInterval(checkInterval);
        }
        sendResponse({ status: "Scraping stopped" });
    }
    return true;
});

console.log("📱 Instagram Username Scraper content script loaded");