#!/bin/bash

# Navigate to the backend directory
cd "$(dirname "$0")/.."

# Set the Python path
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Export Flask environment variables
export FLASK_APP=app.wsgi:app
export FLASK_ENV=development

# Start the Flask server in the background
echo "Starting Flask server..."
flask run --port=5000 &
SERVER_PID=$!

# Give it a moment to start up
echo "Waiting for server to start..."
sleep 5

# Run the tests
echo "Running API tests..."
python scripts/test_api.py

# Kill the Flask server
echo "Shutting down Flask server..."
kill $SERVER_PID

echo "Done!" 