async function getAuthToken() {
    console.log('🔑 Starting authentication process...');
    try {
      return new Promise((resolve, reject) => {
        console.log('📡 Requesting auth token from Chrome...');
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
          if (chrome.runtime.lastError) {
            console.error('❌ Chrome auth error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('✅ Token received successfully');
            console.log('🔍 Token format check:', typeof token, token ? 'Token exists' : 'Token is empty');
            resolve(token);
          }
        });
      });
    } catch (error) {
      console.error('💥 Error in getAuthToken:', error);
      throw error;
    }
  }
  
  async function appendToGoogleSheet(usernames) {
    console.log('📝 Starting append process for', usernames.length, 'usernames');
    try {
      console.log('🔐 Getting auth token...');
      const token = await getAuthToken();
      console.log('🎟️ Token received:', token ? 'Valid token' : 'No token');
  
      const SPREADSHEET_ID = '${1J1F4VsmQM12EM4LxNIamN0VpYp3oIL6vM3805draN2w}';
      const SHEET_NAME = 'Instagram Coaches URLs!A1';
  
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED`;
      console.log('🔗 API URL:', url);
  
      const values = usernames.map(username => [username]);
      console.log('📊 Prepared data:', values);
  
      console.log('🚀 Sending request to Google Sheets...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      });
  
      console.log('📨 Response status:', response.status);
      console.log('📨 Response OK:', response.ok);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to append to sheet: ${errorText}`);
      }
  
      const responseData = await response.json();
      console.log('✅ Success! API Response:', responseData);
      return true;
    } catch (error) {
      console.error('💥 Error in appendToGoogleSheet:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }
  
  // Add a test function to verify authentication
  async function testAuthentication() {
    console.log('🧪 Starting authentication test...');
    try {
      const token = await getAuthToken();
      console.log('✅ Authentication test successful');
      console.log('Token type:', typeof token);
      console.log('Token exists:', !!token);
      return true;
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      return false;
    }
  }
  
  export { getAuthToken, appendToGoogleSheet, testAuthentication };