const env = require('../config/env');
const axios = require('axios');

class AIService {
  static async generateWorkflowGraph(prompt) {
    if (env.OPENROUTER_API_KEY) {
      return this.callOpenRouter(prompt);
    } else if (env.GEMINI_API_KEY) {
      return this.callGemini(prompt);
    } else {
      return this.deterministicFallback(prompt);
    }
  }

  static async callOpenRouter(prompt) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI workflow architect for Agentflow_AI.
Convert the user prompt into a valid React Flow graph JSON with named nodes, positions, and edges.
Allowed node types: 'trigger', 'ai', 'gmail', 'slack', 'discord', 'google-sheets'.
Format MUST be strictly:
{
  "nodes": [
    { "id": "1", "type": "default", "position": { "x": 250, "y": 50 }, "data": { "label": "Webhook Trigger", "type": "trigger" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true }
  ]
}
Output ONLY valid JSON, no markdown codeblocks.`
            },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      let content = response.data.choices[0].message.content;
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenRouter generation failed, falling back to deterministic:', error.message);
      return this.deterministicFallback(prompt);
    }
  }

  static async callGemini(prompt) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const systemInstruction = "Convert the automation prompt into a JSON React Flow graph. Allowed node data.type: trigger, ai, gmail, slack, discord, google-sheets. Return strictly JSON with nodes and edges arrays.";
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\nPrompt: ${prompt}` }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        },
        { timeout: 15000 }
      );

      const candidate = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidate) {
        return JSON.parse(candidate);
      }
      return this.deterministicFallback(prompt);
    } catch (error) {
      console.warn('Gemini API call failed, using deterministic fallback:', error.message);
      return this.deterministicFallback(prompt);
    }
  }

  static deterministicFallback(prompt) {
    const text = prompt.toLowerCase();
    const nodes = [
      { id: '1', type: 'default', position: { x: 250, y: 50 }, data: { label: 'Webhook Trigger', type: 'trigger' } }
    ];
    const edges = [];

    let yOffset = 160;
    let currentId = 2;

    const addStep = (type, label, extraData = {}) => {
      const prevId = (currentId - 1).toString();
      const newId = currentId.toString();
      nodes.push({
        id: newId,
        type: 'default',
        position: { x: 250, y: yOffset },
        data: { label, type, ...extraData }
      });
      edges.push({
        id: `e${prevId}-${newId}`,
        source: prevId,
        target: newId,
        animated: true
      });
      yOffset += 110;
      currentId++;
    };

    if (text.includes('ai') || text.includes('summarize') || text.includes('analyze') || text.includes('classify')) {
      addStep('ai', 'AI Summary Agent', { prompt: 'Analyze and summarize incoming payload' });
    }

    if (text.includes('email') || text.includes('gmail') || text.includes('mail')) {
      addStep('gmail', 'Send Email Notification', { action: 'send_email', subject: 'Automated Alert' });
    }

    if (text.includes('slack')) {
      addStep('slack', 'Post Slack Message', { action: 'post_message', channel: 'general' });
    }

    if (text.includes('discord')) {
      addStep('discord', 'Send Discord Alert', { action: 'send_message', channelId: 'alerts' });
    }

    if (text.includes('sheet') || text.includes('excel') || text.includes('table') || text.includes('row')) {
      addStep('google-sheets', 'Append to Google Sheet', { action: 'append_row' });
    }

    // Default step if nothing matched
    if (nodes.length === 1) {
      addStep('ai', 'AI Reasoning Engine', { prompt: 'Process inputs and formulate response' });
      addStep('slack', 'Notify Slack Channel', { action: 'post_message' });
    }

    return { nodes, edges };
  }
}

module.exports = AIService;
