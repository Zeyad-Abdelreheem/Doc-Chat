import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import pdfToText from 'react-pdftotext'


function App() {
   
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(false);

  let d = 0;

   // State to store the responses/messages
   const [responses, setResponses] = useState([]);
   
   // Ref to manage the WebSocket connection
   const ws = useRef(null);
   // Ref to scroll to the latest message
   const messagesEndRef = useRef(null);
   // Maximum number of attempts to reconnect
   const [reconnectAttempts, setReconnectAttempts] = useState(0);
   const maxReconnectAttempts = 5;

   // Function to setup the WebSocket connection and define event handlers
  //  const setupWebSocket = () => {
  //      ws.current = new WebSocket('ws://127.0.0.1:8000/ws/chat/');
  //      let ongoingStream = null; // To track the ongoing stream's ID
  //     console.log('page reloaded');
  //      ws.current.onopen = () => {
  //         //  console.log("WebSocket connected!");
  //          setReconnectAttempts(0); // Reset reconnect attempts on successful connection
  //      };

  //      ws.current.onmessage = (event) => {
  //         const data = JSON.parse(event.data);
  //         event.preventDefault();
  //         console.log(responses);
  //         // const llmMessage = [...responses, { sender: "LLM", message: data }];
          
  //         // setResponses(llmMessage);
  //         setResponses((prev) => [...responses, { sender: "LLM", message: data }]);
          
          
  //           // Handle different types of events from the WebSocket
  //         //  console.log(responses)
          
  //      };

  //      ws.current.onerror = (event) => {
  //          console.error("WebSocket error observed:", event);
  //      };

  //      ws.current.onclose = (event) => {
  //         //  console.log(`WebSocket is closed now. Code: ${event.code}, Reason: ${event.reason}`);
  //          handleReconnect();
  //      };
  //  };
  const setupWebSocket = () => {
    ws.current = new WebSocket('ws://127.0.0.1:8000/ws/chat/');
    let ongoingStream = null; // To track the ongoing stream's ID

    ws.current.onopen = () => {
        console.log("WebSocket connected!");
        setReconnectAttempts(0); // Reset reconnect attempts on successful connection
    };

    ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        let sender = data.name;

        // Handle different types of events from the WebSocket
        if (data.event === 'on_parser_start') {
            // When a new stream starts
            ongoingStream = { id: data.run_id, content: '' };
            setResponses(prevResponses => [...prevResponses, { sender, message: '', id: data.run_id }]);
        } else if (data.event === 'on_parser_stream' && ongoingStream && data.run_id === ongoingStream.id) {
            // During a stream, appending new chunks of data
            setResponses(prevResponses => prevResponses.map(msg =>
                msg.id === data.run_id ? { ...msg, message: msg.message + data.data.chunk } : msg));
        }
    };

    ws.current.onerror = (event) => {
        console.error("WebSocket error observed:", event);
    };

    ws.current.onclose = (event) => {
        console.log(`WebSocket is closed now. Code: ${event.code}, Reason: ${event.reason}`);
        handleReconnect();
    };
};
   // Function to handle reconnection attempts with exponential backoff
   const handleReconnect = () => {
       if (reconnectAttempts < maxReconnectAttempts) {
           let timeout = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
           setTimeout(() => {
               setupWebSocket(); // Attempt to reconnect
           }, timeout);
       } else {
          //  console.log("Max reconnect attempts reached, not attempting further reconnects.");
       }
   };

   // Effect hook to setup and cleanup the WebSocket connection
   useEffect(() => {
       setupWebSocket(); // Setup WebSocket on component mount

       return () => {
           if (ws.current.readyState === WebSocket.OPEN) {
               ws.current.close(); // Close WebSocket on component unmount
           }
       };
   }, []);

   // Effect hook to auto-scroll to the latest message
   useEffect(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      //  console.log("updated",responses);
   }, [responses]);


   // Function to render each message
   const renderMessage = (response, index) => {
      // console.log(response);
      return (<div><div className={`${response.sender}`}><strong>{response.sender}</strong></div>
                <div key={index} className={`message-${response.sender}`}>
                <p>{response.message}</p>
                </div>
              </div>);

   };

   // Handler for input changes
   const handleInputChange = (e) => {
       setInputText(e.target.value);
   };

   // Handler for form submission
   const handleSubmit = (e) => {
       e.preventDefault();
      //  const userMessage = [...responses, { sender: "You", message: inputText }];
       
      // setResponses(userMessage);
      setResponses((prev) => [...responses, { sender: "You", message: inputText }])
      //  setResponses([...responses, userMessage]);
       ws.current.send(JSON.stringify({ message: inputText })); // Send message through WebSocket
       setInputText(''); // Clear input field
   };

  




  const handleFileUpload = async (event) => {
    // setSelectedFiles(event.target.files);
    setUploadedFiles(true);
    // console.log('files uploaded');
    // console.log(event.target.files);
    
    pdfToText(event.target.files[0])
        .then(text => ws.current.send(JSON.stringify({'context': text})))
        .catch(error => console.error("Failed to extract text from pdf"))
    
    // const reader = new FileReader();
    // let base64_data = null;

    // reader.onload = (e) => {
    //   base64_data = e.target.result;
    //   ws.current.send(JSON.stringify({'message': base64_data}));
    //   // console.log(base64_data);
    // }
    // reader.readAsDataURL(event.target.files[0])
    

    // ws.current.send(JSON.stringify({'message': base64_data}));
    
  
  };



  return (
    <div className="chat-with-pdfs-container">
      <div className="title">
        <h1>Chat with your PDFs</h1>
      </div>
      
      <div className="upload-pdf">
        <input type="file" accept=".pdf" multiple onChange={handleFileUpload} />
      </div>
      <div className="messages-container">
                {responses.map((response, index) => renderMessage(response, index))}
                
      </div>

      {/* <div className="response-area">
          
        
        <textarea id="response-window" name="response-window" value={responses.map((response, index) => renderMessage(response, index))}>
        </textarea>
        <label className="response-window">
          {responses.map((response, index) => renderMessage(response, index))}
        </label>
      </div> */}

      <div className="text-input">
        <input type="text" placeholder="Enter your text" value={inputText} onChange={handleInputChange} />
        
        <div className="submit-btn">
          {uploadedFiles && <button className='active' onClick={handleSubmit}>Submit</button>}
          {!uploadedFiles && <button className='inactive' disabled>Submit</button>}
          
        </div> 

      </div>
           
    </div>
  );

}

export default App;





