FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm rebuild esbuild

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
