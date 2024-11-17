// utils/mappingGenerator.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMappingCode(
  fromResponseFormat: any,
  toRequestFormat: any,
  fromAppName: string,
  toAppName: string
): Promise<string> {
  const prompt = `
You are an expert JavaScript developer.

Your task is to write a JavaScript function that maps a response object from the "${fromAppName}" app to a request object for the "${toAppName}" app.

The response object has the following structure:

${JSON.stringify(fromResponseFormat, null, 2)}

The request object should have the following structure:

${JSON.stringify(toRequestFormat, null, 2)}

Please write a JavaScript function named "mapResponseToRequest" that takes the response object as input and returns the correctly formatted request object.

Ensure that all necessary data is correctly mapped, and provide default values or transformations where necessary.

The function should be self-contained and ready to use.

Provide only the code for the function, without any additional explanations.
`;

  try {
    const completion = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      max_tokens: 500,
      temperature: 0,
    });

    const mappingCode = completion.choices[0]?.message?.content?.trim();
    if (!mappingCode) {
      throw new Error(`Failed to generate mapping code. ${completion.choices[0]?.message?.content}`); 
    }

    return mappingCode;
  } catch (error) {
    console.error('Error generating mapping code:', error);
    throw error;
  }
}
