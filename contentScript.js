const SHARE_BOX_CLASS = ".share-box";
const PARENT_WRAPPER_CLASS = ".feed-shared-update-v2";
const COMMENTARY_CLASS = ".feed-shared-update-v2__commentary";
const COMMENT_ITEM_CLASS = ".comments-comment-item";
const COMMENT_ITEM_CONTENT_CLASS =
  ".comments-highlighted-comment-item-content-body, .comments-comment-item-content-body";

function createIcon(editingBox) {
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "my-extension-icon-wrapper";

  const getBtn = document.createElement("button");
  getBtn.innerHTML = "> _";
  getBtn.className = "my-extension-btn prompt-only";

  const toProfBtn = document.createElement("button");
  toProfBtn.innerHTML = "Professionalize";
  toProfBtn.className = "my-extension-btn to-professional";

  const agreeBtn = document.createElement("button");
  agreeBtn.innerHTML = "Agreeing";
  agreeBtn.className = "my-extension-btn";

  const denyBtn = document.createElement("button");
  denyBtn.innerHTML = "Denying";
  denyBtn.className = "my-extension-btn";

  const agreeFunnyBtn = document.createElement("button");
  agreeFunnyBtn.innerHTML = "Agreeing ;)";
  agreeFunnyBtn.className = "my-extension-btn";

  const denyFunnyBtn = document.createElement("button");
  denyFunnyBtn.innerHTML = "Denying ;)";
  denyFunnyBtn.className = "my-extension-btn";

  const { commentary, commentedText } = getTextFromCommentary(editingBox);

  // console.log("commentary", commentary);
  // console.log("commentedText", commentedText);

  // add event listener for click event
  getBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    let prompt = editingBox.innerText;
    prompt = await replaceUrlsWithContent(prompt);

    if (commentary) prompt = prompt.replace("${post}", ` '''${commentary}''' `);
    if (commentedText)
      prompt = prompt.replace("${comment}", ` '''${commentedText}''' `);

    // console.log(prompt);
    const response = await sendMessageToOpenAI(prompt);
    editingBox.innerText = response;
  });

  // add event listener for click event
  toProfBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    const text = editingBox.innerText;
    const prompt =
      'Please convert this text to professional language: "' + text + '"';
    const response = await sendMessageToOpenAI(prompt);
    editingBox.innerText = response;
  });

  // add code to position the icon and buttons
  iconWrapper.appendChild(getBtn);
  iconWrapper.appendChild(toProfBtn);

  if (commentary !== false) {
    iconWrapper.appendChild(agreeBtn);
    iconWrapper.appendChild(denyBtn);
    iconWrapper.appendChild(agreeFunnyBtn);
    iconWrapper.appendChild(denyFunnyBtn);

    // add event listener for click event
    agreeBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      let prompt = `THE_POST='''${commentary}'''\n\n\n`;
      if (commentedText) {
        prompt += `THE_COMMENT='''${commentedText}'''\n\n\n`;
        prompt += `give me a text to appreciate or praise the comment (defined as variable quoted by ''' above) that show that I am aligned with this the comment that what is says in respect the post (defined as variable quoted by ''' above) is good with proper reasoning why I am aligned and what I liked this comment most and why? Also keep a tone to praise commentor for their support or thoughtfulness if the text is as such. like a quite short comment on some linkedin post, in maximum 2~3 lines`;
      } else {
        prompt += `give me a text to appreciate or praise the post (Not by simply starting I appreciate this post) that show that I am aligned with this with proper reasoning why I am aligned and what I liked the most and why? like a quite short comment on some linkedin post, in maximum 3~4 lines`;
      }
      const response = await sendMessageToOpenAI(prompt);
      editingBox.innerText = response;
    });

    // add event listener for click event
    denyBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      let prompt = `THE_POST='''${commentary}'''\n\n\n`;
      if (commentedText) {
        prompt += `THE_COMMENT='''${commentedText}'''\n\n\n`;
        prompt += `give me a text to disagree or deny the comment that show that I am not aligned with the comment, that what is says in respect the post is not correct with proper reasoning why I am not aligned and what is in the post that is more appropriate with proper reasoning? Also keep a tone to praise commentor for their views or thoughtfulness if the text is as such. like a quite short comment on some linkedin post, in maximum 2~3 lines`;
      } else {
        prompt += `give me a text to disagree with the post that show that I do not agree with this with proper reasoning why I am not aligned and what I did not like the most and why? like a quite short comment on some linkedin post, in maximum 3~4 lines`;
      }
      const response = await sendMessageToOpenAI(prompt);
      editingBox.innerText = response;
    });

    // add event listener for click event
    agreeFunnyBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      let prompt = `THE_POST='''${commentary}'''\n\n\n`;
      if (commentedText) {
        prompt += `THE_COMMENT='''${commentedText}'''\n\n\n`;
        prompt += `give me a text to appreciate or praise the comment in very funny way and if possible without hurting in generic sarcasm way that show in funny way that I am aligned with the comment and the post with proper reasoning (funny perspective) why I am aligned and what I liked the most and why? like a quite short comment on some linkedin post, in maximum 3~4 lines`;
      } else {
        prompt += `give me a text to appreciate or praise the post in very funny way and if possible without hurting in generic sarcasm way that show in funny way that I am aligned with this with proper reasoning (funny perspective) why I am aligned and what I liked the most and why? like a quite short comment on some linkedin post, in maximum 3~4 lines`;
      }
      const response = await sendMessageToOpenAI(prompt);
      editingBox.innerText = response;
    });

    // add event listener for click event
    denyFunnyBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      let prompt = `THE_POST='''${commentary}'''\n\n\n`;
      if (commentedText) {
        prompt += `THE_COMMENT='''${commentedText}'''\n\n\n`;
        prompt += `give me a text to disagree or deny THE_COMMENT in very funny way that show that I am not aligned with THE_COMMENT, that what is says in respect THE_POST is not correct with proper reasoning why I am not aligned with THE_COMMENT and may be why I am aligned with THE_POST more, what is in the post that is more appropriate with proper reasoning (funny perspective but till correct)? Also keep a tone to praise commentor for their views or thoughtfulness if the text is as such. like a quite short comment on some linkedin post, in maximum 2~3 lines`;
      } else {
        prompt += `give me a text to disagree with THE_POST in very funny way and if possible without hurting in generic sarcasm way that show that I do not agree with this with proper reasoning (funny perspective) why I am not aligned and what I did not like the most and why? like a quite short comment on some linkedin post, in maximum 3~4 lines`;
      }
      const response = await sendMessageToOpenAI(prompt);
      editingBox.innerText = response;
    });
  }

  editingBox.parentElement.appendChild(iconWrapper);
}

async function replaceUrlsWithContent(prompt) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = prompt.match(urlRegex);

  if (urls) {
    for (const url of urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const body = doc.querySelector("body");
        const text = body.textContent.replace(/\s+/g, " ").trim();
        prompt = prompt.replace(url, text);
      } catch (error) {
        console.error(`Error fetching URL ${url}: ${error}`);
      }
    }
  }

  return prompt;
}

// Function to remove the icon
function removeIcon(editingBox) {
  const icon = editingBox.parentElement.querySelector(".my-extension-icon");
  if (icon) {
    icon.remove();
  }
}

function getTextFromCommentary(editingBox) {
  const shareBox = editingBox.parentElement.closest(SHARE_BOX_CLASS);
  if (shareBox) {
    return {
      commentary: false,
      commentedText: false,
    };
  }

  const parentWrapper = editingBox.parentElement.closest(PARENT_WRAPPER_CLASS);
  if (!parentWrapper) {
    return {
      commentary: "",
      commentedText: "",
    };
  }

  const commentary = parentWrapper.querySelector(COMMENTARY_CLASS);
  if (!commentary) {
    return {
      commentary: "",
      commentedText: "",
    };
  }

  const html = commentary.innerHTML;
  const div = document.createElement("div");
  div.innerHTML = html;
  const commentaryText = div.textContent || div.innerText || "";

  const commentItemContentBody =
    editingBox.parentElement.closest(COMMENT_ITEM_CLASS);
  if (!commentItemContentBody) {
    return {
      commentary: commentaryText,
      commentedText: "",
    };
  }

  const interetstedComment = commentItemContentBody.querySelector(
    COMMENT_ITEM_CONTENT_CLASS
  );

  const commentedText = interetstedComment.textContent.trim();

  return {
    commentary: commentaryText,
    commentedText: commentedText,
  };
}

// Callback function for the MutationObserver
function handleMutation(mutationsList, observer) {
  let iconCreated = false; // flag variable to track if icon is created
  mutationsList.some((mutation) => {
    // use some instead of forEach
    if (mutation.type === "childList") {
      return Array.from(mutation.addedNodes).some((node) => {
        // use some instead of forEach
        if (node.querySelector && node.querySelector(".ql-editor")) {
          createIcon(node.querySelector(".ql-editor"));
          iconCreated = true; // set flag to true when icon is created
          return true; // break inner some loop
        }
        return false;
      });
    }
    return false;
  });
  // if (iconCreated) {
  //   // if icon is created, break outer some loop
  //   observer.disconnect();
  // }
}

async function sendMessageToOpenAI(prompt) {
  const API_ENDPOINT = "https://api.openai.com/v1/completions  ";
  const API_KEY = await getAPIKey();

  const data = {
    model: "text-davinci-003",
    prompt,
    max_tokens: 1000,
    temperature: 0.3,
  };
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (json.choices && json.choices.length > 0) {
    const message = json.choices[0].text;
    return message.trim();
  } else {
    throw new Error("No response from OpenAI API");
  }
}

async function getAPIKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("chrome_openai_apiKey", function (data) {
      console.log("Retrieved data from storage:", data);
      const apiKey = data.chrome_openai_apiKey;
      if (apiKey) {
        resolve(apiKey);
      } else {
        reject(new Error("API key not found"));
      }
    });
  });
}

// Attach the MutationObserver to the document body
const observer = new MutationObserver(handleMutation);
observer.observe(document.body, { childList: true, subtree: true });
