import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const MODEL_NAME = "kandinsky-community/kandinsky-3";
const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;

export default async function generateKandinskyImage(prompt) {
  try {
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: "low quality, deformed, blurry, text, watermark, signature, cropped",
        num_inference_steps: 50, // Увеличено для лучшего качества
        guidance_scale: 7.5,
        height: 1024, // Kandinsky 3 поддерживает высокое разрешение
        width: 1024,
        prior_guidance_scale: 4.0, // Специфичный параметр для Kandinsky 3
        prior_num_inference_steps: 25
      },
      options: {
        wait_for_model: true, // Важно для больших моделей
        use_cache: true,
      }
    };

    console.log(`🟡 Sending request to Hugging Face for ${MODEL_NAME}...`);
    
    const response = await axios.post(HF_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        Accept: 'image/png',
      },
      responseType: 'arraybuffer',
      timeout: 180000, // 3 минуты - генерация может быть долгой
    });

    console.log('🟢 Received image from Hugging Face');

    // Оптимизация изображения
    const optimizedImage = await sharp(response.data)
      .jpeg({ quality: 90, progressive: true }) // Сохраняем оригинальный размер 1024x1024
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('❌ Kandinsky 3 generation error:', error);
    
    let errorMessage = 'Failed to generate image';
    let errorDetails = '';
    
    if (error.response) {
      const status = error.response.status;
      errorDetails = `Status: ${status}`;
      
      if (status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (status === 503) {
        errorMessage = 'Model is loading. Please wait and try again.';
        // Попробуем получить время ожидания
        try {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString());
          if (errorData.estimated_time) {
            errorMessage += ` Estimated wait time: ${Math.ceil(errorData.estimated_time)} seconds.`;
          }
        } catch (e) {}
      } else if (status === 400) {
        errorMessage = 'Invalid request. Please check your prompt.';
      } else if (status === 404) {
        errorMessage = 'Model not found. Please check the model name.';
      }
      
      // Попробуем извлечь детальную ошибку из ответа
      try {
        const errorData = JSON.parse(Buffer.from(error.response.data).toString());
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails += ` | ${JSON.stringify(errorData)}`;
      } catch (e) {
        errorDetails += ` | Response data: ${Buffer.from(error.response.data).toString('utf8').substring(0, 200)}`;
      }
    } else if (error.request) {
      errorDetails = 'No response received from server';
    } else {
      errorDetails = error.message;
    }
    
    console.error(`❌ Details: ${errorDetails}`);
    
    return {
      success: false,
      message: errorMessage
    };
  }
}