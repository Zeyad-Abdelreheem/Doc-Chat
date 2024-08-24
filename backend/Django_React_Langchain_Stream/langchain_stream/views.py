from django.shortcuts import render

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOllama
from langchain.embeddings import SentenceTransformerEmbeddings
# from langchain_community.embeddings import SentenceTransformerEmbeddings
from channels.generic.websocket import AsyncWebsocketConsumer
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma


import subprocess
import json

# process = subprocess.Popen("ollama serve", shell=True)



embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")


text_splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=50, length_function=len)



vectorstore = None


# Local LLM
ollama_llm = "qwen:0.5b" #"llama3"

# process = subprocess.Popen(f"ollama pull {ollama_llm}", shell=True)

model_local = ChatOllama(model=ollama_llm)


prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("user", "based on the following context: {context} respond to the following user input: {input}"),
])

output_parser = StrOutputParser()

chain =  prompt | model_local.with_config({"run_name": "model"}) | output_parser.with_config({"run_name": "Assistant"})


class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        global vectorstore

        text_data_json = json.loads(text_data)
        
        if 'context' in text_data_json.keys():
            all_splits = text_splitter.create_documents([text_data_json["context"]])

            vectorstore = Chroma.from_documents(
                documents = all_splits,
                collection_name="rag-chroma",
                embedding=embeddings,
            )
            #print(all_splits)
        else:
            
            message = text_data_json["message"]
            # print(message)
            try:
               
                if vectorstore == None:
                    context = ""
                else:
                    relevant_docs = vectorstore.similarity_search(message)
                    #print(relevant_docs)
                    context = ". ".join(list(map(lambda x: x.page_content, relevant_docs))) 
                print(context)
                async for chunk in chain.astream_events({'context':context, 'input': message}, version="v1", include_names=["Assistant"]):
                    if chunk["event"] in ["on_parser_start", "on_parser_stream"]:
                        await self.send(text_data=json.dumps(chunk))

                # response = chain.invoke(message)
                # print(response)
                # await self.send(text_data = json.dumps(response))
                
            except Exception as e:
                print(e)