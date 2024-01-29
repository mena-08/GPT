let conversationHistory = [
	{ "role": "system", "content": "Provide instructions for controlling a 3D scene, like 'move camera closer to the earth or a specific place' or 'move camera further from the earth." }
];
const input_field = document.getElementById('chat-input');
const send_btn = document.getElementById('send-btn');

send_btn.addEventListener('click', function (event) {
	sendMessage(input_field.value);
});

input_field.addEventListener('keypress', function (event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		sendMessage(input_field.value);
	}
});

//create a function to send data to chatgpt and receive it, then process it as separate, as can be useful for any query we want or could use
async function sendToAPI(_message, callback) {
	if (_message) {
		try {
			const response = await fetch('http://localhost:5000/chat', {
				method: 'POST',
				headers: { 'Content-type': 'application/json', },
				body: JSON.stringify({
					prompt: _message,
					// no need to update the conversation when asking for specific things, as of now (?)
					conversation: ''
				})
			});
			//retry at least once
			if (!response.ok && response.status === 429) {
				const retryDelay = Math.pow(2, retryCount) * 1000;
				setTimeout(() => sendToAPI(_message, callback), retryDelay);
				return;
			}

			const data = await response.json();
			//use any function as the callback for it
			if (callback && typeof callback === 'function') {
				callback(data);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
}

//Sends a user message to the API, receives a response, and updates the conversation history.
function sendMessage(message) {
	if (message) {
		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({ "role": "user", "content": message });

		fetch('http://localhost:5000/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', },
			body: JSON.stringify({
				prompt: message,
				conversation: conversationHistory
			})
		}).then(response => {
			//no success in making connection or unauthorized; retry at least once
			if (!response.ok && response.status === 429) {
				const retryDelay = Math.pow(2, retryCount) * 1000;
				setTimeout(sendtochat, retryDelay);
				return;
			}
			return response.json();
		}).then(data => {
			displayGPTMessage(`ChatGPT: ${data.reply}\n`);
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
export { sendToAPI }