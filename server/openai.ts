import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Using direct OpenAI API connection
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""  // Using OpenAI API key directly
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string,
  modelName: string = "gpt-4o"
): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      console.warn("OpenAI API key is missing. Please provide a valid API key.");
      return "I'm having trouble connecting to my AI service. Please check that you've provided a valid OpenAI API key.";
    }
    
    // Prepare messages for API
    let apiMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add system message if provided
    if (systemPrompt) {
      apiMessages = [
        { role: "system", content: systemPrompt },
        ...apiMessages
      ];
    }

    // Use the appropriate OpenAI model based on selection
    // Note: We can only use OpenAI models now
    const modelMapping: Record<string, string> = {
      "gpt": "gpt-4o", // Using native GPT-4o
      "claude": "gpt-4o", // Fallback to GPT-4o since we can't use Claude directly
      "llama": "gpt-4o", // Fallback to GPT-4o
      "gemini": "gpt-4o", // Fallback to GPT-4o
    };

    const openAIModel = modelMapping[modelName] || "gpt-4o";

    const response = await openai.chat.completions.create({
      model: openAIModel,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate response from AI model");
  }
}

// Function for analyzing images with vision capabilities
export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  try {
    // For demonstration/testing without API key
    console.log("Using simulated image analysis response");
    
    // Extract file extension to personalize the response based on image type
    // This is just to make the simulated response more interesting
    const isJpeg = base64Image.substring(0, 20).includes("JFIF") || prompt.toLowerCase().includes("jpeg") || prompt.toLowerCase().includes("jpg");
    const isPng = base64Image.substring(0, 20).includes("PNG") || prompt.toLowerCase().includes("png");
    const isScreenshot = prompt.toLowerCase().includes("screenshot") || prompt.toLowerCase().includes("screen");
    
    if (prompt.toLowerCase().includes("cat") || prompt.toLowerCase().includes("kitten")) {
      return "I can see a cat in this image! It appears to be a domestic cat, likely a house pet. The cat has a typical feline appearance with pointed ears, whiskers, and a distinctive cat face. Without color information in this demo mode, I can't tell you the exact coloration, but cats commonly come in tabbies, solid colors, calicos, or tuxedo patterns.";
    } else if (prompt.toLowerCase().includes("dog") || prompt.toLowerCase().includes("puppy")) {
      return "This image shows a dog! It appears to be a domestic dog, likely a pet. The dog has the characteristic canine features including a snout, floppy or pointed ears, and a friendly expression. In a full implementation with API access, I could tell you the specific breed and more details about the animal.";
    } else if (prompt.toLowerCase().includes("text") || prompt.toLowerCase().includes("read")) {
      return "This image appears to contain text. In demo mode, I can't read the specific text content, but I can see that it's formatted as writing. With a full API implementation, I would be able to extract and process the text content for you.";
    } else if (isScreenshot) {
      return "This appears to be a screenshot of a digital interface. I can see what looks like a user interface with various elements such as buttons, text fields, and possibly navigation components. In a fully functional system, I could provide more details about the specific application or website shown.";
    } else if (isJpeg) {
      return "I've received your JPEG image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis of its contents. With a proper API connection, I could describe the scene, identify objects, people, or text within the image.";
    } else if (isPng) {
      return "I've received your PNG image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis of its contents. PNG images are often used for graphics with transparency or screenshots, and with a proper API connection, I could analyze the specific content.";
    } else {
      return "I've received your image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis without API access. In a full implementation, I would use computer vision to describe the contents, identify objects, read text, and answer specific questions about what's shown in the image.";
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "I encountered an error while analyzing this image. Please make sure your OpenAI API key has access to GPT-4o Vision capabilities.";
  }
}

// Function for sentiment analysis
export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  explanation: string;
}> {
  try {
    // Using simulated sentiment analysis
    console.log("Using simulated sentiment analysis response");
    
    // Simple word-based sentiment analysis for demo purposes
    const positiveWords = ["good", "great", "excellent", "happy", "love", "wonderful", "amazing", "fantastic", "awesome", "best", "like", "thanks", "thank you", "nice", "helpful", "beautiful", "perfect"];
    const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor", "horrible", "worst", "angry", "disappointed", "useless", "stupid", "annoying", "broken", "fail", "failed", "waste"];
    
    const lowerText = text.toLowerCase();
    
    // Count positive and negative word matches
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    // Determine sentiment
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    let score = 0;
    let explanation = "";
    
    if (positiveScore > negativeScore) {
      sentiment = "positive";
      score = Math.min(positiveScore * 0.2, 1);
      explanation = `The text contains positive language, including ${positiveScore} positive indicators.`;
    } else if (negativeScore > positiveScore) {
      sentiment = "negative";
      score = -Math.min(negativeScore * 0.2, 1);
      explanation = `The text contains negative language, including ${negativeScore} negative indicators.`;
    } else {
      sentiment = "neutral";
      explanation = "The text appears to be neutral or balanced between positive and negative sentiment.";
    }
    
    return {
      sentiment,
      score,
      explanation
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      score: 0,
      explanation: "An error occurred during sentiment analysis in demo mode."
    };
  }
}

// Function to generate text embeddings for semantic search
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // In demo mode, return a simulated embedding instead of calling the API
    console.log("Using simulated embedding response");
    
    // Create a deterministic but unique embedding based on text content
    // This is just for demo purposes - not a real embedding algorithm
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockEmbedding = new Array(1536).fill(0).map((_, i) => 
      Math.sin(seed * (i + 1) / 1536) / 2 + 0.5
    );
    
    return mockEmbedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(1536).fill(0); // Return a zero vector on error
  }
}

// Function to simulate other AI models (in a real app, these would be separate APIs)
export async function simulateModelResponse(
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  // Get the last user message
  const lastUserMessage = messages
    .filter(msg => msg.role === "user")
    .pop()?.content || "";
  
  // Simulate responses based on different model personas
  try {
    // For demonstration/testing without API key
    console.log("Using simulated response for testing (no API key required)");
    
    // Create different simulated responses for each model type
    switch (model) {
      case "claude":
        return generateClaudeResponse(lastUserMessage);
      case "llama":
        return generateLlamaResponse(lastUserMessage);
      case "gemini":
        return generateGeminiResponse(lastUserMessage);
      default:
        return generateGPTResponse(lastUserMessage);
    }
  } catch (error) {
    console.error("Error in simulateModelResponse:", error);
    return "I'm currently in demo mode with simulated responses since there's an issue with the API key.";
  }
}

// Simulated response generators for testing without API keys
function generateGPTResponse(message: string): string {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello! I'm your GPT assistant. How can I help you today?";
  } else if (message.toLowerCase().includes("weather")) {
    return "I can't check the actual weather without an API, but I can tell you that weather forecasts typically include temperature, precipitation chances, and wind conditions. Would you like to know more about meteorology?";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm a GPT-powered AI assistant, designed to be helpful, harmless, and honest.";
  } else {
    return "As a GPT assistant, I'd normally process your request with the OpenAI API, but I'm currently in demo mode. In a fully functional setup, I could help with information, creative writing, problem-solving, and more.";
  }
}

function generateClaudeResponse(message: string): string {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello there. I'm Claude. How may I assist you today?";
  } else if (message.toLowerCase().includes("weather")) {
    return "While I can't access current weather data in this demo mode, I'd be happy to discuss climate patterns or help you understand meteorological concepts. What specific aspect of weather interests you?";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm Claude, an AI assistant created by Anthropic. I aim to be helpful, harmless, and honest in all my interactions.";
  } else {
    return "I'm Claude, currently running in a demonstration mode. In a fully functional environment, I could help answer your questions thoughtfully and provide nuanced perspectives on complex topics.";
  }
}

function generateLlamaResponse(message: string): string {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hey there! 👋 I'm Llama, ready to chat! What's up?";
  } else if (message.toLowerCase().includes("weather")) {
    return "Can't check the real weather right now (demo mode) 🌦️ But I'd love to talk about something else! Any other topics on your mind? 💭";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm Llama! 🦙 Your friendly neighborhood AI assistant from Meta. Nice to meet you! 😊";
  } else {
    return "Just FYI, I'm in demo mode right now 🧪 so I'm giving you simulated responses. In real mode, I'd be way more helpful! Anything specific you want to chat about? 💬";
  }
}

function generateGeminiResponse(message: string): string {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello, I'm Gemini. How can I assist you today?\n\nI can help with:\n• Information and research\n• Creative tasks\n• Problem-solving";
  } else if (message.toLowerCase().includes("weather")) {
    return "I'm currently in demo mode without access to real-time weather data. However, I can explain:\n\n• How weather forecasting works\n• Climate patterns\n• Weather phenomena";
  } else if (message.toLowerCase().includes("name")) {
    return "I am Gemini, an AI assistant developed by Google. I'm designed to be:\n\n• Helpful - providing clear and useful information\n• Structured - organizing information logically\n• Comprehensive - covering topics thoroughly";
  } else {
    return "I'm currently running in demo mode with pre-programmed responses. In a full implementation, I could provide more detailed assistance with:\n\n• Research questions\n• Data analysis\n• Learning resources\n• Creative projects";
  }
}
