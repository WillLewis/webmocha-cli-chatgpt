#!/usr/bin/env node

require('dotenv').config();
const readline = require('readline');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);
const fs = require('fs');
const HISTORY_FILE = '/tmp/command_history.txt';




// child process to run terminal commands
const { exec } = require('child_process');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

function appendToHistory(command, response) {
  fs.appendFileSync(HISTORY_FILE, `Command: ${command}\nResponse:\n${response}\n----------\n`);
}

// Read command/response pairs from a file
function readLastNPairs(filePath, numPairs = 1) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  let pairs = [];
  let command = '';
  let response = [];
  let currentRole = '';

  for (let line of lines) {
      if (line.startsWith('Command: ')) {
          if (currentRole === 'response') {  // Save previous command/response pair
              pairs.push({ command: command, response: response.join('\n') });
              response = [];  // Reset response
          }
          command = line.replace('Command: ', '');
          currentRole = 'command';
      } else if (line.startsWith('Response:')) {
          currentRole = 'response';
      } else if (line === '----------') {
          if (currentRole === 'response') {  // Save previous command/response pair
              pairs.push({ command: command, response: response.join('\n') });
              response = [];  // Reset response
          }
          currentRole = '';
      } else if (currentRole === 'response') {
          response.push(line);
      }
  }
  // Save the last command/response pair if any
  if (command && response.length) {
      pairs.push({ command: command, response: response.join('\n') });
  }

  // Only keep the last numPairs pairs
  return pairs.slice(-numPairs);
}

async function chatGPTRequest(messages) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      top_p: 0.7,
      stop: null, 
      temperature: 0.5,
    });
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}
  
// Get the command and question from the arguments
const commandQuestion = process.argv[2] || '';
const numPairs = process.argv[3] || 1;
if (commandQuestion.includes('|ai|')) {
  const [command, question] = commandQuestion.split('|ai|');
  runCommand(command).then((response) => {
    appendToHistory(command, response);
    askQuestion(question, numPairs);
  });
} else {
  askQuestion(commandQuestion, numPairs);
}

  
function askQuestion(input, numPairs = 1) {
  if (input.trim()) {
    const lastNPairs = readLastNPairs(HISTORY_FILE, numPairs);
    let messages = [
      {role: 'system', content: 'You are a helpful assistant that provides information about terminal commands and how to debug terminal errors. The user will provide a command and the response it yielded, then ask a question about it.'}
    ];
    // Add each command-response pair as its own user-assistant message pair
    lastNPairs.forEach(pair => {
      messages.push({role: 'user', content: `Command: ${pair.command}`});
      messages.push({role: 'assistant', content: `Response: ${pair.response}`});
    });
    // Add the user's new input
    messages.push({role: 'user', content: input});
    chatGPTRequest(messages);
  } else {
    console.log('Invalid input. Please type a question for ChatGPT.');
  }
}



