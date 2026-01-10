const express = require('express');
const OpenAI = require('openai');


const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get('/ai-suggest', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.json({ suggestions: [] });

    // Tạo prompt cho AI
    const prompt = `
Bạn là trợ lý y tế thông minh. Người dùng đang tìm kiếm thông tin liên quan đến: "${query}".
Hãy trả về danh sách tối đa 10 gợi ý liên quan, có thể là tên bác sĩ, bệnh viện, hoặc triệu chứng phổ biến.

Viết ra dưới dạng danh sách ngắn, chỉ tên, không kèm giải thích:
`;

    // Gọi API OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // hoặc model bạn muốn
      messages: [
        { role: "system", content: "Bạn là trợ lý tìm kiếm y tế." },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;

    // Giả sử AI trả về dạng dòng, parse thành mảng
    const suggestions = text
      .split('\n')
      .map(line => line.replace(/^\d+\.?\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    res.json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ suggestions: [] });
  }
});

module.exports = router;
