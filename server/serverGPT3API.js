import express from 'express' //backend server framework
import * as dotenv from 'dotenv' // access and use API KEY stored in .env file
import cors from 'cors' //allow make cross origin API request to server from frontend
import allowedOrigins from './whitelist.js'; //allowed domains only
import { Configuration, OpenAIApi } from 'openai' //Openai API wrapper


//call config function to give access to .env API KEY variable
dotenv.config() 


//Openai API wrapper function which accepts API KEY as object parameter
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


// create instance of Openai and pass in the configuration object created above
const openai = new OpenAIApi(configuration);


// initialize expressjs server
const app = express()


// configure the cors middleware to allow accepting and processing request from allowed domains
app.use(cors({
  origin: (origin, callback) => {
    // check if the origin is in the allowed origins array
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


//middleware: allows the backend to recieve and acces request from frontend as a json object
// rather than just a string. 
// This is necessary in the following POST request route code: 
// app.post('/', async (req, res) => {
// try {const prompt = req.body.prompt; 
// where it uses req.body to get the prompt data/question sent in the post request
// from our chatGPT Ai chatBot SvelteKit powered frontend
app.use(express.json())


// routes/endpoint to expose expressjs backend to frontend "GET" request
// with a return statement of info to show user visiting the route
// "started on http://localhost:5001" makes the port link clickable from terminal
app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello Web3 AI World from Foskaay AI',
  })
})


//route/endpoint which allows Expressjs backend to recieve and process
// the request sent from users of our chatGPT Ai chatBot SvelteKit powered frontend
app.post('/', async (req, res) => {

    // check if the origin is in the allowed origins array/whitelist domains 
    // before processing request
    if (!allowedOrigins.includes(req.headers.origin)) {
      return res.status(401).send({ message: 'Unauthorized: Origin not allowed' });
    }
  
  try {
    const prompt = req.body.prompt; //access user question submited as prompt

    //Initiate an API call to Openai's API to recieve response for user questions 
    //from Openai's AI
    // But while making the call we bundle the user question/prompt and other
    // instructions to ensure we get the best response from the AI back to user
    const response = await openai.createCompletion({
      model: "text-davinci-003", //most powerful openai large language Ai model for now
      prompt: `${prompt}`, //input text value of the form input box in sveltekit app ui
      temperature: 1, // Higher values means the model will take more risks and can change/modify response for same question when asked again.
      max_tokens: 3000, // If not specified, it auto limit reponses usually less than 50 character (thats about 50 words)The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support over 8,000).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
      // user: "user123456", // optional but can be useful to detect user abusing your API request. You can use session ID or hash email/psw so each user is unique but still not individually identificable for openai
    });

    //Send the AI response back to user of 
    // our chatGPT Ai chatBot SvelteKit powered frontend 
    //in json format with a success status code of 200. 
    res.status(200).send({
      ai: response.data.choices[0].text
    });


    // logs error to the console and sends it back our chatGPT Ai chatBot SvelteKit powered frontend
    //with a status of 500 if there is any error caught in try block.
  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong communicating with Ai Foskaay');
  }
})


// start the server on specified port on localhost
// this get overriden when deployed to web server by the server url
app.listen(5000, () => console.log('Foskaay Ai server started on http://localhost:5000'))