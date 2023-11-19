from openai import OpenAI
client = OpenAI()

client.files.create(
    file=open("fine_tune_examples.js", "rb"),
    purpose="fine-tune"
)