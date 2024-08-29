FROM node:18.20.4-alpine3.20

WORKDIR /app

# # Copy package.json and package-lock.json (or yarn.lock)
# COPY package*.json ./

# Install dependencies
# RUN npm install --production

# Copy the build output into the container

COPY build/ /app/build
COPY .env /app/.env

# Expose the port the app runs on
# EXPOSE 3000

# Run the application
CMD ["node", "-r", "dotenv/config", "build"]

# docker build -t reg.thrive.pascohh.com/league_front:latest .
# docker push reg.thrive.pascohh.com/league_front:latest
