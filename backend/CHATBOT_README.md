# Business Finance Chatbot for Co-Founder Matching

This chatbot provides guidance on business finance and planning for aspiring co-founders. It uses the Mistral-7B-Instruct model via HuggingFace's API to generate responses.

## Setup Instructions

1. **Create a HuggingFace account and get an API token**
   - Sign up at [HuggingFace](https://huggingface.co/)
   - Go to Settings > Access Tokens
   - Create a new token with "read" access
   - Copy the token

2. **Configure the environment**
   - Create a `.env` file in the backend directory
   - Add your HuggingFace API token: `HF_API_TOKEN=your_token_here`
   - Make sure other required environment variables are set (SUPABASE_URL, SUPABASE_KEY, etc.)

3. **Install dependencies**
   - Run `pip install -r requirements.txt` to install all required packages

4. **Run the server**
   - Start the Flask server: `python -m flask run --debug --port=8000`
   - The server will run on http://localhost:8000

## Testing the Chatbot

### Using the test script

Run the test script to interact with the chatbot API:
```
python test_public_chatbot.py
```

You can also specify a custom port:
```
python test_public_chatbot.py 8001
```

### Using the API endpoint

The chatbot has two endpoints:

1. **Authenticated endpoint**: `/api/v1/chatbot`
   - Requires a valid JWT token
   - Request: `{ "message": "How do I create a business plan?" }`
   - Response: `{ "success": true, "message": "Here's how to create a business plan..." }`

2. **Public endpoint**: `/api/v1/public/chatbot`
   - No authentication required
   - Request: `{ "message": "What funding options are available for startups?" }`
   - Response: `{ "success": true, "message": "Here are the funding options..." }`

## Chatbot Features

The business finance chatbot can help with:

- Business model development
- Startup funding options and strategies
- Financial planning and forecasting
- Pitch deck creation
- Investor relations
- UQ Ventures resources and opportunities
- Business partnership dynamics

## Mobile-Optimized Responses

The chatbot is specifically designed for mobile interfaces with:

- Concise responses (typically under 100 words)
- Bullet points for easy scanning
- Focus on 2-3 key actionable points per response
- Simple language with minimal jargon
- Mobile-friendly formatting
- Direct, practical advice that can be implemented immediately

This optimization ensures a good user experience on smaller screens and accommodates the typical mobile user's preference for quick, actionable information.

## Frontend Integration

### React Native Integration

To integrate the chatbot with a React Native frontend:

```javascript
// ChatbotScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { id: Date.now(), text: inputText, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setLoading(true);
    
    try {
      // Call the chatbot API
      const response = await fetch('http://your-api-url/api/v1/public/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Add bot response to chat
        const botMessage = { id: Date.now() + 1, text: data.message, isUser: false };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        // Handle error
        const errorMessage = { id: Date.now() + 1, text: 'Sorry, I encountered an error. Please try again.', isUser: false };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      const errorMessage = { id: Date.now() + 1, text: 'Network error. Please check your connection.', isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        style={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about business, funding, pitching..."
          disabled={loading}
        />
        <Button title="Send" onPress={sendMessage} disabled={loading || inputText.trim() === ''} />
      </View>
      {loading && <Text style={styles.loadingText}>Business advisor is thinking...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageList: {
    flex: 1,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 5,
  },
});

export default ChatbotScreen;
```

### Web Frontend Integration

For web applications, you can use a similar approach with fetch API:

```javascript
// chatbot.js
async function sendMessageToChatbot(message) {
  try {
    const response = await fetch('http://your-api-url/api/v1/public/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error calling chatbot API:', error);
    throw error;
  }
}

// Usage
sendMessageToChatbot('How do I create a business plan?')
  .then(data => {
    if (data.success) {
      console.log('Chatbot response:', data.message);
      // Update UI with the response
    } else {
      console.error('Chatbot error:', data.error);
    }
  })
  .catch(error => {
    console.error('Failed to get chatbot response:', error);
  });
```

## Troubleshooting

- **Model loading**: The first request might take longer as the model needs to be loaded. If you get a "model is loading" message, wait a moment and try again.
- **API token**: Make sure your HuggingFace API token is valid and has the correct permissions.
- **Fallback responses**: If the API fails for any reason, the chatbot will use pre-defined fallback responses based on keywords in the user's message.
- **CORS issues**: If you encounter CORS issues when calling the API from a frontend, make sure the backend has proper CORS headers set. The API already has CORS configured for all origins.

## Implementation Details

The chatbot uses the Mistral-7B-Instruct model, which is a powerful yet cost-effective language model. It's configured with a system prompt that specializes it for business advice, particularly for aspiring co-founders.

The implementation includes error handling and fallback responses to ensure a good user experience even if there are issues with the API. 