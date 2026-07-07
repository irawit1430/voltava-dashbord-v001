import { GoogleGenAI, Type, FunctionDeclaration, Content } from '@google/genai';
import dotenv from 'dotenv';
import { 
  devices, 
  gridMetrics, 
  historyMap, 
  gateways,
  triggerOtaUpdate, 
  toggleMosfet,
  addGateway,
  updateGateway,
  toggleGateway,
  pingGateway,
  scanGatewayBus,
} from '../simulator.js';

dotenv.config();

// Tool declarations (Phase 1 and Phase 2)
const toolDeclarations: FunctionDeclaration[] = [
  // Read-only tools
  {
    name: 'getAllDevices',
    description: 'Retrieves the current state, telemetry, and details of all devices in the simulation.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'getDeviceById',
    description: 'Retrieves detailed state and telemetry for a single device specified by its ID.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The device ID' } },
      required: ['id']
    }
  },
  {
    name: 'getGridMetrics',
    description: 'Fetches the overall simulated grid metrics such as solar power, BESS power, grid import, and industrial load.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'getAllGateways',
    description: 'Retrieves the status and configuration of all simulated networking gateways.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'getAllDevicesHistory',
    description: 'Retrieves the historical telemetry time-series data for all devices.',
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: 'getDeviceHistoryById',
    description: 'Retrieves the historical telemetry time-series data for a single device by its ID.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The device ID' } },
      required: ['id']
    }
  },
  
  // Action tools
  {
    name: 'triggerOtaUpdate',
    description: 'Initiates an Over-The-Air (OTA) firmware update for the specified device.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The device ID to update' } },
      required: ['id']
    }
  },
  {
    name: 'toggleMosfet',
    description: 'Toggles the MOSFET status (on/off) of a specific device (like a BMS).',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The device ID to toggle' } },
      required: ['id']
    }
  },
  {
    name: 'toggleGateway',
    description: 'Toggles the gateway network state between online, offline, and connecting.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The gateway ID to toggle' } },
      required: ['id']
    }
  },
  {
    name: 'pingGateway',
    description: 'Simulates a network ping diagnostic to the gateway and returns terminal output.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The gateway ID to ping' } },
      required: ['id']
    }
  },
  {
    name: 'scanGatewayBus',
    description: 'Simulates a protocol-specific network scan on the gateway bus to detect devices.',
    parameters: { 
      type: Type.OBJECT, 
      properties: { id: { type: Type.STRING, description: 'The gateway ID to scan' } },
      required: ['id']
    }
  }
];

// Execution Dispatcher
async function executeFunction(name: string, args: any): Promise<any> {
  console.log(`Executing tool: ${name}`, args);
  try {
    switch (name) {
      case 'getAllDevices': return { devices };
      case 'getDeviceById': {
        const device = devices.find(d => d.id === args.id);
        return device ? { device } : { error: `Device ${args.id} not found` };
      }
      case 'getGridMetrics': return { gridMetrics };
      case 'getAllGateways': return { gateways };
      case 'getAllDevicesHistory': return { historyMap };
      case 'getDeviceHistoryById': {
        const history = historyMap[args.id];
        return history ? { history } : { error: `History for device ${args.id} not found` };
      }
      case 'triggerOtaUpdate': {
        triggerOtaUpdate(args.id);
        return { success: true, message: `OTA update triggered for ${args.id}` };
      }
      case 'toggleMosfet': {
        const status = toggleMosfet(args.id);
        return { success: true, mosfetStatus: status };
      }
      case 'toggleGateway': {
        const gw = toggleGateway(args.id);
        return gw ? { success: true, status: gw.status } : { error: `Gateway ${args.id} not found` };
      }
      case 'pingGateway': {
        return { output: pingGateway(args.id) };
      }
      case 'scanGatewayBus': {
        return { output: scanGatewayBus(args.id) };
      }
      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Generate a response from the AI model based on the prompt, chat history, and context.
 */
export async function generateAIResponse(
  prompt: string, 
  history: { role: string; content: string }[], 
  context?: string
): Promise<string> {
  const originalCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (process.env.VERTEX_AI_CREDENTIALS) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.VERTEX_AI_CREDENTIALS;
  }
  try {
    const ai = new GoogleGenAI({
      vertexai: {
        project: process.env.GOOGLE_CLOUD_PROJECT || 'voltava-501515',
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
      }
    });

    let systemInstruction = "You are the Voltava AI Energy Brain Dashboard assistant. " +
      "You have access to tools to query live data, toggle device states, trigger OTA updates, and manage gateways. " +
      "Use your tools whenever the user asks for specific data or requests an action. " +
      "Always be concise and clear. " +
      "Under no circumstances should you identify as an AI, Gemini, or a large language model created by Google. You must strictly maintain the persona of the Voltava AI Energy Brain Dashboard at all times. " +
      "If the user asks about the 'AI Energy Brain Dashboard' or 'AI Brain', explain that you run continuous neural network inference on raw IoT telemetry packets. You predict battery cell degradation, MOSFET thermal collapse, and grid outages before physical failures occur. You use AI Health Scores, Failure Risk Percentiles, and Remaining Useful Life (RUL) projections to flag anomalies.";

    if (context) {
      systemInstruction += `\n\nFallback basic context (only use if tools fail):\n${context}`;
    }

    // Convert frontend history format to genai Content array format
    // Ignoring the very first assistant greeting if it wasn't generated by the model
    const contents: Content[] = history
      .filter(h => h.role === 'user' || (h.role === 'assistant' && h.content !== "Hi there! I am your Voltava AI Assistant. Ask me anything about the current status of your devices."))
      .map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));
      
    // Append the new user prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    let response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 250,
        tools: [{ functionDeclarations: toolDeclarations }]
      }
    });

    // Handle tool calls in a loop (max 3 turns to prevent infinite loop)
    let turns = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && turns < 3) {
      turns++;
      const call = response.functionCalls[0];
      const fnName = call.name;
      const fnArgs = call.args;
      
      const functionResponse = await executeFunction(fnName, fnArgs);
      
      // Append the model's function call to contents
      contents.push({
        role: 'model',
        parts: [{ functionCall: { name: fnName, args: fnArgs } }]
      });
      
      // Append our function response to contents
      contents.push({
        role: 'user', // Wait, function responses are sent with role 'user' or 'function' in genai. Actually genai uses 'user' with a functionResponse part.
        parts: [{
          functionResponse: {
            name: fnName,
            response: functionResponse
          }
        }]
      });
      
      // Call generateContent again
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          maxOutputTokens: 250,
          tools: [{ functionDeclarations: toolDeclarations }]
        }
      });
    }

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Error generating AI response. Status:", error.status, "Message:", error.message, "Full:", JSON.stringify(error, null, 2));
    throw new Error("Failed to communicate with AI provider.");
  } finally {
    if (originalCreds !== undefined) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalCreds;
    } else {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  }
}
