const chatMessages = document.querySelector(".messages");
const messageInput = document.querySelector(".message-input input");
const chatTitle = document.querySelector(".chat-header h3");
const chatTime = document.querySelector(".chat-time");
const storageStatus = document.createElement("span");
const storageKey = `chat-messages-${encodeURIComponent(chatTitle.textContent.trim())}`;

storageStatus.className = "storage-status";
storageStatus.setAttribute("role", "alert");
storageStatus.style.cssText = "position: fixed; right: 12px; bottom: 80px; z-index: 10; max-width: 260px; color: #b00020; font-size: 12px;";
document.querySelector(".message-input").append(storageStatus);

function showStorageError(message) {
    storageStatus.textContent = message;
}

function loadChatMessages() {
    try {
        const savedMessages = localStorage.getItem(storageKey);

        if (savedMessages === null) {
            return null;
        }

        const parsedMessages = JSON.parse(savedMessages);
        const isValid = Array.isArray(parsedMessages) && parsedMessages.every((message) =>
            message &&
            typeof message.text === "string" &&
            (message.direction === "sent" || message.direction === "received")
        );

        if (!isValid) {
            throw new Error("Saved chat data has an invalid format.");
        }

        return parsedMessages;
    } catch (error) {
        console.error("Unable to load saved chat messages.", error);
        showStorageError("Could not load saved messages.");
        return null;
    }
}

function saveChatMessages(messages) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        showStorageError("");
        return true;
    } catch (error) {
        console.error("Unable to save chat messages.", error);
        showStorageError("Message sent, but it could not be saved on this device.");
        return false;
    }
}

function getInitialMessages() {
    return Array.from(chatMessages.querySelectorAll(".message-row"), (row) => ({
        text: row.querySelector(".message").innerText.trim(),
        direction: row.classList.contains("sent") ? "sent" : "received"
    }));
}

function renderMessage(message) {
    const row = document.createElement("div");
    row.className = `message-row ${message.direction}`;

    if (message.direction === "received") {
        const avatar = document.createElement("div");
        avatar.className = "avatar grey";
        avatar.textContent = chatTitle.textContent.trim().charAt(0);
        row.append(avatar);
    }

    const content = document.createElement("div");
    content.className = "message";
    content.textContent = message.text;
    content.style.whiteSpace = "pre-wrap";
    row.append(content);

    if (message.direction === "sent") {
        const avatar = document.createElement("div");
        avatar.className = "avatar dark";
        avatar.textContent = "R";
        row.append(avatar);
    }

    chatMessages.insertBefore(row, chatTime);
}

function renderMessages(messages) {
    chatMessages.querySelectorAll(".message-row").forEach((row) => row.remove());
    messages.forEach(renderMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateContactPreview(message) {
    const activeContact = Array.from(document.querySelectorAll(".contact")).find((contact) =>
        contact.querySelector(".contact-info h4")?.textContent.trim() === chatTitle.textContent.trim()
    );

    const preview = activeContact?.querySelector(".contact-info p");
    if (preview) {
        preview.textContent = message.text;
    }
}

let messages = getInitialMessages();
const savedMessages = loadChatMessages();

if (savedMessages !== null) {
    messages = savedMessages;
    renderMessages(messages);
}

messageInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    const text = messageInput.value.trim();
    if (!text) {
        return;
    }

    const message = { text, direction: "sent" };
    messages.push(message);
    renderMessage(message);
    updateContactPreview(message);

    if (saveChatMessages(messages)) {
        chatTime.textContent = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    messageInput.value = "";
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
