import json
from collections import defaultdict

# Read the text file and parse the data
with open('teset.txt', 'r') as file:
    lines = file.readlines()

# Extract the headers
headers = lines[0].strip().split('\t')

# Initialize an empty list to store formatted user data
formatted_users = []
first_name_count = defaultdict(int)

# First pass to count first names
for line in lines[1:]:
    fields = line.strip().split('\t')
    first_name = fields[0].capitalize()
    first_name_count[first_name] += 1

# Second pass to create user data
for line in lines[1:]:
    # Split the line by tab to extract individual fields
    fields = line.strip().split('\t')
    first_name = fields[0].capitalize()
    last_name = fields[1].capitalize()
    emp_num = fields[2]

    # Create the username, display name, and determine office location
    username = first_name[0].lower() + last_name.lower()
    if first_name_count[first_name] > 1:
        display_name = first_name.lower() + " " + last_name[0].lower()
    else:
        display_name = first_name.lower()
    office = "milwaukee" if emp_num.startswith('3') else "other"

    # Create a dictionary for the formatted user data
    user_data = {
        "username": username,
        "password": emp_num,
        "type": "user",
        "displayName": display_name,
        "office": office
    }

    # Append the formatted user data to the list
    formatted_users.append(user_data)

# Write the formatted user data to a new JSON file
with open('formatted_users.json', 'w') as json_file:
    json.dump(formatted_users, json_file, indent=2)

print("Formatted user data has been saved to formatted_users.json")
