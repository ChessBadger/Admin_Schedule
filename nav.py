import pandas as pd
from tkinter import Tk, filedialog


def prompt_user():
    response = input("Do you want to update the employee list? (y/n): ")
    return response.strip().lower() == 'y'


def navigate_to_excel_file():
    root = Tk()
    file_path = None
    try:
        root.withdraw()
        root.update_idletasks()  # Ensure all idle tasks are completed
        file_path = filedialog.askopenfilename(
            title="Select an Excel file",
            filetypes=[("Excel files", "*.xlsx *.xls")]
        )
        root.update()  # Process events
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        root.destroy()
    return file_path


if __name__ == "__main__":
    if prompt_user():
        print("User wants to update the employee list.")
        file_path = navigate_to_excel_file()
        if file_path:
            print(f"File selected: {file_path}")
            # Read the Excel file
            excel_data = pd.read_excel(file_path)
            # Display the content of the Excel file
            print(excel_data)
        else:
            print("No file selected.")
    else:
        print("No update made to the employee list.")
