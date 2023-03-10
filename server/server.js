import express from 'express' //backend server framework
import * as dotenv from 'dotenv' // access and use API KEY stored in .env file
import cors from 'cors' //allow make cross origin API request to server from frontend
import allowedOrigins from './whitelist.js'; //allowed domains only
import { Configuration, OpenAIApi } from 'openai' //Openai API wrapper
import { toChatML, get_message } from "gpt-to-chatgpt"; //using this as wrapper to make chatgpt api call work till official openai package is upgraded


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
    openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: toChatML((prompt)) 
    }).then((data) => {
      const aiResponse = get_message(data.data);
      // console.log(aiResponse); // Log the response to the console for confirmation
      // console.log((get_message(data.data)));
      
      // Send the response back to the frontend
     res.status(200).send({
       ai: aiResponse,
     }); 
    });


    // logs error to the console and sends it back our chatGPT Ai chatBot SvelteKit powered frontend
    //with a status of 500 if there is any error caught in try block.
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: error.message,
    });
  }
})


// start the server on specified port on localhost
// this get overriden when deployed to web server by the server url
app.listen(5000, () => console.log('Foskaay Ai server started on http://localhost:5000'))