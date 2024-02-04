import { eventEmitter } from "./eventEmitter";

let conversationHistory = [
	{
		"role": "system", "content": "Provide useful information to the user about the Earth places, \
	properties, facts and so on. You will be more like a friend explaining some topic to us in a friendly manner.\
	It is important that the information will be short. I will ask you in different languages and you should identify which one is it, and answer in that language." }
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

//send data to chatgpt and receive it, then process it as separate
async function sendToAPI(_message, callback) {
	if (!_message) return;

	try {
		const response = await fetch('http://ec2-13-49-246-213.eu-north-1.compute.amazonaws.com:1234/chat', {
			method: 'POST',
			headers: { 'Content-type': 'application/json', },
			body: JSON.stringify({
				prompt: _message,
				conversation: conversationHistory
			})
		});

		if (!response.ok && response.status === 429) {
			//handle retry in case of rate limit errors or other network issues
			console.error('API rate limit exceeded. Retrying...');
			setTimeout(() => sendToAPI(_message, callback), 2000);
			return;
		}

		const data = await response.json();
		if (callback && typeof callback === 'function') {
			callback(data);
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

let current_place = '';

//sends a user message to the API, receives a response, and updates the conversation history.
function sendMessage(message) {
	if (message) {
		const conversation_helper = 'Please provide me only a small and short paragraph of information from the prompt. \
		You will not mentioned your are an AI or something note related to the things I asked, in a friendly manner, as if \
		we were talking with a friend. I will ask you in different languages and you should identify which one is it, and answer in that language.';
		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({ "role": "user", "content": message });
		// fetch('http://localhost:5000/chat', {
			fetch('http://ec2-13-49-246-213.eu-north-1.compute.amazonaws.com:1234/chat',{
			method: 'POST',
			headers: { 'Content-Type': 'application/json', },
			body: JSON.stringify({
				prompt: (message + conversation_helper),
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
			let x = '. Please give me the geojson text format only of the place mentioned in the prompt, the name of the place and nothing more. \
			Be as precise as possible, using at least 6 decimals on the answer. If the answer contains several places, use \
			the GeoJSON properties like the multipoints array, to include them or surrounding them if its an area that has been asked \
			The answer must have the following example structure : \
			"{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[-68.2532,-20.1338,3656]},\"properties\":{\"name\":\"Salar de Uyuni, Bolivia\"}}"\
			If we are still talking about the same place or have not switched to another one, you will return only an empty geoJSON format text.\
			I will ask you in different languages and you should identify which one is it, and answer in that language.';

			//set a small delay so the async function have the time to have the data
			setTimeout(() => {
				sendToAPI(data.reply + x, (follow_up_data) => {
					const geojson = JSON.parse(follow_up_data.reply);
					const mentioned_place = geojson.properties.name;
					if (mentioned_place && mentioned_place !== current_place) {
						current_place = mentioned_place;
						eventEmitter.emit('makeTransition', geojson);
					}
				})
			}, 650);

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
export { sendToAPI };
export { conversationHistory }