import OpenAI from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> {
  try {
    // Prepare messages for OpenAI API
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
    throw new Error("Failed to analyze the image");
  }
}

// Function for sentiment analysis
export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  explanation: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
    throw new Error("Failed to analyze sentiment");
  }
}

// Function to generate text embeddings for semantic search
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate text embedding");
  }
}

// Function to simulate other AI models (in a real app, these would be separate APIs)
export async function simulateModelResponse(
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  // In a production app, this would call different AI providers
  // For now, we'll use OpenAI for all models with a note about the simulation
  
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
  
  return generateChatCompletion(messages, systemPrompt);
}
