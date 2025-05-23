#!/bin/bash

echo "Setting up the NextJS Firebase Studio App locally..."
echo "--------------------------------------------------"

# 1. Navigate to your project directory if you haven't already
# cd /path/to/your/project

# 2. Install dependencies
echo "Installing dependencies using npm..."
npm install
echo ""
echo "This will also install 'concurrently' if not already present, a tool to run multiple commands at once."
echo ""
echo "Dependencies installed successfully."
echo "--------------------------------------------------"
echo ""
echo "To run the application, you can use the new 'start:all' script which runs all necessary services concurrently in a single terminal:"
echo ""
echo "   npm run start:all"
echo ""
echo "This command will start:"
echo "   - Next.js development server (usually on http://localhost:9002)"
echo "   - Genkit development server (Genkit UI usually on http://localhost:4000)"
echo "   - WebSocket server (usually on port 8080)"
echo ""
echo "Alternatively, if you need to run services individually (e.g., for separate logging or debugging), you can run the following commands in SEPARATE terminal windows:"
echo ""
echo "1. Start the Next.js development server:"
echo "   npm run dev"
echo ""
echo "2. Start the Genkit development server (for AI features):"
echo "   npm run genkit:dev"
echo ""
echo "3. Start the WebSocket server (if your application uses it):"
echo "   npm run ws:dev"
echo ""
echo "--------------------------------------------------"
echo "Local setup script finished."
echo "You may need to make this script executable first using: chmod +x setup_local.sh"
