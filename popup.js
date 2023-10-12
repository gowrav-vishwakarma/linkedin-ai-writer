const apiKeyInput = document.getElementById("api-key");
console.log("apiKeyInput", apiKeyInput); // log the apiKeyInput to verify it exists

// Load the stored API key and fill the input field
chrome.storage.local.get("chrome_openai_apiKey", (data) => {
  console.log(data); // log the data to see if the key is being properly loaded
  if (data.chrome_openai_apiKey) {
    apiKeyInput.value = data.chrome_openai_apiKey;
  }
});

// Handle form submission
const form = document.querySelector("form");
const submitBtn = document.querySelector("input[type='submit']");
submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  // Save the API key to storage
  const apiKey = apiKeyInput.value.trim();
  console.log("here saving", apiKey, "to storage");
  chrome.storage.local.set({ chrome_openai_apiKey: apiKey }, () => {
    console.log("API key saved:", apiKey);
  });
});
