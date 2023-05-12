#!/bin/bash

# Temporary file to store command and response history
HISTORY_FILE="/tmp/command_history.txt"

# Extract the optional number of history entries argument
history_entries="$1"
if [[ "$history_entries" =~ ^-?[0-9]+$ ]]; then
  # If the argument is a number, shift the arguments to remove it from the list
  shift
else
  # If no number is provided, use a default value
  history_entries=1
fi

# Check if the command is "chat"
if [[ "$1" == "chat" ]]; then
  node index.js "$history_entries"
else
  # Check if the command includes '|chat|' or '|'
  if [[ $* == *"|"* ]]; then
    # Split the command into the part before '|chat|' or '|' and the part after
    IFS='|' read -ra ADDR <<< "$*"
    COMMAND="${ADDR[0]}"
    CHAT="${ADDR[1]}"

    # If '|chat|' is present, use the part after '|chat|' as the chat input
    if [[ $CHAT == "chat" ]]; then
      CHAT="${ADDR[2]}"
    fi

    # Run the command and capture the output
    OUTPUT=$(eval $COMMAND)
    echo -e "Command: $COMMAND\nResponse:\n$OUTPUT\n----------" >> /tmp/command_history.txt
    node ./index.js "$CHAT"
  else
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
  fi
fi
