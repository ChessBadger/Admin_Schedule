import json

# Load the JSON data from the files
with open('formatted_users.json', 'r') as f:
    users_data = json.load(f)

with open('store_runs.json', 'r') as f:
    store_runs_data = json.load(f)

# Create a mapping of employee display names (in lowercase) to their office locations
employee_office_mapping = {user['displayName'].lower(
): user['office'] for user in users_data if 'displayName' in user and 'office' in user}

# Replace 'none' values in the store_runs employee_list with corresponding office values from the mapping
for run in store_runs_data:
    if 'employee_list' in run:
        for employee, details in run['employee_list'].items():
            if employee.lower() in employee_office_mapping:
                details[-1] = employee_office_mapping[employee.lower()]

# Save the updated store_runs data back to a new JSON file
updated_store_runs_path = 'store_runs.json'
with open(updated_store_runs_path, 'w') as f:
    json.dump(store_runs_data, f, indent=4)

print(f'Updated file saved to {updated_store_runs_path}')
