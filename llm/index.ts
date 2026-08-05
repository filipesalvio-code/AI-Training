const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'qwen3-vl:2b',
    messages: [
      {
        role: 'user',
        content: 'Olá, tudo bem?',
      },
    ],
    stream: false,
  }),
});

if (!response.ok) {
  throw new Error(`Ollama respondeu com ${response.status}: ${await response.text()}`);
}

const output = await response.json() as {
  message: { content: string };
};
console.log(output.message.content);
