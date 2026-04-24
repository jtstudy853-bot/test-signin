const CLIENT_ID = "1083083815618-tmq56pmm6011d6p0i21it8sb231rr92g.apps.googleusercontent.com";

let accessToken = null;
let gmailEmail = null;

// INIT GOOGLE SIGN-IN
window.onload = () => {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("gSignIn"),
    { theme: "outline", size: "large" }
  );
};

// STEP 1: LOGIN
function handleLogin(response) {
  const payload = JSON.parse(atob(response.credential.split('.')[1]));

  gmailEmail = payload.email;

  document.getElementById("gmailEmail").textContent = gmailEmail;
  document.getElementById("gmailConnected").style.display = "block";
  document.getElementById("gSignIn").style.display = "none";

  requestGmailAccess();
}

// STEP 2: REQUEST GMAIL SCOPE
function requestGmailAccess() {
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    callback: (res) => {
      accessToken = res.access_token;

      // send token to backend
      fetch("http://localhost:3000/api/start-gmail", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ accessToken })
      });

      startPolling();
    }
  });

  tokenClient.requestAccessToken();
}

// STEP 3: POLL BACKEND FOR NEW EMAILS
function startPolling() {
  setInterval(async () => {
    const res = await fetch("http://localhost:3000/api/check-email");
    const data = await res.json();

    if (data.newEmail) {
      triggerAlert("email", "l", "GMAIL");

      if (window.btConnected) {
        sendCmd("EMAIL:LOW:GMAIL");
      }
    }
  }, 5000);
}

// ALERT SYSTEM (HOOK INTO YOUR EXISTING SYSTEM)
function triggerAlert(type, urgency, source) {
  console.log("ALERT:", type, urgency, source);
}

// BLE COMMAND (YOU ALREADY HAVE THIS IN YOUR PROJECT)
function sendCmd(cmd) {
  console.log("SEND TO MICROBIT:", cmd);
}

// LOGOUT
function logout() {
  location.reload();
}
