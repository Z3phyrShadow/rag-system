import requests

# Test the upload endpoint
files = {'files': open('docs/ancient_rome.md', 'rb')}
response = requests.post('http://localhost:8000/upload', files=files)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
