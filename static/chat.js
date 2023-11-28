/// Here's going to be everything related to gpt
let conversationHistory = [
	{"role": "system", "content": "Provide instructions for controlling a 3D scene, like 'move camera closer to the earth or a specific place' or 'move camera further from the earth."}
];

document.getElementById('send-btn').addEventListener('click', function(event) {
	const inputField = document.getElementById('chat-input');
	const message = inputField.value.trim();
	if (message) {
		displayMessage(`Me: ${message} \n\n`);
		conversationHistory.push({"role": "user", "content": message});

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
			// if there is no response at all or we get unauthorized error
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
			conversationHistory = data.conversation; //update conversation history
		})
		.catch(error => console.error('Error:', error));
		//clear our input field
		inputField.value = '';
	}
});

function handleChatGPTResponse(reply) {
	if (/rotation/i.test(reply)) {
        // Check for specific directions
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
        // Check for specific directions
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
	
	// const move_camera_regex = /move/;
	// const match = reply.match(move_camera_regex);

	// if (match) {
	//     camera2.makeTransition([0,0,10]);
	// }

	// //regex to match only two values
	// const coordinate_string = reply.match(/^[\d.-]+,\s*[\d.-]+$/gm);

	// if (coordinate_string) {
	//     //separate our coordinates to actual values
	//     const coordinates = coordinate_string[0].split(',').map(coord => parseFloat(coord.trim()));
	//     const latitude = coordinates[0];
	//     const longitude = coordinates[1];
		
	//     //add a cube to our scenery
	//     if (!isNaN(latitude) && !isNaN(longitude)) {
	//         const location = latLongToCartesian(latitude, longitude, 5);
	//         const cubeInstance = new CubeObject(location);
	//         const cube = cubeInstance.getMesh();
	//         scene.add(cube);
	//     }
	// }


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