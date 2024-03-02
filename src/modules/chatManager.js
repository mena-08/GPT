import { eventEmitter } from "./eventEmitter";
import { updateHTMLElement } from "./gui";
import help_map_prompts from "bundle-text:../help_map_prompts.txt"

let conversationHistory = [
	{
		"role": "system", "content": "Provide useful information to the user about the Earth places, \
	properties, facts and so on. You will be more like a friend explaining some topic to us in a friendly manner.\
	It is important that the information will be short. Please, for the moment, only reply in English, unless you clearly see results or conversations in english" }
];
const input_field = document.getElementById('chat-input');
const send_btn = document.getElementById('send-btn');
let current_place = '';

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
		const response = await fetch('http://localhost:5000/chat', {
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

		const callback_data = await response.json();
		if (callback && typeof callback === 'function') {
			callback(callback_data);
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

async function askForMap(_message, callback) {
	if (!_message) return;

	try {
		const response = await fetch('http://localhost:5000/chat', {
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

		const callback_data = await response.json();
		if (callback && typeof callback === 'function') {
			callback(callback_data);
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

//sends a user message to the API, receives a response, and updates the conversation history.
function sendMessage(message) {
	if (message) {
		const conversation_helper = 'Please provide me only a small and short paragraph of information from the prompt.'+
		'You will not mention that your are an AI, or any information non relevant to the topic asked. You will answer in a friendly manner, as if'+
		'we were talking with a friend. At the end, ask us if we want more information or would like to visit a place on earth. zpr';

		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({ "role": "user", "content": message });

		fetch('http://localhost:5000/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', },
			body: JSON.stringify({
				prompt: (conversation_helper + message),
				conversation: conversationHistory
			})
		})
		.then(response => {
			if (!response.ok && response.status === 429) {
				const retryDelay = Math.pow(2, retryCount) * 1000;
				setTimeout(sendtochat, retryDelay);
				return;
			}
			return response.json();
		})
		.then(data => {
			// play the audio first as it takes considerably more time
			reproduceAudio(data.reply);

			displayGPTMessage(`ChatGPT: ${data.reply}\n`);
			let x = '. Please give me the geojson text format only of the place mentioned in the prompt, the name of the place and nothing more. ' +
			'Be as precise as possible, using at least 6 decimals on the answer. If the answer contains several places, use ' +
			'the GeoJSON properties like the multipoints array, to include them or surrounding them if its an area that has been asked ' +
			'The answer must have the following example structure : ' +
			'"{"type":"Feature","geometry":{"type":"Point","coordinates":[-68.2532,-20.1338,3656]},"properties":{"name":"Salar de Uyuni, Bolivia"}}" ' +
			'If you notice that we are not mentioning any place, return an empty json please. ' +
			'If we are still talking about the same place or have not switched to another one, you will return only an empty geoJSON format text. ' +
			'Avoid words like "certainly" or the very formal ones, remember we are interacting with a friends, you can also use friendly slang to answer. ';

			setTimeout(() => {
				sendToAPI(data.reply + x, (follow_up_data) => {
					const geojson = JSON.parse(follow_up_data.reply);
					eventEmitter.emit('makeTransition', geojson);
				})
			}, 650);
			
			let p = "You will be feed with a query about Earth's environmental features or phenomena, such as ice coverage, snow depth, atmospheric composition (like ozone or nitrogen levels), " +
				"surface temperatures, or precipitation patterns, your task is to identify and select the most appropriate map from the provided list. The list contains names of satellite imagery maps, " +
				"each representing different data about Earth's environment. " +
				"Your response should be the exact name of the one map that best represents the information sought in the query. I only need that you return the name of the map and nothing else."
			setTimeout(() => {
				askForMap((p+data.reply+help_map_prompts), (follow_up) =>{
					if(follow_up.reply){
						fetchMapImage(follow_up.reply);
					}
				})
			},70);
			//update conversation history
			conversationHistory = data.conversation;
		}).catch(error => console.error('Error:', error));
		input_field.value = '';
	}
}

function fetchMapImage(mapName) {
	const url = `http://localhost:5000/get_map_image/${mapName}`;
	fetch(url)
	.then(response => response.blob())
	.then(blob => {
		// Create a local URL for the image blob
		const localUrl = URL.createObjectURL(blob);
		eventEmitter.emit('textureChange', localUrl);
		sendToAPI(`Please give me information about a map of ${mapName} from the Earth? This map was retrieved from the NASA GIBS dataset, maybe it will help you to find something useful\n Please answer in a short paragraph and only the information relevant to the map. Please exclude any introduction words like, "sure!", "certainly!", etc. The information is meant for kids of 8 years. Also, don't include the quote characters.`, updateHTMLElement);
		// console.log(localUrl);
	})
	.catch(error => {
		console.error('Error fetching map image:', error);
	});
}

function reproduceAudio(user_message){
	fetch('http://localhost:5000/get_audio', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({prompt: user_message})
	})
	.then(response => response.blob())
	.then(blob => {
		const blobUrl = URL.createObjectURL(blob);
		const audio = new Audio(blobUrl);
		audio.play();
	})
	.catch(error => console.error('Error fetching audio:', error));
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
export { conversationHistory };
export {askForMap};
export {fetchMapImage};


//Roadmap of the water cycle
//1 - Can you explain the water cycle?
///MODIS_Aqua_L3_SST_Thermal_4km_Night_Monthly

