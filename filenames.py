#!/usr/bin/env python3

import os
import sys

def create_files_and_directories(file_path):
    try:
        with open(file_path, 'r') as file:
            for line in file:
                line = line.strip()

                # Only process the line if it starts with "File:"
                if line.startswith("File:"):
                    line = line.replace('File:', '').strip()  # Remove 'File:' and strip whitespace

                    # Split the line by commas to get individual paths
                    paths = line.split(',')

                    for path in paths:
                        path = path.strip()

                        # Check if it's a directory (ends with a slash or doesn't contain a dot)
                        if path.endswith('/') or not os.path.splitext(path)[1]:
                            # Create the directory if it doesn't exist
                            if not os.path.exists(path):
                                os.makedirs(path)
                                print(f"Created directory: {path}")
                        else:
                            # Assume it's a file if it has an extension
                            # Get the directory path from the file name
                            directory = os.path.dirname(path)
                            
                            # Create the directory if it doesn't exist
                            if directory and not os.path.exists(directory):
                                os.makedirs(directory)
                            
                            # Create the file
                            with open(path, 'w') as new_file:
                                pass  # Create an empty file
                            
                            print(f"Created file: {path}")
    except FileNotFoundError:
        print(f"Error: {file_path} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python filenames.py <file_with_file_names>")
    else:
        create_files_and_directories(sys.argv[1])
