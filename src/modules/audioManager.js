// actual values for audio files
import { displayUserMessage, displayGPTMessage, sendToAPI, conversationHistory, askForMap, fetchMapImage } from '../modules/chatManager';
import { eventEmitter } from './eventEmitter';
import help_map_prompts from "bundle-text:../help_map_prompts.txt"

let media_recorder;
let audio_chunks = [];
const record_btn = document.getElementById('record-btn');

// Toggle button appearance and text
function toggleRecordButton(isRecording) {
    record_btn.classList.toggle('pressed', isRecording);
    record_btn.classList.toggle('stopped', !isRecording);
    record_btn.textContent = isRecording ? 'Stop' : 'Record';
}

// Function to start recording
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        media_recorder = new MediaRecorder(stream);
        media_recorder.ondataavailable = event => {
            audio_chunks.push(event.data);
        };
        media_recorder.onstop = () => {
            const audio_blob = new Blob(audio_chunks, { type: 'audio/wav' });
            //clear the chunks for the next recording
            audio_chunks = [];
            //send the information to the whisperapi
            sendAudioMessage(audio_blob);
        };
        media_recorder.start();
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

// Function to stop recording
function stopRecording() {
    if (media_recorder && media_recorder.state !== 'inactive') {
        media_recorder.stop();
    }
}

// Attach the event listener to the button
record_btn.addEventListener('click', () => {
    const isRecording = record_btn.className === '' || record_btn.className === 'stopped';
    toggleRecordButton(isRecording);
    if (isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

let current_place = '';

async function sendAudioMessage(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_audio.wav');

    try {
        const response = await fetch("http://localhost:5000/audio", {
            method: 'POST',
            body: formData,
        });

        if (!response.ok && response.status === 429) {
            // Handle retry in case of rate limit errors or other network issues
            console.error('API rate limit exceeded. Retrying...');
            setTimeout(() => sendAudioMessage(audioBlob), 2000);
            return;
        }

        const data = await response.json();
        displayUserMessage(`Me: ${data.conversation[0].content}\n\n`);
        displayGPTMessage(`Chat-GPT: ${data.conversation[1].content}\n\n`);

        const conversation_helper = 'Please give me the geojson text format only of the place mentioned in the prompt, the name of the place and nothing more' +
        'Be as precise as possible, using at least 6 decimals on the answer. If the answer contains several places, use' +
        ' the GeoJSON properties like the multipoints array, to include them or surrounding them if its an area that has been asked. ' +
        'The answer must have the following example structure : ' +
        '{"type":"Feature","geometry":{"type":"Point","coordinates":[-68.2532,-20.1338,3656]},"properties":{"name":"Salar de Uyuni, Bolivia"}}' +
        ' If you notice that we are not mentioning any place, return an empty json please.' +
        ' If we are still talking about the same place or have not switched to another one, you will return only an empty geoJSON format text.' +
        ' Avoid words like "certainly" or the very formal ones, remember we are interacting with a friends, you can also use friendly slang to answer';
        sendToAPI(data.conversation[1].content + conversation_helper, (follow_up_data) => {
            const geojson = JSON.parse(follow_up_data.reply);
            const mentioned_place = geojson.properties.name;
            if (mentioned_place && mentioned_place !== current_place) {
                current_place = mentioned_place;
                eventEmitter.emit('makeTransition', geojson);
            }
        });

        let p = "You will be feed with a query about Earth's environmental features or phenomena, such as ice coverage, snow depth, atmospheric composition (like ozone or nitrogen levels), " +
            "surface temperatures, or precipitation patterns, your task is to identify and select the most appropriate map from the provided list. The list contains names of satellite imagery maps, " +
            "each representing different data about Earth's environment. " +
            "Your response should be the exact name of the one map that best represents the information sought in the query. I only need that you return the name of the map and nothing else."
        setTimeout(() => {
            askForMap((p + data.reply + help_map_prompts), (follow_up) => {
                if (follow_up.reply) {
                    fetchMapImage(follow_up.reply);
                }
            })
        }, 70);

        // Update conversation history
        conversationHistory.push({ "role": "system", "content": data.conversation[0].content });
        conversationHistory.push({ "role": "user", "content": data.conversation[1].content });
    } catch (error) {
        console.error('Error:', error);
    }
}
