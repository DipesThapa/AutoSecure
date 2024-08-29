import requests

url = 'http://localhost:3000/getRecords/vehicle1'

response = requests.get(url)

if response.status_code == 200:
    print('Retrieved records:', response.json())
else:
    print(f'Failed to retrieve records: {response.text}')

