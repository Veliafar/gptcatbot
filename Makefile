build:
    docker build -t gptcatbot .

run:
    docker run -d -p 3000:3000 --name gptcatbot --rm gptcatbot
