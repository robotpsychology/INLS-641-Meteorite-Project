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

def create_new_classifications(data):
    for entry in data:
        entry['subclasses'] = {"class1":None, "class2":None, "class3":None}
        classid = entry['recclass']

        ## Chondrite subclasses
        # Ordinary
        if (classid.startswith("L") and not("Lunar" in classid) and not("Lodranite" in classid)) or (classid.startswith("H") and not("Howardite" in classid)) or classid.startswith("OC"):
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Ordinary"]
            if "L(LL)" in classid or "L/LL" in classid or "LL(L)" in classid:
                entry['subclasses']['class3'] =["L","LL"]
            elif "LL" in classid:
                entry['subclasses']['class3'] = ["LL"]
            elif classid.startswith("H/L") or classid.startswith("L(H)") or classid.startswith("H(L)"):
                entry['subclasses']['class3'] = ["H","L"]
            elif classid.startswith("L"):
                entry['subclasses']['class3'] = ["L"]
            elif classid.startswith("H"):
                entry['subclasses']['class3'] = ["H"]
            elif classid.startswith("OC"):
                entry['subclasses']['class3'] = ["Other Ordinary Chondrite"]
        # Carbonacous
        elif classid.startswith("C") and not("Chondrite" in classid):
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Carbonacous"]
            if "CB" in classid:
                entry['subclasses']['class3'] = ["CB"]
            if "CH" in classid:
                if(entry['subclasses']['class3']):
                    entry['subclasses']['class3'].append("CH")
                else:
                    entry['subclasses']['class3'] = ["CH"]
            elif classid.startswith("CK"):
                entry['subclasses']['class3'] = ["CK"]
            elif classid.startswith("CM"):
                entry['subclasses']['class3'] = ["CM"]
            elif classid.startswith("CR"):
                entry['subclasses']['class3'] = ["CR"]
            elif classid.startswith("CV"):
                entry['subclasses']['class3'] = ["CV"]
            elif classid.startswith("CO"):
                entry['subclasses']['class3'] = ["CO"]
            elif classid.startswith("CI"):
                entry['subclasses']['class3'] = ["CI"]
            elif classid.startswith("C"):
                entry['subclasses']['class3'] = ["C"]
        # Other Chondrite
        elif "Chondrite-" in classid:
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Other Chondrite"]
        # Rumuruti
        elif classid.startswith("R") and not("Relict" in classid):
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Rumuruti"]
        # Enstatiate
        elif classid.startswith("E") and not(classid.startswith("Eucrite"):
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Enstatiate"]
            if classid.startswith("EH"):
                entry['subclasses']['class3'] = ["EH"]
            elif classid.startswith("EL"):
                entry['subclasses']['class3'] = ["EL"]
            elif classid.startswith("Enst"):
                entry['subclasses']['class3'] = ["Other Enstatiate"]
            elif classid.startswith("E"):
                entry['subclasses']['class3'] = ["E"]
        # Kakangari
        elif classid.startswith("K"):
            entry['subclasses']['class1'] = ["Chondrite"]
            entry['subclasses']['class2'] = ["Kakangari"]

        ## Achondrite subclasses
        # Primitive achondrites
        elif classid.startswith("Acapulcoite") or "prim" in classid or classid.startswith("Lodranite") or classid.startswith("Winonaite"):
             entry['subclasses']['class1'] = ["Achondrite"]
             entry['subclasses']['class2'] = ["Primitive Achondrite"]
             if classid.startswith("Acapulcoite"):
                entry['subclasses']['class3'] = ["Acapulcoite"]
                if "Lodranite" in classid or "lodranite" in classid:
                    entry['subclasses']['class3'].append("Lodranite")
             elif classid.startswith("Lodranite"):
                entry['subclasses']['class3'] = ["Lodranite"]
             elif classid.startswith("Winonaite"):
                entry['subclasses']['class3'] = ["Winonaite"]
        # Martian
        elif classid.startswith("Martian"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Martian"]
            if "basaltic breccia" in classid:
                entry['subclasses']['class3'] = ["Martian Basaltic Breccia"]
            elif "chassignite" in classid:
                entry['subclasses']['class3'] = ["Martian Chassignite"]
            elif "nakhlite" in classid:
                entry['subclasses']['class3'] = ["Martian Nakhlite"]
            elif "OPX" in classid:
                entry['subclasses']['class3'] = ["Martian OPX"]
            elif "shergottite" in classid:
                entry['subclasses']['class3'] = ["Martian Shergottite"]
            else:
                entry['subclasses']['class3'] = ["Other Martian"]
        # Aubrite
        elif classid.startswith("Aubrite"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Aubrite"]
        # Ureilite
        elif classid.startswith("Ureilite"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Ureilite"]
            if "an" in classid:
                entry['subclasses']['class3'] = ["Anomalous"]
            elif "pmict" in classid:
                entry['subclasses']['class3'] = ["Polymict"]
            else:
                entry['subclasses']['class3'] = ["Other Ureilite"]
        # HED
        elif classid.startswith("Eucrite") or classid.startswith("Diogenite") or classid.startswith("Howardite") or classid.startswith("Impact"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["HED"]
            if classid.startswith("Howardite"):
                entry['subclasses']['class3'] = ["Howardite"]
            elif classid.startswith("Eucrite"):
                entry['subclasses']['class3'] = ["Eucrite"]
            elif classid.startswith("Diogenite"):
                entry['subclasses']['class3'] = ["Diogenite"]
            elif classid.startswith("Impact"):
                entry['subclasses']['class3'] = ["Impact Melt Breccia"]
        # Angrite
        elif classid.startswith("Angrite"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Angrite"]
        # Brachinite
        elif classid.startswith("Brachinite"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Brachinite"]
        # Lunar
        elif classid.startswith("Lunar"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Lunar"]
            if "anor" in classid:
                entry['subclasses']['class3'] = ["Lunar Anorth"]
            if "gab" in classid:
                if(entry['subclasses']['class3']):
                    entry['subclasses']['class3'].append("Gabboric Breccia")
                else:
                    entry['subclasses']['class3'] = ["Gabboric Breccia"]
            if "bas" in classid and "brec" in classid:
                if(entry['subclasses']['class3']):
                    entry['subclasses']['class3'].append("Basaltic Breccia")
                else:
                    entry['subclasses']['class3'] = ["Basaltic Breccia"]
            elif "basalt" in classid:
                entry['subclasses']['class3'] = ["Basalt"]
            elif "feldsp" in classid:
                entry['subclasses']['class3'] = ["Feldspar Breccia"]
            elif "gabbro" in classid:
                entry['subclasses']['class3'] = ["Gabbroic Breccia"]
            elif "norite" in classid:
                entry['subclasses']['class3'] = ["Norite"]
            else:
                entry['subclasses']['class3'] = ["Other Lunar"]
        # Other Achondrite
        elif classid.startswith("Achondrite-ung"):
            entry['subclasses']['class1'] = ["Achondrite"]
            entry['subclasses']['class2'] = ["Other Achondrite"]

        ## Stony-iron subclasses
        elif classid.startswith("Pallasite") or classid.startswith("Mesosiderite") or classid.startswith("Stone"):
            entry['subclasses']['class1'] = ["Stony-iron"]
            if classid.startswith("Mesosiderite"):
                entry['subclasses']['class3'] = ["Mesosiderite"]
            elif classid.startswith("Pallasite"):
                entry['subclasses']['class3'] = ["Pallasite"]
            else:
                entry['subclasses']['class3'] = ["Other Stony-iron"]

        ## Iron subclasses
        elif classid.startswith("Iron"):
            entry['subclasses']['class1'] = ["Iron"]
            if "IIIAB" in classid:
                entry['subclasses']['class3'] = ["Iron IIIAB"]
            elif "IIAB" in classid:
                entry['subclasses']['class3'] = ["Iron IIAB"]
            elif "IAB" in classid:
                entry['subclasses']['class3'] = ["Iron IAB"]
            elif "IIC" in classid:
                entry['subclasses']['class3'] = ["Iron IIC"]
            elif "IC" in classid:
                entry['subclasses']['class3'] = ["Iron IC"]
            elif "IID" in classid:
                entry['subclasses']['class3'] = ["Iron IID"]
            elif "IIIE" in classid:
                entry['subclasses']['class3'] = ["Iron IIIE"]
            elif "IIE" in classid:
                entry['subclasses']['class3'] = ["Iron IIE"]
            elif "IIIF" in classid:
                entry['subclasses']['class3'] = ["Iron IIIF"]
            elif "IIF" in classid:
                entry['subclasses']['class3'] = ["Iron IIF"]
            elif "IIG" in classid:
                entry['subclasses']['class3'] = ["Iron IIG"]
            elif "IVA" in classid:
                entry['subclasses']['class3'] = ["Iron IVA"]
            elif "IVB" in classid:
                entry['subclasses']['class3'] = ["Iron IVB"]
            else:
                entry['subclasses']['class3'] = ["Other Iron"]

        ## Relicts subclass
        elif classid.startswith("Relict") or classid.startswith("Fusion"):
            entry['subclasses']['class1'] = ["Relict"]

        ## Unknown subclass
        else:
            entry['subclasses']['class1'] = ["Unknown"]

    return data

# Unauthenticated client only works with public data sets. Note 'None'
# in place of application token, and no username or password:
client = Socrata("data.nasa.gov", None)

results = client.get("gh4g-9sfh", limit=50000)


print(len(results))
data = convert_json_data_types(results)
data = create_new_classifications(data)

with open(f'./data/nasa_meteorite_data_{today}.json', 'w') as outfile:
    json.dump(data, outfile, indent=4)


