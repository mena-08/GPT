import { eventEmitter } from "./eventEmitter";
import help_map_prompts from "bundle-text:../help_map_prompts.txt"
import help_main_map_prompts from "bundle-text:../help_main_maps_prompt.txt"
import help_overlays_prompts from "bundle-text:../help_overlays_prompt.txt"
import help_video_maps_prompt from "bundle-text:../help_video_maps_prompt.txt"
import { isPlayingResponse } from "./audioManager";
import { gl, earthSphere, moonTexture, earthTexture, loadOverlayTexture, loadMainTexture, loadVideoTexture} from "./renderWebGL";
import overlayRoutes from "/static/overlays/*.png";
import atmosphereRoutes from "/static/atmosphere/base_images/*.png";
// const oceanContext = require.context("/static/atmosphere", true, /\.m3u8$/);

let conversationHistory = [
	{
		"role": "system", "content": "You are an interactive 3D Earth visualization tool. Your primary task is to identify the type of prompt into the following ones\
		Navigation: if we are talking or inferring that you show or take us to a place on earth, either directly or directly.\
		Transformation: if we are asking about rotating or moving the earth for better visuals, must include the direction we are talking about. format: transformation->rotate right, format: transformation->scale up, etc\
		Information: if we want to know more about the place we are talking about, with different facts.\
		Maps: if we are talking or inferring directly or indirectly about natural phenomena that occurs on earth either natural or caused by humans, it will be related to earth in general,\
		then you will be provided of the list of maps that you can choose from. If you detect is map, choose the most appropiate from the following list "+help_main_map_prompts+" Only select from the avaialable options on the list. \
		and reply only with the name of the map. format: maps->atmosphere/rainfall you will choose one option only\
		Overlay: if we are talking directly or indirectly about some kind of information that can be overlayed, like timezones, country or continent borders, railroads, wind circulation, water currents, rivers that can help in visualization,\
		then you will be provided of the list of maps that you can choose from. If you detect is an overlay, choose the most appropiate from the following list "+help_overlays_prompts+" Only select from the avaialable options on the list. \
		and reply only with the name of the map. format overlay->timezones\n\
		Animate: if we ask to animate the context with a video or animation, let's say we are talking about weather, then you will choose one of the options that you think it's the most adecuate to animate, so in this case can be temperature, huracans, winds, etc.\
		we have two different categories, land and atmosphere, and each one has a subdivision that you will see in the video map list next,you will choose from the following options"+help_video_maps_prompt+" and reply only with the line of the full path that you chose and the format will be like this: animate->atmosphere/ncss_chem/ncss_chem_hls, for example.\
		Finally in every prompt the first word will be the type of prompt you are dealing with. with this format 'category->' that's imperative!!!" 
	}
];
const input_field = document.getElementById('chat-input');
const send_btn = document.getElementById('send-btn');
send_btn.addEventListener('click', handleSendMessage);
input_field.addEventListener('keypress', handleSendMessage);

function handleSendMessage(event) {
	if (event.type === 'click' || (event.type === 'keypress' && event.key === 'Enter')) {
		event.preventDefault();
		sendMessage(input_field.value);
		//earthSphere.changeTexture(earthTexture, earthShaderProgram);
	}
}

// async function sendToAPI(_message, callback) {
// 	if (!_message) return;
// 	try {
// 		const response = await fetch('/api/chat', {
// 			method: 'POST',
// 			headers: { 'Content-type': 'application/json', },
// 			body: JSON.stringify({
// 				prompt: _message,
// 				conversation: conversationHistory
// 			})
// 		});

// 		if (!response.ok && response.status === 429) {
// 			//network issues
// 			alert('API rate limit exceeded. Retrying...');
// 			setTimeout(() => sendToAPI(_message, callback), 2000);
// 			return;
// 		}
// 		const callback_data = await response.json();
// 		if (callback && typeof callback === 'function') {
// 			callback(callback_data);
// 		}
// 	} catch (error) {
// 		console.error('Error:', error);
// 	}
// }

let isRequestPending = false;
let requestQueue = [];

async function processQueue() {
    if (isRequestPending || requestQueue.length === 0) {
        return;
    }

    isRequestPending = true;
    const { message, callback } = requestQueue.shift();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-type': 'application/json', },
            body: JSON.stringify({
                prompt: message,
                conversation: conversationHistory
            })
        });

        if (!response.ok && response.status === 429) {
            // Network issues or rate limit exceeded
            console.log('API rate limit exceeded. Retrying...');
            setTimeout(() => {
                requestQueue.unshift({ message, callback }); // Re-add to the front of the queue
                isRequestPending = false;
                processQueue();
            }, 2000);
            return;
        }

        const callback_data = await response.json();
        if (callback && typeof callback === 'function') {
            callback(callback_data);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        isRequestPending = false;
        processQueue();
    }
}

function sendToAPI(_message, callback) {
    if (!_message) return;

    requestQueue.push({ message: _message, callback }); // Add to the queue
    processQueue(); // Try processing the queue
}


async function askForMap(_message, callback) {
	if (!_message) return;
	try {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-type': 'application/json', },
			body: JSON.stringify({
				prompt: _message,
				conversation: conversationHistory
			})
		});

		if (!response.ok && response.status === 429) {
			//network issues
			alert('API rate limit exceeded. Retrying...');
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

function  sendMessage(message) {
	if (message) {
		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({ "role": "user", "content": message });

		fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', },
			body: JSON.stringify({
				prompt: (message),
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
			data.reply = data.reply.toLowerCase();
			const category = data.reply.split("->")[0];
			const info = data.reply.split("->")[1];
			console.log(category);
			console.log(info);
			switch (category) {
				case "navigation":
					setTimeout(() => {
						let small_helper = "Provide me only short paragraph of information from the place we are talking about.\
						You will not mention that your are an AI, or any information non relevant to the topic asked. Talk in a friendly manner as if you were talking to kids. \
						Don't talk about politics, government, or any controversial topic. Nor you can talk about holocaust or any other controversial/related topic. \
						You can also ask me to show you a map of the place we are talking about, or ask me for more information about it.";
						const x = small_helper + data.reply;
						sendToAPI(x, (follow_up_data) => {
							displayGPTMessage(`ChatGPT: ${follow_up_data.reply}\n`);
						})
					}, 20);
					let coordinates = data.reply.split(" ").splice(-2);
					coordinates[0] = coordinates[0].split(",")[0]
					alert(coordinates);
					break;

				case "maps":
					const actualmap = info.split("/")[1];				
					setTimeout(() => {
						if(help_overlays_prompts.includes(actualmap)){
							loadOverlayTexture(gl, overlayRoutes[actualmap]);
						}else{
							loadMainTexture(gl, atmosphereRoutes[actualmap]);
						}
						// loadMa(gl, overlayRoutes[info])
						let small_helper = "Provide me only short paragraph of information from the things or properties we are talking about.\
						You will not mention that your are an AI, or any information non relevant to the topic asked. Talk in a friendly manner and avoid any kind of controversial topic.";
						const x = small_helper + data.reply;
						sendToAPI(x, (follow_up_data) => {
							displayGPTMessage(`ChatGPT: ${follow_up_data.reply.split("->")[1]}\n`);
						})
					}, 30);
					break;

				case "overlay":
					setTimeout(() => {
						loadOverlayTexture(gl, overlayRoutes[info])
						let small_helper = "Provide me only short paragraph of information from the things or properties we are talking about.\
						You will not mention that your are an AI, or any information non relevant to the topic asked. Talk in a friendly manner and avoid any kind of controversial topic.";
						const x = small_helper + data.reply;
						sendToAPI(x, (follow_up_data) => {
							displayGPTMessage(`ChatGPT: ${follow_up_data.reply}\n`);
						})
					}, 30);
					break;
				
				case "animate":
					const x = "Based on the prompt, choose one of the following options "+help_video_maps_prompt+" that fits best the context.\
					reply with the full line of the path of the video you chose and only taking into account this query format and don't include spaces in between: animate->land/birds_migration \
					If you happen to have an already query like the one I mentioned, show only that one, not repeated like this: animate->ocean/tsunami_indiaanimate/tsunami_indiaanimate \
					Finally, if you did not identify any video or animation, just choose any of the options and reply with the full path of the video you chose";
					sendToAPI(data.reply, (follow_up_data) => {
						setTimeout(() => {
							const p = info.split("/")[1];
							loadVideoTexture(gl, "/api/video/"+info+"/"+p+".m3u8")
							let small_helper = "Provide me only short paragraph of information from the things or properties we are talking about.\
							You will not mention that your are an AI, or any information non relevant to the topic asked. Talk in a friendly manner and avoid any kind of controversial topic.";
							const x = small_helper + data.reply;
							sendToAPI(x, (follow_up_data) => {
								displayGPTMessage(`ChatGPT: ${follow_up_data.reply}\n`);
							})
						}, 30);	
					});
					break;

				case "transformation":
					data.reply = data.reply.toLowerCase();
					if (data.reply.includes("rotate")) {
						switch (true) {
							case data.reply.includes("rotate") && data.reply.includes("left"):
								earthSphere.rotateLeft();
								break;
							case data.reply.includes("rotate") && data.reply.includes("right"):
								earthSphere.rotateRight();
								break;
							case data.reply.includes("stop"):
								earthSphere.stopRotation();
								break;
							default:
						}	
					}else if((data.reply.includes("scale")|| data.reply.includes("make")||data.reply.includes("resize")) && data.reply.includes("bigger")){
						alert("bigger");
						const randomFactor = Math.random() * (3 - 1) + 1;
						earthSphere.scale(randomFactor);
					}
					break;
				case "information":
					setTimeout(() => {
						let small_helper = "Provide me only short paragraph of information from the place we are talking about.\
						You will not mention that your are an AI, or any information non relevant to the topic asked. Talk in a friendly manner as if you were talking to kids. \
						Don't talk about politics, government, or any controversial topic. Nor you can talk about holocaust or any other controversial/related topic. \
						You can also ask me to show you a map of the place we are talking about, or ask me for more information about it.";
						const x = small_helper + data.reply;
						sendToAPI(x, (follow_up_data) => {
							displayGPTMessage(`ChatGPT: ${follow_up_data.reply}\n`);
						})
					}, 20);
					break;
			}

			//displayGPTMessage(`ChatGPT: ${data.reply}\n`);
			// let x = '. Please give me the geojson text format only of the place mentioned in the prompt, the name of the place and nothing more. ' +
			// setTimeout(() => {
			// 	sendToAPI(data.reply + x, (follow_up_data) => {
			// 		// const geojson = JSON.parse(follow_up_data.reply);
			// 		// eventEmitter.emit('makeTransition', geojson);
			// 	})
			// }, 650);
			
			// let p = "You will be feed with a query about Earth's environmental features or phenomena, such as ice coverage, snow depth, atmospheric composition (like ozone or nitrogen levels), " +
			// 	"surface temperatures, or precipitation patterns, your task is to identify and select the most appropriate map from the provided list. The list contains names of satellite imagery maps, " +
			// 	"each representing different data about Earth's environment. " +
			// 	"Your response should be the exact name of the one map that best represents the information sought in the query. I only need that you return the name of the map and nothing else."
			// setTimeout(() => {
			// 	askForMap((p+data.reply+help_map_prompts), (follow_up) =>{
			// 		if(follow_up.reply){
			// 			fetchMapImage(follow_up.reply);
			// 		}
			// 	})
			// },70);
			//update conversation history
			conversationHistory = data.conversation;
			
		}).catch(error => console.error('Error:', error));
		input_field.value = '';
	}
}

function fetchMapImage(mapName) {
	const url = `/api/get_map_image/${mapName}`;
	fetch(url)
	.then(response => response.blob())
	.then(blob => {
		// Create a local URL for the image blob
		const localUrl = URL.createObjectURL(blob);
		eventEmitter.emit('textureChange', localUrl);
	})
	.catch(error => {
		console.error('Error fetching map image:', error);
	});
}

function reproduceAudio(user_message){
	fetch('/api/get_audio', {
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

export { displayUserMessage, displayGPTMessage, sendToAPI, conversationHistory, askForMap, fetchMapImage, reproduceAudio, sendMessage };

//Navigation content
// geojson(coordinates, name)