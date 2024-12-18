FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --omit=dev

RUN npm rebuild esbuild

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
