
<svelte:head>
	<title>Home</title>
	<meta name="description" content="Foskaay Coding Ai" />
</svelte:head>

<!-- <svelte:head>
  <title>Foskaay AI: Ai coding support for programmers</title>
</svelte:head> -->
<script lang="ts">
	import banner1 from '$lib/images/banner1.jpg';
	import { v4 as uuidv4 } from 'uuid';
	import Prism from 'svelte-prism';
	import '$lib/styles/prism-okaidia.css'; //svelte-prism css
	import { onMount } from 'svelte';
// import '$lib/styles/chat.css';
//   import { library} from '@fortawesome/fontawesome-svg-core';
//   import { faEdit, faCheck, faTimes, faTrashCan } from '@fortawesome/free-solid-svg-icons';
//   import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  
  
  uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
//   library.add(faEdit, faCheck, faTimes); // Add the icons you want to use
 
  
  let messageUser = ''; //user's query, question and prompts
  let messageAi = ''; //foskaay AI response to user's query, question and prompts  
  let messages = []; //Add both User and Foskaay Ai chatBot response to display to user
  let chatId; // Auto generate unique ID with UUID per chat instance like ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
  let chatInstances = []; // array of chat instances added by clicking on "Create New Chat" button
  let newTitle = '';
  // Get the reference to the message display container
  let messageDisplayContainer;

  
  // Check if the window object exists to avoid errors in server-side rendering
  // This will ensure that the code that accesses the window object only 
  // runs in the client-side environment where the window object is defined, and it will avoid the error in the server-side environment.
  if (typeof window !== 'undefined') {
    try {
      chatId = window.location.hash.substring(1);
    } catch (error) {
      // Handle the error
      console.error(error);
    }
  }
  
  if (!chatId) {
  // Generate a new chat ID
  chatId = uuidv4();

  if (typeof window !== 'undefined') {
    // Update the URL with the new chat ID
    window.history.replaceState(null, null, `#${chatId}`);
  }
}



  // Load the messages from local storage when the component is mounted
onMount(() => {
  try {
    const storedChatInstances = window.localStorage.getItem('chat-instances');
    if (storedChatInstances) {
      chatInstances = JSON.parse(storedChatInstances);
      // selectedChatInstance = chatInstances.find(instance => instance.id === chatId);
    }
  } catch (error) {
    // Handle the error
    console.error(error);
  }


      // Set up an observer to observe the message display container for any changes
      const observer = new MutationObserver(() => {
      // Scroll the message display container to the bottom to show the latest messages
      messageDisplayContainer.scrollTop = messageDisplayContainer.scrollHeight;
    });

    // Start observing the message display container for changes
    observer.observe(messageDisplayContainer, { childList: true, subtree: true });

});

  





async function onSubmit(event) {
    event.preventDefault();
  
    // Add the user's message to the messages array
    messages = [...messages, { text: messageUser, type: 'user' }];
  
    // Save the messages to local storage
    try {
      window.localStorage.setItem(`chat-${chatId}-messages`, JSON.stringify(messages));
    } catch (error) {
      // Handle the error
      console.error(error);
    }
  
    // Send a POST request to the generate endpoint with the message as the request body
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify({ prompt: messageUser }),
    });
     
    if (response.ok) {

      // Get the response from the API as JSON
        let Response = await response.json();
        let rawAiResponse = Response.ai; //assign AI response data content to variable

      //pass the api response to highlightCode function to highlight its code
        messageAi = highlightCode(rawAiResponse);
        // let highlightedAiResponse = highlightCode(rawAiResponse);

        // Add the AI's message to the messages array
        messages = [...messages, { text: messageAi, type: 'ai' }];
  
      // Save the messages to local storage
      try {
        window.localStorage.setItem(`chat-${chatId}-messages`, JSON.stringify(messages));
      } catch (error) {
        // Handle the error
        console.error(error);
      }
    } else {
      alert('An error occurred while submitting the form.');
    }
  
    // Clear the message input
    messageUser = '';
}
  




// use regular expressions to identify if there is code in the AI's response and then only apply the syntax highlighting to that specific code
function highlightCode(ai: string) {
    const regex = /```(.*?)\n(.*?)\n```/gs;
    let match;
    while ((match = regex.exec(ai)) !== null) {
        const language = match[1];
        const code = match[2];
        ai = ai.replace(match[0], `<Prism language="${language}">${code}</Prism>`);
    }
    console.log("Highlight Function ReturnAi", ai)
    return ai;
    
}




  // Function to create a new chat instance with unique id url and save old one in local storage
async function onCreateNewChat() {
  // Save the current chat instance in the local storage
  try {
    window.localStorage.setItem(`chat-${chatId}-messages`, JSON.stringify(messages));
  } catch (error) {
    // Handle the error
    console.error(error);
  }

  // Generate a new chat ID
  chatId = uuidv4();

  // Update the URL with the new chat ID
  window.history.replaceState(null, null, `#${chatId}`);

  // Retrieve the list of chat instances from the local storage
  try {
    const storedChatInstances = window.localStorage.getItem('chat-instances');
    if (storedChatInstances) {
      chatInstances = JSON.parse(storedChatInstances);
    }
  } catch (error) {
    // Handle the error
    console.error(error);
  }

  // Add the new chat instance to the beginning of the chatInstances array
  chatInstances = [{ id: chatId, title: `Chat ${chatInstances.length + 1}` }, ...chatInstances];

  // Save the updated list of chat instances in the local storage
  try {
    window.localStorage.setItem('chat-instances', JSON.stringify(chatInstances));
  } catch (error) {
    // Handle the error
    console.error(error);
  }

  // Reset the messages array
  messages = [];
}



// Function to select a chat instance
async function onSelectChatInstance(event) {
  // Get the chat ID from the URL
  chatId = event.target.getAttribute('href').substring(1);

  // Load the messages for the selected chat instance from local storage
  try {
    const storedMessages = window.localStorage.getItem(`chat-${chatId}-messages`);
    if (storedMessages) {
      messages = JSON.parse(storedMessages);
    }
  } catch (error) {
    // Handle the error
    console.error(error);
  }
}


 
</script>



<!-- left-column left sidebar -->
<div class="left-column">
  <img src={banner1} alt="Banner ad" id="banner">
</div>

<!-- center-coloumn for chats conversation -->
<div class="center-column">
  <div class="chat">
    {#if messages.length === 0}
      <div class="prompts-container">
        <div class="prompts-section">
          <h2>Prompts</h2>
          <p class="prompt" data-text="What is your favorite color?">What is your favorite color?</p>
          <p class="prompt" data-text="What is your favorite animal?">What is your favorite animal?</p>
          <p class="prompt" data-text="What is your favorite food?">What is your favorite food?</p>
        </div>
        <div class="features-section">
          <h2>Features</h2>
          <ul>
            <li>Realistic conversations</li>
            <li>Quick responses</li>
            <li>Unlimited chat instances</li>
          </ul>
        </div>
      </div>
    {/if}

<p>NEW DISPLAY BELOW:</p>
<!-- Set the reference to the message display container -->

<!-- <script>
  export let messages = [];
</script> -->

<div class="message-display" bind:this={messageDisplayContainer}>
  {#each messages as message}
    <div class="chat-message {message.type}">
      <Prism language="javascript">{message.text}</Prism>
    </div>
  {/each}
</div>


  
  </div>
    
  {#if chatInstances.length > 0}
    <form on:submit|preventDefault={onSubmit}>
      <input type="text" bind:value={messageUser} placeholder="Type your question here..." />
      <button type="submit">Ask Foskaay</button>
    </form>
  {/if}
</div>




<!-- right-colum right sidebar -->
<div class="right-column">
  <button id="new-chat" on:click={onCreateNewChat}>Create New Chat</button>
  <div id="chat-instance-list">
    {#each chatInstances as chatInstance}
      <div class="chat-instance">
        {#if chatInstance.isEditing}
          <input type="text" bind:value={newTitle} on:input={e => newTitle = e.target.value}>
          <br>
          <button>
            Save
          </button>
          <button>
            Cancel
          </button>
        {:else}
          <a href={`#${chatInstance.id}`} on:click={onSelectChatInstance}>{chatInstance.title}</a>
          <button>
            Edit
          </button>
          <button>
            Del
          </button>
        {/if}
      </div>
      <br>
    {/each}
  </div> 
</div>








<style>
  /* Add a border to the chat container */
  .chat {
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    margin: 0 20px;
    height: 800px;
    overflow: auto;    
  }
  
  
  /* Adjust the font size and font family of the messages */
  .message {
    font-size: 14px;
    font-family: Arial, sans-serif;
  }
  
  /* Add a hover effect to the prompts */
  .prompt:hover {
    color: red;
  }
  
  /* Add styles for the left, center and right columns */
  .left-column {
    width: 15%;
    float: left;
  }
  
  .center-column {
    width: 65%;
    float: left;
  }
  
  /* Add styles for the right column */
.right-column {
width: 20%;
float: left;
}


  /* Add styles for the banner ad and chat container */
  #banner {
    width: 100%;
  }
  

  
  /* Add styles for the prompts container and prompts */
  .prompts-container {
    text-align: center;
  }
  
  .prompts-section {
    margin: 20px;
  }
  
  .prompt {
    cursor: pointer;
    display: inline-block;
    margin: 10px;
    padding: 10px 20px;
    background-color: #eee;
    border-radius: 4px;
  }
  
  /* Add styles for the form and input */
  form {
    display: flex;
    margin: 20px;
  }
  
  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    margin-left: 10px;
    padding: 10px 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .message {
    margin: 10px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
  }

  .user {
    background-color: #eee;
  }

  .bot {
    background-color: #ddd;
  }

  .features-section {
    margin: 20px;
  }

  .features-section ul {
    list-style: none;
    padding: 0;
  }

  /* Add scrolling to chatinstances title labels */
  #chat-instance-list {
  height: 700px;
  overflow-y: scroll;
}

/* prevent the Save and Delete buttons from covering the input field 
by positioning the buttons below the input field */
/* .right-column #chat-instance-list input + button {
  position: absolute;
  bottom: 0;
} */

/* edit icon style */
/* .edit-icon {
    cursor: pointer;
  } */ 

  
/* observer and scroll message styling */
.message {
    display: flex;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 10px;
    /* max-width: 90%; */
    word-wrap: break-word;
  }

  .user {
    align-self: flex-end;
    background-color: #d2f1e0;
  }

  .ai {
    align-self: flex-start;
    background-color: #eaeaea;
  }

  .message p {
    margin: 0;
  }

  /* This is the CSS code for the message display container */
  .message-display-container {
    height: 700px;
    overflow-y: auto;
  }


  /* format message for better readability */
  .chat-message {
  margin: 1rem 0;
}

.chat-message.user {
  background-color: #f3f3f3;
  padding: 0.5rem 1rem;
  border-radius: 1rem 1rem 0 1rem;
}

.chat-message.ai {
  background-color: #5f9ea0;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 1rem 1rem 1rem 0;
}


</style>