require('dotenv').config();
const readline = require('readline');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);
const fs = require('fs');
const HISTORY_FILE = '/tmp/command_history.txt';

function readLastNLines(file, numLines) {
  const data = fs.readFileSync(file, 'utf8');
  const lines = data.trim().split('\n');
  return lines.slice(Math.max(lines.length - numLines, 0)).join('\n');
}


// Function to send a request to ChatGPT API
async function chatGPTRequest(prompt) {
    try {
        const response = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt: prompt,
          max_tokens: 150,
          top_p: 0.7,
          stop: null, 
          temperature: 0.5,
        });
      console.log(response);  
      console.log(response.data.choices[0].text);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Type your question for ChatGPT: ', (input) => {
    if (input.trim()) {
      const lastNLines = readLastNLines(HISTORY_FILE, 20); // Adjust the number of lines to capture the desired number of commands and responses
      const prompt = `Last commands and their responses:\n${lastNLines}\n${input}`;
      chatGPTRequest(prompt);
    } else {
      console.log('Invalid input. Please type a question for ChatGPT.');
    }
    rl.close();
  });