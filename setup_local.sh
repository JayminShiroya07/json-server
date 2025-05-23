#!/bin/bash

echo "Setting up the NextJS Firebase Studio App locally..."
echo "--------------------------------------------------"

# 1. Navigate to your project directory if you haven't already
# cd /path/to/your/project

# 2. Install dependencies
echo "Installing dependencies using npm..."
npm install

echo ""
echo "Dependencies installed successfully."
echo "--------------------------------------------------"
echo ""
echo "To run the application, you will typically need to run the following commands in SEPARATE terminal windows:"
echo ""
echo "1. Start the Next.js development server:"
echo "   npm run dev"
echo "   (Usually accessible at http://localhost:9002)"
echo ""
echo "2. Start the Genkit development server (for AI features):"
echo "   npm run genkit:dev"
echo "   (Usually accessible at http://localhost:4000 for the Genkit developer UI)"
echo ""
echo "3. Start the WebSocket server (if your application uses it):"
echo "   npm run ws:dev"
echo "   (Usually runs on port 8080)"
echo ""
echo "--------------------------------------------------"
echo "Local setup script finished."
echo "Please open new terminal windows as needed to run the servers."
echo "You may need to make this script executable first using: chmod +x setup_local.sh"
