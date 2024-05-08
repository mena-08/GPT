// actual values for audio files
import { displayUserMessage, displayGPTMessage, sendToAPI, conversationHistory, askForMap, fetchMapImage, sendMessage } from '../modules/chatManager';
import { eventEmitter } from './eventEmitter';
import help_map_prompts from "bundle-text:../help_map_prompts.txt"
import { reproduceAudio } from '../modules/chatManager';

let media_recorder;
let audio_chunks = [];
let globalStream = null;
const record_btn = document.getElementById('record-btn');

function toggleRecordButton(isRecording) {
    record_btn.classList.toggle('pressed', isRecording);
    record_btn.classList.toggle('stopped', !isRecording);
    record_btn.textContent = isRecording ? 'Stop' : 'Record';
}

function stopRecording() {
    if (media_recorder && media_recorder.state !== 'inactive') {
        media_recorder.stop();
    }
}

record_btn.addEventListener('click', () => {
    const isRecording = record_btn.className === '' || record_btn.className === 'stopped';
    toggleRecordButton(isRecording);
    if (isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

async function requestMicrophoneAccess() {
    try {
        globalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
        alert('Error requesting microphone access.');
    }
}

let isSending = false;

async function startRecording(vr) {
    if (!globalStream) {
        alert('No microphone access granted. Please allow microphone access to continue. (reload the page if necessary)');
        return;
    }
    try {
        media_recorder = new MediaRecorder(globalStream);
        media_recorder.ondataavailable = event => {
            audio_chunks.push(event.data);
        };
        media_recorder.onstop = () => {
            if (!isSending) {
                isSending = true;
                const audio_blob = new Blob(audio_chunks, { type: 'audio/wav' });
                audio_chunks = [];
                sendAudioMessage(audio_blob, vr);
            }
        };
        media_recorder.start();
    } catch (error) {
        alert("Error accessing media devices:", error);
    }
}

async function sendAudioMessage(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'user_audio.wav');
    try {
        const response = await fetch("/api/audio", {
            method: 'POST',
            body: formData,
        });

        if (!response.ok && response.status === 429) {
            //network issues
            alert('API rate limit exceeded. Retrying...');
            setTimeout(() => sendAudioMessage(audioBlob), 2000);
            return;
        }

        const data = await response.json();
        sendMessage(data.conversation[0].content);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        isSending = false;
    }
}


export {startRecording, stopRecording, requestMicrophoneAccess};