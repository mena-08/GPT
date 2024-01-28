// All the interactions provided from the chatgpt response shall be here
//TODO: refactor all these
function handleChatGPTResponse(reply) {
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
