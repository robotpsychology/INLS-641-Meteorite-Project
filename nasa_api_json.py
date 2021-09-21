import requests
import json
from datetime import date
import pandas as pd
from sodapy import Socrata


today = date.today().strftime("%b_%d_%Y")

def convert_json_data_types(results):
    for entry in results:    
        if 'id' in entry.keys():
            entry['id'] = int(entry['id'])

        if 'mass' in entry.keys():
            entry['mass'] = float(entry['mass'])

        if 'reclat' in entry.keys():
            entry['reclat'] = float(entry['reclat'])

        if 'reclong' in entry.keys():
            entry['reclong'] = float(entry['reclong'])

        if 'geolocation' in entry.keys():
            entry['geolocation']['latitude'] = float(entry['geolocation']['latitude'])
            entry['geolocation']['longitude'] = float(entry['geolocation']['longitude'])

    return results
    

# Unauthenticated client only works with public data sets. Note 'None'
# in place of application token, and no username or password:
client = Socrata("data.nasa.gov", None)

results = client.get("gh4g-9sfh", limit=50000)


print(len(results))
data = convert_json_data_types(results)

with open(f'./data/nasa_meteorite_data_{today}.json', 'w') as outfile:
    json.dump(data, outfile, indent=4)


