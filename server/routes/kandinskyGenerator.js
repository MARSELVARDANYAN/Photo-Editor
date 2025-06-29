import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

// Конфигурация для нового токена
const HF_API_KEY = process.env.HF_API_KEY || "ваш_новый_бесплатный_токен";
const MODEL_NAME = "kandinsky-community/kandinsky-3";
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

// Глобальный флаг для отслеживания прогрева модели
let isModelWarmedUp = false;

export default async function generateKandinskyImage(prompt) {
  try {
    // 🔥 Прогрев модели с кешированием
    if (!modelWarmupCache.has('warmedUp')) {
      console.log('⏳ Warming up model...');
      try {
        await axios.post(HF_API_URL, {
          inputs: "warmup",
          parameters: { 
            num_inference_steps: 1,
            height: 64,
            width: 64 
          },
          options: { wait_for_model: true }
        }, {
          headers: { Authorization: `Bearer ${HF_API_KEY}` },
          timeout: 30000
        });
        console.log('✅ Model is awake');
        modelWarmupCache.set('warmedUp', true);
      } catch (warmupError) {
        console.warn('⚠️ Model warmup failed:', warmupError.message);
      }
    }

    // Параметры генерации
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: "low quality, deformed, blurry, text, watermark",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        height: 1024,
        width: 1024
      },
      options: {
        wait_for_model: true
      }
    };

    console.log(`🟡 Generating image for: "${prompt}"`);
    
    const response = await axios.post(HF_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        Accept: 'image/png',
      },
      responseType: 'arraybuffer',
      timeout: 120000, // 120 секунд
    });

    console.log('🟢 Image received');

    // Оптимизация изображения
    const optimizedImage = await sharp(response.data)
      .jpeg({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('❌ Generation error:', error);
    
    let errorMessage = 'Failed to generate image';
    
    // Обработка специфичных ошибок Hugging Face
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        errorMessage = 'Invalid API token. Please check your HF_API_KEY.';
      } else if (status === 429) {
        errorMessage = 'Free quota exceeded. Try again later or use a different account.';
      } else if (status === 503) {
        errorMessage = 'Model is loading. Please try again in 20 seconds.';
      }
      
      // Попробуем извлечь детальное сообщение об ошибке
      try {
        const errorData = JSON.parse(Buffer.from(error.response.data).toString());
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {}
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
}