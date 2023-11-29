///here's going to be everything related to gpt
let conversationHistory = [
	{"role": "system", "content": "Provide instructions for controlling a 3D scene, like 'move camera closer to the earth or a specific place' or 'move camera further from the earth."}
];

document.getElementById('send-btn').addEventListener('click', function(event) {
	const inputField = document.getElementById('chat-input');
	const message = inputField.value.trim();
	if (message) {
		displayMessage(`Me: ${message} \n\n`);
		conversationHistory.push({"role": "user", "content": message});

		fetch('http://ec2-51-20-76-149.eu-north-1.compute.amazonaws.com:8000/chat', {
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
			displayMessage(`ChatGPT: ${data.reply}\n`);
			handleChatGPTResponse(data.reply);
			 //update conversation history
			conversationHistory = data.conversation;
		})
		.catch(error => console.error('Error:', error));
		//clear our input field
		inputField.value = '';
	}
});

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

function displayMessage(message) {
	// updat the message box, should it be bigger?? 
	const messagesContainer = document.getElementById('messages');
	const newMessageDiv = document.createElement('div');
	newMessageDiv.textContent = message+"\n";
	messagesContainer.appendChild(newMessageDiv);
}

// TEST QUERY THAT WORKS
//What are the coordinates from mexico city? please reply only with the numerical values separated by commas in the last line.