import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# List all available models
print("Available Gemini models:\n")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")
        print(f"  Display Name: {model.display_name}")
        print(f"  Description: {model.description}")
        print(f"  Supported methods: {model.supported_generation_methods}")
        print()
