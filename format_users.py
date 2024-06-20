import pandas as pd
import json
import os

# File paths
excel_file_path = 'EmployeeListSchedule.xlsx'
json_file_path = 'formatted_users.json'

# Read the Excel file
df = pd.read_excel(excel_file_path)

# Load existing JSON data
if os.path.exists(json_file_path):
    with open(json_file_path, 'r') as json_file:
        formatted_users = json.load(json_file)
else:
    formatted_users = []

# Create a dictionary for existing users
existing_users = {user['username']: user for user in formatted_users}

# Office mapping
office_mapping = {
    "Grafton": "Milwaukee",
    "Baraboo": "Madison",
    "Florida": "Rockford",
    "Stevens Point": "Fox Valley"
}

# Process each row in the DataFrame
for index, row in df.iterrows():
    first_name = row['FirstName'].capitalize()
    last_name = row['LastName'].capitalize()
    emp_num = str(row['EmployeeNumber'])  # Convert employee number to string
    office = row['OfficeName']

    # Apply office mapping
    office = office_mapping.get(office, office)

    # Create the username, display name, and determine office location
    username = first_name[0].lower() + last_name.lower()
    display_name = f"{first_name} {last_name[0].lower()}"

    # Create a dictionary for the formatted user data
    user_data = {
        "username": username,
        "password": emp_num,
        "type": "user",
        "displayName": display_name,
        "office": office,
        "firstName": first_name,
        "lastName": last_name
    }

    # Update existing user or add new user
    existing_users[username] = user_data

# Convert the dictionary back to a list
updated_users = list(existing_users.values())

# Write the updated user data to the JSON file
with open(json_file_path, 'w') as json_file:
    json.dump(updated_users, json_file, indent=2)

print("Formatted user data has been saved to formatted_users.json")
