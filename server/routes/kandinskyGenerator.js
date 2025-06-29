import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import sharp from 'sharp';

// В начале файла kandinskyGenerator.js
await hf.textToImage({
  model: MODEL_NAME,
  inputs: "",
  parameters: { num_inference_steps: 1 }
});
console.log("Model warmed up");

dotenv.config();

const hf = new HfInference(process.env.HF_API_KEY);
const MODEL_NAME = "kandinsky-community/kandinsky-2-2-decoder";

export default async function generateKandinskyImage(prompt) {
  try {
    // Генерация изображения
    const response = await hf.textToImage({
      model: MODEL_NAME,
      inputs: prompt,
      parameters: {
        negative_prompt: "low quality, deformed, blurry, text, watermark",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        height: 768,
        width: 768
      }
    });

    // Оптимизация изображения
    const optimizedImage = await sharp(await response.arrayBuffer())
      .resize(1024, 1024, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('Kandinsky generation error:', error);

    let errorMessage = 'Failed to generate image';
    
    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (status === 503) {
        errorMessage = 'Model is loading. Please try again in 30 seconds.';
      } else if (status === 400) {
        errorMessage = 'Invalid request. Please check your prompt.';
      }
    }
    return {
      success: false,
      message: error.message || 'Failed to generate image'
    };
  }
}