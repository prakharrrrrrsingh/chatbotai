import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Using OpenRouter for access to multiple AI models
const openai = new OpenAI({ 
  apiKey: process.env.OPENROUTER_API_KEY || "",  // Using OpenRouter API key
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://replit.com/",
    "X-Title": "AI Chatbot"
  },
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
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
      console.warn("OpenRouter API key is missing. Please provide a valid API key.");
      return "I'm having trouble connecting to my AI service. Please check that you've provided a valid OpenRouter API key.";
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

    // Map our simplified model names to OpenRouter model identifiers
    const modelMapping: Record<string, string> = {
      "gpt": "openai/gpt-4o",
      "claude": "anthropic/claude-3-opus",
      "llama": "meta-llama/llama-3-70b-instruct",
      "gemini": "google/gemini-pro",
    };

    const openRouterModel = modelMapping[modelName] || "openai/gpt-4o";

    const response = await openai.chat.completions.create({
      model: openRouterModel,
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
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
      console.warn("OpenRouter API key is missing. Please provide a valid API key.");
      return "I'm having trouble connecting to my image analysis service. Please check that you've provided a valid OpenRouter API key.";
    }
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o", // OpenRouter format for GPT-4o, which has vision capabilities
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I couldn't analyze this image.";
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
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
      console.warn("OpenRouter API key is missing. Please provide a valid API key.");
      return {
        sentiment: "neutral",
        score: 0,
        explanation: "Unable to analyze sentiment due to missing API key. Please provide a valid OpenRouter API key."
      };
    }
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o", // OpenRouter format
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from -1 (very negative) to 1 (very positive), with 0 being neutral. Also provide a brief explanation of your rating. Respond with JSON in this format: { \"sentiment\": \"positive\"|\"negative\"|\"neutral\", \"score\": number, \"explanation\": string }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sentiment: result.sentiment || "neutral",
      score: result.score || 0,
      explanation: result.explanation || "No explanation provided"
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      score: 0,
      explanation: "An error occurred while analyzing sentiment. Please check your OpenAI API key."
    };
  }
}

// Function to generate text embeddings for semantic search
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
      console.warn("OpenRouter API key is missing. Please provide a valid API key.");
      return new Array(1536).fill(0); // Return a zero vector of typical embedding size
    }
    
    const response = await openai.embeddings.create({
      model: "openai/text-embedding-3-small", // OpenRouter format
      input: text,
      encoding_format: "float"
    });

    return response.data[0].embedding;
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
  // Check if API key is missing, and provide a helpful response
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.trim() === "") {
    console.warn("OpenRouter API key is missing. Please provide a valid API key.");
    return "I need a valid OpenRouter API key to work properly. Please provide one in the environment variables.";
  }
  
  // Create appropriate system prompts for different model personas
  let systemPrompt = "";
  
  switch (model) {
    case "claude":
      systemPrompt = "You are Claude 3 Opus, an AI assistant created by Anthropic. Please respond in a helpful, harmless, and honest manner.";
      break;
    case "llama":
      systemPrompt = "You are Llama 3, an AI assistant created by Meta. Please respond in a concise, straightforward style with occasional emojis.";
      break;
    case "gemini":
      systemPrompt = "You are Gemini Pro, an AI assistant created by Google. Please respond with clear, well-structured information and occasional use of bullet points.";
      break;
    default:
      systemPrompt = "You are an AI assistant powered by GPT-4o. Please provide helpful, accurate, and ethical responses.";
  }
  
  try {
    // Pass the model name to use the appropriate OpenRouter model
    return await generateChatCompletion(messages, systemPrompt, model);
  } catch (error) {
    console.error("Error in simulateModelResponse:", error);
    return "I encountered an error processing your request. Please check your OpenRouter API key and try again.";
  }
}
