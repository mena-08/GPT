// actual values for audio files
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
        media_recorder = new media_recorder(stream);
        media_recorder.ondataavailable = event => {
            audio_chunks.push(event.data);
        };
        media_recorder.onstop = () => {
            const audio_blob = new Blob(audio_chunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audio_blob);
            const audio = new Audio(audioUrl);
            //clear the chunks for the next recording
            audio_chunks = [];
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
