FROM node:22 AS server

COPY server /app

WORKDIR /app

RUN npm install
RUN npm run build

COPY . .

CMD ["npm", "run", "dev"]

FROM node:22 AS client

COPY client /app

WORKDIR /app

RUN npm install
RUN npm run build

COPY . .

CMD ["npm", "run", "dev"]
