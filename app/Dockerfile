FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@9.1.8

# Bundle app source
COPY . .

EXPOSE 3000
CMD ng serve --host 0.0.0.0