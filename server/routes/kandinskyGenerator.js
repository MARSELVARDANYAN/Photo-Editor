import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL_NAME = "stabilityai/stable-diffusion-xl-base-1.0";
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

export default async function generateImage(prompt) {
  try {
    console.log(`🟡 Generating image for: "${prompt}"`);
    
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    console.log('🟢 Image received');

    // Оптимизация изображения
    const optimizedImage = await sharp(response.data)
      .resize(1024, 1024)
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('❌ Generation error:', error);
    
    return {
      success: false,
      message: 'Failed to generate image. Please try a simpler prompt.'
    };
  }
}