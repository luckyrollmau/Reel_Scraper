const express = require("express");
const { google } = require("googleapis");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Load your service account key JSON
const KEYFILE = require("./service-account.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let sheets;

(async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: KEYFILE,
      scopes: SCOPES,
    });

    sheets = google.sheets({ version: "v4", auth });
    console.log("Google Sheets API connected.");
  } catch (error) {
    console.error("Error connecting to Google Sheets API:", error);
  }
})();

// Healthcheck endpoint
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Endpoint to append usernames to Google Sheets
app.post("/addUsernames", async (req, res) => {
  try {
    const { spreadsheetId, sheetName, usernames } = req.body;
    console.log("Spreadsheet ID:", spreadsheetId); // Debug
    console.log("Sheet Name:", sheetName); // Debug
    console.log("Usernames:", usernames); // Debug

    const values = usernames.map((username) => [username]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({ message: "Usernames added successfully!" });
  } catch (error) {
    console.error("Error appending data:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
