from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "http://ec2-51-20-76-149.eu-north-1.compute.amazonaws.com:8000"}})

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@app.route('/chat', methods=['POST'])
def chat():
    conversation = request.json['conversation']
    user_message = request.json['prompt']
    
    # Append the new user message to the conversation
    conversation.append({"role": "user", "content": user_message})

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}"
            },
            json={            
                "model": "ft:gpt-3.5-turbo-1106:personal::8LWjN7Ee",
                "messages": conversation
            }
        )
        response.raise_for_status()
        
        # Extract the reply and append it to the conversation
        reply = response.json()['choices'][0]['message']['content']
        conversation.append({"role": "assistant", "content": reply})

        return jsonify({"reply": reply, "conversation": conversation})
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
