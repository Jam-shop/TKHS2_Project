import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('/home/nilanjanade/College/2-1/TKHS-II/Project/Primary_sources/1991_Census/1991-C09T-0100.xlsx')

# Convert DataFrame to a dictionary list format
data = df.to_dict(orient="records")

# Save to a JSON file
with open('district_data.json', 'w') as f:
    json.dump(data, f, indent=4)
