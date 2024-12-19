FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre-headless && \
    npm install && \
    npm rebuild esbuild && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

RUN npm install
RUN npm rebuild esbuild

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
