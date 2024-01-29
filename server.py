import os
import urllib
import requests
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "http://localhost:1234"}})
CORS(app, resources={r"/audio": {"origins": "http://localhost:1234"}})
app.debug = True


@app.route('/chat', methods=['POST'])
def chat():
    """
    Endpoint that receives a conversation and a user message,sends the conversation
    to the OpenAI API, appends the response to the conversation, and returns the 
    response and updated conversation.
    
    :return: Returns a JSON response containing the reply from the chatbot and 
    the updated conversation.
    """
    conversation = request.json['conversation']
    if not conversation:
        conversation = []
    
    user_message = request.json['prompt']
    conversation.append({"role": "user", "content": user_message})

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            },
            #custom model returned from the training >:]
            json={
                # "model": "ft:gpt-3.5-turbo-1106:personal::8LWjN7Ee",
                #"model": "gpt-3.5-turbo-1106",
                "model": "gpt-4-turbo-preview",
                "messages": conversation
            }
        )
        response.raise_for_status()
        #extract the reply and append it to the conversation
        reply = response.json()['choices'][0]['message']['content']
        conversation.append({"role": "assistant", "content": reply})
        
        return jsonify({"reply": reply, "conversation": conversation})
    
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/audio', methods=['POST'])
def audio():
    """
    Flask route that handles audio files, transcribes them using the OpenAI Whisper
    API, and then passes the transcribed text to chat route for further processing.
    
    :return: Returns a JSON response that includes the gpt reply and user request.
    """
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        file_content = file.read()
        
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        files = {'file': ('audio.wav', file_content, 'audio/wav')}
        data = {'model': 'whisper-1'}
        
        #TEST THE API WITH ONE EXAMPLE FROM THE OPENAI COOKBOOK
        ###################################
        from pdb import set_trace; set_trace()
        up_first_remote_filepath = "https://cdn.openai.com/API/examples/data/upfirstpodcastchunkthree.wav"
        up_first_filepath = "upfirstpodcastchunkthree.wav"
        urllib.request.urlretrieve(up_first_remote_filepath, up_first_filepath)
        with open(up_first_filepath, 'rb') as f:
            file_content = f.read()

        # Prepare the files dictionary
        files = {
            'file': ('upfirstpodcastchunkthree.wav', file_content, 'audio/wav'),
        }
        response = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data)
        ###################################

        #!!!! UNCOMMENT THIS ONE FOR THE NORMAL VOICE RECORDING
        #response = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data)
        if response.status_code != 200:
            return jsonify({"error": "Error from Whisper API", "details": response.text}), response.status_code
        
        whisper_data = response.json()
        transcribed_text = whisper_data.get('text', '')

        conversation_data = {
            "conversation": [],
            "prompt": transcribed_text
        }

        #Ask within the app to our chat method
        with app.test_request_context('/chat', json=conversation_data, method='POST'):
            chat_response = chat()
            if chat_response.status_code == 200:            
                chat_data = chat_response.get_json()
                return jsonify(chat_data)
            else:
                return chat_response

    return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(port=5000)
