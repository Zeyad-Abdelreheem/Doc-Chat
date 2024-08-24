### Project Overview
Doc-Chat project demonstrates a React-Django application designed for natural language interaction with PDF documents. It leverages advanced AI techniques, including vector databases and language models, to provide efficient and accurate responses to user queries.

### Technologies Used
* **Frontend:** React
* **Backend:** Django
* **Database:** Chroma (vector database)
* **AI Frameworks:** Ollama, Langchain
* **Deployment:** Docker Compose

### Project Structure
```
project_name/
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── ...
└── backend/
    ├── manage.py
    ├── requirements.txt
    └── ...
```

### Installation and Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zeyad-Abdelreheem/Doc-Chat.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd Doc-Chat
   ```
3. **Build and run the Docker containers:**
   ```bash
   docker-compose up --build
   ```
4. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`.

  - **OLLAMA_API_KEY:** API key for your Ollama account
  - **LLAMA_INDEX_API_KEY:** API key for your Llama-index account

**Note:** Replace placeholders with your actual API keys and configuration values.

### Additional Notes
* **Data preparation:** Ensure that your PDF documents are in the appropriate format and location for your application to process them.
* **Customization:** You can customize the application's behavior by modifying the frontend and backend code, as well as the AI models and parameters used.

**For more detailed instructions and customization options, refer to the specific documentation of the technologies used in the project.**
