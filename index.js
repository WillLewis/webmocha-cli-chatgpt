require('dotenv').config();
const readline = require('readline');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);




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
  
  // Read the user's input from the command line
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('Type "wm-ai-help": ', (input) => {
    if (input.trim() === 'wm-ai-help') {
      const prompt = 'Last 10 terminal commands and their responses: ...\nPlease help me debug this issue.';
      chatGPTRequest(prompt);
    } else {
      console.log('Invalid command. Please type "wm-ai-help".');
    }
    rl.close();
  });