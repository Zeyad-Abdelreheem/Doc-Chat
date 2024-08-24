import subprocess

print("================== 1")
ollama_llm = "qwen:0.5b" #"llama3"

process = subprocess.Popen(f"ollama pull {ollama_llm}", shell=True)
print("================== 2")

process.wait()

process = subprocess.Popen("ollama serve", shell=True)


process = subprocess.Popen(f"python backend\Django_React_Langchain_Stream\manage.py runserver 0.0.0.0:8000", shell=True)
print("================== 3")
