import requests
import json

# Test the generate-quiz endpoint
data = {
    "topic": "Ancient Rome",
    "num_questions": 2,
    "use_rag": False  # Test without RAG first
}

response = requests.post('http://localhost:8000/generate-quiz', json=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text[:500]}")  # First 500 chars

if response.status_code == 200:
    print("\n✓ SUCCESS!")
else:
    print("\n✗ FAILED!")
