import axios from 'axios';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

// Конфигурация API
const HF_API_KEY = process.env.HF_API_KEY || "ваш_новый_бесплатный_токен";
const SBER_API_KEY = process.env.SBER_API_KEY || "sk_8c2d7b0c5f9e4a3b8d6c1a9b7e5f3d2a"; // Тестовый ключ

// Кеш для статуса прогрева модели
const modelStatus = {
  isWarmedUp: false,
  lastWarmedUp: 0,
};

export default async function generateKandinskyImage(prompt) {
  // Сначала попробуем Hugging Face API
  const hfResult = await tryHuggingFaceGeneration(prompt);
  if (hfResult.success) return hfResult;
  
  // Если не получилось, пробуем SberCloud API
  console.log('🔄 Falling back to SberCloud API');
  return trySberCloudGeneration(prompt);
}

async function tryHuggingFaceGeneration(prompt) {
  try {
    const MODEL_NAME = "kandinsky-community/kandinsky-3";
    const HF_API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}`;
    
    // 🔥 Прогреваем модель если прошло больше 5 минут с последнего прогрева
    if (!modelStatus.isWarmedUp || Date.now() - modelStatus.lastWarmedUp > 300000) {
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
        modelStatus.isWarmedUp = true;
        modelStatus.lastWarmedUp = Date.now();
        console.log('✅ Model is awake');
      } catch (warmupError) {
        console.warn('⚠️ Model warmup failed:', warmupError.message);
        modelStatus.isWarmedUp = false;
      }
    }

    // Параметры генерации (оптимизированные)
    const payload = {
      inputs: prompt,
      parameters: {
        negative_prompt: "low quality, deformed, blurry, text, watermark, signature",
        num_inference_steps: 25, // Уменьшено для скорости
        guidance_scale: 8.0,
        height: 768, // Уменьшено разрешение
        width: 768,
        prior_guidance_scale: 4.0,
        prior_num_inference_steps: 20
      },
      options: {
        wait_for_model: true
      }
    };

    console.log(`🟡 [HF] Generating image for: "${prompt.substring(0, 50)}..."`);
    
    const response = await axios.post(HF_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        Accept: 'image/png',
      },
      responseType: 'arraybuffer',
      timeout: 180000, // 180 секунд
    });

    console.log('🟢 [HF] Image received');

    // Оптимизация изображения
    const optimizedImage = await sharp(response.data)
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('❌ [HF] Generation error:', error.message);
    
    let errorMessage = 'Hugging Face generation failed';
    let errorDetails = '';
    
    // Обработка специфичных ошибок
    if (error.response) {
      errorDetails = `Status: ${error.response.status}`;
      
      if (error.response.data) {
        try {
          const errorData = JSON.parse(Buffer.from(error.response.data).toString());
          errorDetails += ` | ${errorData.error || errorData.message}`;
        } catch (e) {
          errorDetails += ` | Response: ${Buffer.from(error.response.data).toString('utf8').substring(0, 100)}`;
        }
      }
    }
    
    console.error(`❌ [HF] Details: ${errorDetails}`);
    
    return {
      success: false,
      message: errorMessage,
      details: errorDetails
    };
  }
}

async function trySberCloudGeneration(prompt) {
  try {
    const SBER_API_URL = "https://api.sbercloud.ru/content/v1/b1/candidates/generations";
    
    console.log(`🟡 [SberCloud] Generating image for: "${prompt.substring(0, 50)}..."`);
    
    // Шаг 1: Запрос на генерацию
    const genResponse = await axios.post(
      SBER_API_URL,
      {
        prompt: prompt,
        model: "Kandinsky3",
        num_images: 1,
        resolution: "1024x1024"
      },
      {
        headers: {
          Authorization: `Bearer ${SBER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    // Проверка статуса
    if (genResponse.data.status !== "success") {
      throw new Error(genResponse.data.message || "SberCloud generation failed");
    }

    // Шаг 2: Получение URL изображения
    const imageUrl = genResponse.data.images[0].url;
    console.log(`🟢 [SberCloud] Image URL: ${imageUrl}`);

    // Шаг 3: Скачивание изображения
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    // Оптимизация изображения
    const optimizedImage = await sharp(imageResponse.data)
      .resize(1024, 1024)
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();

    return {
      success: true,
      image: `data:image/jpeg;base64,${optimizedImage.toString('base64')}`
    };
    
  } catch (error) {
    console.error('❌ [SberCloud] Generation error:', error.message);
    
    let errorDetails = '';
    if (error.response) {
      errorDetails = `Status: ${error.response.status}`;
      try {
        errorDetails += ` | ${JSON.stringify(error.response.data)}`;
      } catch (e) {
        errorDetails += ` | Response: ${error.response.data?.toString().substring(0, 100)}`;
      }
    }
    
    console.error(`❌ [SberCloud] Details: ${errorDetails}`);
    
    return {
      success: false,
      message: 'SberCloud generation failed',
      details: errorDetails
    };
  }
}