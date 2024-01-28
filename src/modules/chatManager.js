let conversationHistory = [
	{ "role": "system", "content": "Provide instructions for controlling a 3D scene, like 'move camera closer to the earth or a specific place' or 'move camera further from the earth." }
];

const input_field = document.getElementById('chat-input');
const send_btn = document.getElementById('send-btn');

send_btn.addEventListener('click', function (event) {
	sendMessage();
});

input_field.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		sendMessage();
	}
});

//Sends a user message to the API, receives a response, and updates the conversation history.
function sendMessage() {
	const message = input_field.value;
	
	if (message) {
		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({ "role": "user", "content": message });
		
		fetch('http://localhost:5000/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				prompt: message,
				conversation: conversationHistory
			})
		}).then(response => {
			//no success in making connection or unauthorized
			if (!response.ok && response.status === 429 && retryCount < maxRetries) {
				retryCount++;
				const retryDelay = Math.pow(2, retryCount) * 1000;
				setTimeout(sendtochat, retryDelay);
				return;
			}
			return response.json();
		}).then(data => {
			displayGPTMessage(`ChatGPT: ${data.reply}\n`);
			handleChatGPTResponse(data.reply);
			//update conversation history
			conversationHistory = data.conversation;
		}).catch(error => console.error('Error:', error));
		
		input_field.value = '';
	}
}

function displayUserMessage(message) {
	const messages_container = document.getElementById('messages');
	const new_message_div = document.createElement('div');
	new_message_div.className = 'message-bubble';
	new_message_div.textContent = message + "\n";
	messages_container.appendChild(new_message_div);
}

function displayGPTMessage(message) {
	const messages_container = document.getElementById('messages');
	const new_message_div = document.createElement('div');
	new_message_div.className = 'message-bubble-GPT';
	new_message_div.textContent = message + "\n";
	messages_container.appendChild(new_message_div);
}

export { displayUserMessage };
export { displayGPTMessage };
