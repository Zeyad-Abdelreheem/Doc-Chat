import subprocess


# process = subprocess.Popen("curl -fsSL https://ollama.com/install.sh | sh", shell=True)

process = subprocess.Popen("ollama serve", shell=True)


# process = subprocess.Popen("npm run start", shell=True)


process = subprocess.Popen("python ./Django_React_Langchain_Stream/manage.py runserver", shell=True)

while True:
    continue