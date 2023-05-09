#!/bin/bash

# Temporary file to store command and response history
HISTORY_FILE="/tmp/command_history.txt"

# Execute the command and capture both stdout and stderr
output=$(eval "$@" 2>&1)

# Save the command and output as variables
command="$@"
response="$output"

# Append the command and response to the history file
echo "Command: $command" >> "$HISTORY_FILE"
echo "Response:" >> "$HISTORY_FILE"
echo "$response" >> "$HISTORY_FILE"
echo "----------" >> "$HISTORY_FILE"

# Call your Node.js script
node index.js