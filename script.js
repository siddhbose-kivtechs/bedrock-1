// DOM Elements
const send_icon = document.getElementsByClassName("send-icon")[0];
const input = document.getElementsByClassName("InputMSG")[0];
const ContentChat = document.getElementsByClassName("ContentChat")[0];
const send1 = document.getElementById("send1");
const send2 = document.getElementById("send2");
const modelSelect = document.getElementById("modelSelect"); // New line
// local route 
// const BASE_URL = 'http://localhost:8080';
// const PRIMARY_URL = `${BASE_URL}/api/chat/bedrock`;

// live server route 
const BASE_URL ='https://python-test-snowy.vercel.app'
const PRIMARY_URL = `${BASE_URL}/api/bedrock`;


// Event Listeners
send_icon.addEventListener("click", SendMsgUser);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        SendMsgUser();
    }
});

// Bot Status (0 = ready, 1 = busy)
let status_func_SendMsgBot = 0;

// Function to Send User Message
function SendMsgUser() {
    if (input.value.trim() !== "" && status_func_SendMsgBot === 0) {
        const userMessage = input.value.trim();
        const timeNow = new Date().toLocaleTimeString();

        const userMsgElement = document.createElement("div");
        userMsgElement.classList.add("massage", "msgCaption");
        userMsgElement.setAttribute("data-user", "true");

        const formattedUserText = `🧑 You\n\n${userMessage}\n\n${timeNow}`;

        // userMsgElement.innerHTML = `
        //     <div class="user-response">${formattedUserText}</div>
        // `;

        userMsgElement.innerHTML = `
            <div class="user-response">
                ${formattedUserText}
                <button class="copy-btn" title="Copy to clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
        `;
        ContentChat.appendChild(userMsgElement);
        userMsgElement.scrollIntoView();

        input.value = "";
        SendMsgToServer(userMessage);
    }
}

// Function to Send Message to Server
function SendMsgToServer(msg) {
    // Prevent multiple simultaneous requests
    if (status_func_SendMsgBot === 1) return;
    send1.classList.add("none");
    send2.classList.remove("none");
    status_func_SendMsgBot = 1;

    // Add Loading Animation
    const loadingElement = document.createElement("div");
    loadingElement.classList.add("massage");
    loadingElement.innerHTML = `<div class="bot-response text" text-first="true"><svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000"><circle cx="20" cy="20" r="16" stroke-width="4" stroke-dasharray="30 50" stroke-linecap="round" style="animation: rot 1.5s linear infinite"></circle></svg></div>`;
    ContentChat.appendChild(loadingElement);
    loadingElement.scrollIntoView();


    let SERVER_URL;

    if (selectedModel) {
        switch (selectedModel) {
          case "cohere":
                SERVER_URL = `${PRIMARY_URL}/cohere`;
                break;
            case "titan":
                SERVER_URL = PRIMARY_URL;  // Using the base bedrock endpoint
                break;
            case "jamba":
                SERVER_URL = `${PRIMARY_URL}/jamba`;
                break;
            case "llama":
                SERVER_URL = `${PRIMARY_URL}/llama`;
                break;
            case "mistral":
                SERVER_URL = `${PRIMARY_URL}/mistral`;
                break;
            default:
                SERVER_URL = PRIMARY_URL;
                console.error("Invalid model selected!");
                return;
        }
    } else if (modelSelect) {
        const selectedDropdownModel = modelSelect.value;
        switch (selectedDropdownModel) {
            case "cohere":
                SERVER_URL = `${PRIMARY_URL}/cohere`;
                break;
            case "titan":
                SERVER_URL = PRIMARY_URL;  // Using the base bedrock endpoint
                break;
            case "jamba":
                SERVER_URL = `${PRIMARY_URL}/jamba`;
                break;
            case "llama":
                SERVER_URL = `${PRIMARY_URL}/llama`;
                break;
            case "mistral":
                SERVER_URL = `${PRIMARY_URL}/mistral`;
                break;
            default:
               SERVER_URL = PRIMARY_URL;
        }
    } else {
        console.error("No model selection method available!");
        return;
    }

    // Send Message to Server
    fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: msg }),
            signal: AbortSignal.timeout(50000) // 50-second timeout
        })
        .then((response) => {
            if (!response.ok) {
                // Handle specific HTTP error status codes
                switch (response.status) {
                    case 400:
                        throw new Error("Bad Request: Invalid message format");
                    case 500:
                        throw new Error("Server Error: Please try again later");
                    case 503:
                        throw new Error("Service Unavailable: Server is overloaded");
                    default:
                        throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then((data) => {
            // Replace Loading Animation with Bot Response
            const timeNow = new Date().toLocaleTimeString();
            const modelName = data.model || "titan-text-express"; // Assuming model name from the response
        //     const botHTML = `
        //     <div class="bot-response text" text-first="true">
        //         <div class="captionBot">
        //             <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="aws" />
        //             <span>${modelName.toUpperCase()}</span>
        //         </div>
        //         <div class="markdown-content">${marked.parse(data.response)}</div>
        //         <div class="time-stamp">${timeNow}</div>
        //     </div>
        // `;
            const botHTML = `
    <div class="bot-response text" text-first="true">
        <div class="captionBot">
            <img src="bedrock.png" alt="bedrock" />
            <span>${modelName.toUpperCase()}</span>
        </div>
        <div class="markdown-content">${marked.parse(data.response)}</div>
        <div class="time-stamp">${timeNow}</div>
        <button class="copy-btn" title="Copy to clipboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
    </div>
`;
            loadingElement.innerHTML = botHTML;

            loadingElement.scrollIntoView();

            // Update footer branding
            const bySpan = document.querySelector(".by");
            if (bySpan) {
                bySpan.innerHTML = `
                <span style="color: #cfcfcf;">Powered by</span>
                <a target="_blank" href="#" style="color: #10a37f; font-weight: bold; text-decoration: none; margin-left: 4px;">
                    Amazon Bedrock - ${modelName}
                </a>
            `;
            }
        })
        .catch((error) => {
            console.error("Error:", error);

            // More specific error messaging
            let errorMessage = "😵‍💫 Oops! Something went wrong.";

            if (error.name === 'AbortError') {
                errorMessage = "⏰ Request timed out. Please check your internet connection.";
            } else if (error.message.includes("Failed to fetch")) {
                errorMessage = "🌐 Network error. Please check your internet connection.";
            }

            loadingElement.innerHTML = `<div class="bot-response text" text-first="true">${errorMessage}</div>`;
            loadingElement.scrollIntoView();
        })
        .finally(() => {
            // Reset Bot Status
            status_func_SendMsgBot = 0;
            send2.classList.add("none");
            send1.classList.remove("none");
        });
}

// Initial Bot Greeting
// function sendInitialGreeting() {
//     const greetingElement = document.createElement("div");
//     greetingElement.classList.add("massage");
//     greetingElement.innerHTML = `<div class="bot-response text" text-first="true">Hi 👋 ! It's good to see you!</div><div class="bot-response text" text-last="true">How can I help you?</div>`;
//     ContentChat.appendChild(greetingElement);
//     greetingElement.scrollIntoView();
// }

// Initial Bot Greeting with Model Selection
let selectedModel = ""; // Variable to store the selected model



function sendInitialGreeting() {
    const greetingElement = document.createElement("div");
    greetingElement.classList.add("massage");
    greetingElement.innerHTML = `
        <div class="bot-response text" text-first="true">Hi 👋 ! It's good to see you!</div>
        <div class="bot-response text">Please select a model to start (optional, you can also use the dropdown):</div>
        <div class="bot-response model-list">
            <span class="model-option" data-model="cohere" style="cursor: pointer; color: #10a37f; font-weight: bold; margin-right: 10px;">Cohere Command R</span>
            <span class="model-option" data-model="titan" style="cursor: pointer; color: #10a37f; font-weight: bold; margin-right: 10px;">AWS Titan</span>
            <span class="model-option" data-model="mistral" style="cursor: pointer; color: #10a37f; font-weight: bold; margin-right: 10px;">Mistral</span>
            <span class="model-option" data-model="llama" style="cursor: pointer; color: #10a37f; font-weight: bold; margin-right: 10px;">Llama</span>
            <span class="model-option" data-model="jamba" style="cursor: pointer; color: #10a37f; font-weight: bold;">Jamba</span>
        </div>
        <div class="bot-response text" text-last="true">How can I help you?</div>
    `;
    ContentChat.appendChild(greetingElement);
    greetingElement.scrollIntoView();

    // Add event listeners to the model options
    const modelOptions = document.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectedModel = this.getAttribute('data-model');
            // Update UI to show selection (optional)
            const statusElement = document.querySelector('.status');
            if (statusElement) {
                statusElement.textContent = `Model selected: ${this.textContent}`;
            }
            // Optionally, you could also update the dropdown here to reflect the choice
            if (modelSelect) {
                modelSelect.value = selectedModel;
            }
        });
    });
}

// Send Initial Greeting After 2 Seconds
setTimeout(sendInitialGreeting, 2000);

// const SERVER_URL = atob(encodedUrl); // This will resolve to your backend API


// clipbaord copy 

function addCopyToClipboardFunctionality() {
    // Add event delegation for copy buttons
    ContentChat.addEventListener('click', function(event) {
        if (event.target.classList.contains('copy-btn') || event.target.parentElement.classList.contains('copy-btn')) {
            const copyBtn = event.target.classList.contains('copy-btn') ? event.target : event.target.parentElement;
            const textElement = copyBtn.closest('.bot-response, .user-response');
            
            // Get the text content to copy
            let textToCopy;
            
            if (textElement.classList.contains('bot-response')) {
                // For bot responses, find the markdown content
                const markdownContent = textElement.querySelector('.markdown-content');
                textToCopy = markdownContent ? markdownContent.innerText : textElement.innerText;
            } else {
                // For user messages, just get the text
                textToCopy = textElement.innerText.split('\n\n')[1]; // Get just the message part
            }
            
            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Change icon temporarily to show success
                    const originalHTML = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`;
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    });
}

// Call this function after page loads
document.addEventListener('DOMContentLoaded', function() {
    addCopyToClipboardFunctionality();
});


