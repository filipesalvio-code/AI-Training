const response = await fetch('https://openrouter.ai/api/v1/responses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'deepseek/deepseek-v4-flash',
    input: `Tem um erro no arquivo hello world. Pode corrigir?`,
  }),
});
const output = await response.json() as any;
console.log(JSON.stringify(output.output, undefined, 2));
