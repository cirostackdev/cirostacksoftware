import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('[anthropic] ANTHROPIC_API_KEY not set');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export async function chat(
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system,
    messages,
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function grade(prompt: string): Promise<string> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
