///here's going to be everything related to gpt
let conversationHistory = [
	{"role": "system", "content": "Provide instructions for controlling a 3D scene, like 'move camera closer to the earth or a specific place' or 'move camera further from the earth."}
];

// trigger the enter key and separate the logic for those two
const input_field = document.getElementById('chat-input');
const send_button = document.getElementById('send-btn');

send_button.addEventListener('click', function(event){
	sendMessage();
});

input_field.addEventListener('keypress', function(event) {
	if(event.key === 'Enter'){
		event.preventDefault();
		sendMessage();
	}
});

function sendMessage(){
	const message = input_field.value;
	if (message) {
		displayUserMessage(`Me: ${message} \n\n`);
		conversationHistory.push({"role": "user", "content": message});

		//fetch('http://ec2-51-20-76-149.eu-north-1.compute.amazonaws.com:8000/chat', {
		fetch('http://localhost:5000/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ 
				prompt: message,
				conversation: conversationHistory
			})
		})
		.then(response => {
			//if there is no response at all or we get unauthorized error
			if (!response.ok && response.status === 429 && retryCount < maxRetries) {
				retryCount++;
				const retryDelay = Math.pow(2, retryCount) * 1000;
				setTimeout(sendtochat, retryDelay);//if we do not succeed in making aconnection
				return;
			}
			return response.json();
		}) //if we do have data, process it
		.then(data => {
			displayGPTMessage(`ChatGPT: ${data.reply}\n`);
			handleChatGPTResponse(data.reply);
			 //update conversation history
			conversationHistory = data.conversation;
		})
		.catch(error => console.error('Error:', error));
		//clear our input field
		input_field.value = '';
	}
}

// document.getElementById('send-btn').addEventListener('click', function(event) {
// 	const inputField = document.getElementById('chat-input');
// 	const message = inputField.value.trim();
// 	if (message) {
// 		displayUserMessage(`Me: ${message} \n\n`);
// 		conversationHistory.push({"role": "user", "content": message});

// 		//fetch('http://ec2-51-20-76-149.eu-north-1.compute.amazonaws.com:8000/chat', {
// 		fetch('http://localhost:5000/chat', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json',
// 			},
// 			body: JSON.stringify({ 
// 				prompt: message,
// 				conversation: conversationHistory
// 			})
// 		})
// 		.then(response => {
// 			//if there is no response at all or we get unauthorized error
// 			if (!response.ok && response.status === 429 && retryCount < maxRetries) {
// 				retryCount++;
// 				const retryDelay = Math.pow(2, retryCount) * 1000;
// 				setTimeout(sendtochat, retryDelay);//if we do not succeed in making aconnection
// 				return;
// 			}
// 			return response.json();
// 		}) //if we do have data, process it
// 		.then(data => {
// 			displayGPTMessage(`ChatGPT: ${data.reply}\n`);
// 			handleChatGPTResponse(data.reply);
// 			 //update conversation history
// 			conversationHistory = data.conversation;
// 		})
// 		.catch(error => console.error('Error:', error));
// 		//clear our input field
// 		inputField.value = '';
// 	}
// });

function handleChatGPTResponse(reply) {
	//TODO: improve all this :p
	if (/rotation/i.test(reply)) {
        //check for specific directions
        if (/right/i.test(reply)) {
            handleCameraAdjustment("right");
        } else if (/left/i.test(reply)) {
            handleCameraAdjustment("left");
        } else if (/up/i.test(reply)) {
            handleCameraAdjustment("up");
        } else if (/down/i.test(reply)) {
            handleCameraAdjustment("down");
        }
    }
	if (/zoom/i.test(reply)) {
        //check for specific directions
        if (/in/i.test(reply)) {
            handleCameraAdjustment("in");
        } else if (/out/i.test(reply)) {
            handleCameraAdjustment("out");
		}
	}
	if(/stop/i.test(reply)){
		handleCameraAdjustment("stop");
	}
	if(/render/i.test(reply) && /moon/i.test(reply)){
		scene.add(moon);
	}
	if(/moon/i.test(reply) && (/hide/i.test(reply) || /remove/i.test(reply) || /delete/i.test(reply) )){
		scene.remove(moon);
	}
}

function handleCameraAdjustment(direction) {
	switch (direction) {
		case "left":
			cameraRotate(camera2, direction);
			break;
		case "right":
			cameraRotate(camera2, direction);
			break;
		case "up":
			cameraRotate(camera2, direction);
			break;
		case "down":
			cameraRotate(camera2, direction);
			break;
		case "out":
			cameraZoom(camera2, direction);
			break;
		case "in":
			cameraZoom(camera2, direction);
			break;
		case "stop":
			cameraStop(camera2);
		default:
			console.log("Unknown direction or not handled:", direction);
	}
}

function displayUserMessage(message) {
	// updat the message box, should it be bigger?? 
	const messages_container = document.getElementById('messages');
	const new_message_div = document.createElement('div');
    new_message_div.className = 'message-bubble';
	new_message_div.textContent = message+"\n";
	messages_container.appendChild(new_message_div);
}

function displayGPTMessage(message) {
	//different color and focusing
	const messages_container = document.getElementById('messages');
	const new_message_div = document.createElement('div');
    new_message_div.className = 'message-bubble-GPT';
	new_message_div.textContent = message+"\n";
	messages_container.appendChild(new_message_div);
}
