# --- Stage 1: Get the base Node.js image ---
# We use "alpine" as it's a very small and secure Linux OS
FROM node:18-alpine

# --- Stage 2: Set up the application directory ---
# This is where our app will live inside the container
WORKDIR /app

# --- Stage 3: Install dependencies ---
# Copy package.json and package-lock.json first
# This is a key optimization: Docker caches this layer.
# If we don't change our dependencies, it won't re-run 'npm install' every time.
COPY package*.json ./
RUN npm install

# --- Stage 4: Copy application code ---
# Copy the rest of our backend code (server.js, routes, etc.)
COPY . .

# --- Stage 5: Expose the port ---
# Tell Docker that our app will be listening on port 3000
# (We get this from your server.js file's "PORT" variable)
EXPOSE 3000

# --- Stage 6: Define the run command ---
# This is the command that starts our application
CMD [ "node", "server.js" ]