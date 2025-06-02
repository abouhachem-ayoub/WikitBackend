const { google } = require("googleapis");

// Replace with your client ID and client secret
const CLIENT_ID = "938483265338-0cc5g2ifrcnf79cej5i7fn5i58unu9j6.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // Use Google's OAuth Playground

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate the URL for authorization
const SCOPES = ["https://mail.google.com/"];
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("Authorize this app by visiting this URL:", authUrl);

// After authorizing, paste the code from the URL into the script
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the code from that page here: ", (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error("Error retrieving access token", err);
    console.log("Refresh Token:", token.refresh_token);
  });
});