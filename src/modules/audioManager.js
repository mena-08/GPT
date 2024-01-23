// actual values for audio files
let media_recorder;
let audio_chunks = [];

//add the voice recording function
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            media_recorder = new MediaRecorder(stream);
            media_recorder.ondataavailable = event => {
                audio_chunks.push(event.data);
            };
            media_recorder.start();

            media_recorder.onstop = () => {
                const audio_blob = new Blob(audio_chunks, { type: 'audio/wav' });
                const audio_url = URL.createObjectURL(audio_blob);
                const audio = new Audio(audio_url);

                //clear the chunks for the next recording
                audio_chunks = [];
            };
        })
        .catch(error => console.error("Error accessing media devices.", error));
}

function stopRecording() {
    if (media_recorder && media_recorder.state !== 'inactive') {
        media_recorder.stop();
    }
}

document.getElementById('start-record-btn').addEventListener('click', startRecording);
document.getElementById('stop-record-btn').addEventListener('click', stopRecording);
