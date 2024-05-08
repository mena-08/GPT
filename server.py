import os
import requests
from flask_cors import CORS
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, send_file, abort, send_from_directory
from io import BytesIO
import cartopy
import cartopy.crs as ccrs
import matplotlib.pyplot as plt
from PIL import Image
from werkzeug.utils import safe_join

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = Flask(__name__, static_folder='static')
CORS(app)
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
                #This one is for navigation
                #"model": "ft:gpt-3.5-turbo-1106:personal::9LfuG8AD",
                "model": "ft:gpt-3.5-turbo-1106:personal::9MDIEzZG",
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
        
        response = requests.post("https://api.openai.com/v1/audio/transcriptions", headers=headers, files=files, data=data)
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

@app.route('/get_audio', methods=['POST'])
def get_audio():
    """
    Flask route that can generate the audio from a message we generated before.
    
    :return: Returns a BLOB response that includes the gpt reply in mp3 format.
    """
    user_message = request.json['prompt']
    response = requests.post(
        "https://api.openai.com/v1/audio/speech",
        headers={
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        },
        json={
            "model": "tts-1",
            "input": user_message,
            "voice": "alloy",
            "response_format":"opus"
        }
    )

    if response.status_code != 200:
        return jsonify({"error": "Error from TTS API", "details": response.text}), response.status_code
    
    return Response(
        response.content, 
        mimetype="audio/opus",
        headers={
            "Content-Disposition": "attachment;filename=speech.mp3"
        }
    )
    
@app.route('/get_map_image/<map_name>')
def get_map_image(map_name):
    """
    Flask route to ask for a specific map to the NASA GIBS API
    
    :return: Returns a BLOB response that includes the gpt reply in mp3 format.
    """
    print(map_name)
    breakpoint()
    if(not map_name or map_name=='None'):
        return jsonify({"error": "Error while fetching the map", "details": "No Map selected from the API"})
    # Base WMS URL for NASA GIBS
    base_wms_url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'

    # Construct the WMS request URL
    wms_url = f"{base_wms_url}LAYERS={map_name}&REQUEST=GetMap&SERVICE=WMS&" \
        "FORMAT=image/png&WIDTH=3840&HEIGHT=2160&VERSION=1.1.1&SRS=epsg:4326&" \
        "BBOX=-180,-90,180,90&TRANSPARENT=TRUE"

    try:
        #request the image from the WMS service
        response = requests.get(wms_url)
        response.raise_for_status()

        #create an image from the response content
        wms_image = Image.open(BytesIO(response.content))
        wms_image = wms_image.convert("RGBA")
        img_io = BytesIO()
        wms_image.save(img_io, 'PNG', quality=100)
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png')
    except requests.RequestException as e:
        print(e)
        abort(500)
        

@app.route('/video/<path:category>/<path:folder>/<path:filename>')
def send_video(category,folder,filename):
    directory_path = f'./static/{category}/{folder}'
    return send_from_directory(directory_path, filename)

if __name__ == '__main__':
    app.run(port=5000)
