import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Gemini 2.0 Flash 모델 설정
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 500,
  },
});

export interface SummaryRequest {
  title: string;
  description: string;
  type: string;
  tool: string;
  tags: string[];
}

export interface SummaryResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

export const geminiService = {
  // 콘텐츠 설명을 요약하는 함수
  async summarizeContent(content: SummaryRequest): Promise<SummaryResponse> {
    try {
      console.log('🤖 Gemini AI 요약 시작:', content.title);

      // 프롬프트 구성
      const prompt = `
다음 AI 콘텐츠의 특징과 설명을 간결하고 매력적으로 요약해주세요.

제목: ${content.title}
콘텐츠 유형: ${content.type}
사용된 AI 도구: ${content.tool}
태그: ${content.tags.join(', ')}

설명:
${content.description}

요약 가이드라인:
1. 2-3문장으로 핵심 내용만 요약
2. 사용자가 이 콘텐츠를 왜 선택해야 하는지 명확히 전달
3. AI 도구의 특징이나 장점이 있다면 포함
4. 전문적이면서도 이해하기 쉬운 톤으로 작성
5. 한국어로 작성
6. 마케팅 문구보다는 실용적인 정보 중심

요약:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();

      if (!summary) {
        throw new Error('요약 결과가 비어있습니다.');
      }

      console.log('✅ Gemini AI 요약 완료:', summary.substring(0, 100) + '...');
      
      return {
        success: true,
        summary
      };

    } catch (error: any) {
      console.error('❌ Gemini AI 요약 오류:', error);
      
      return {
        success: false,
        error: error.message || 'AI 요약 중 오류가 발생했습니다.'
      };
    }
  },

  // 여러 콘텐츠를 배치로 요약하는 함수
  async summarizeMultipleContents(contents: SummaryRequest[]): Promise<(SummaryResponse & { id?: string })[]> {
    const results = [];
    
    for (const content of contents) {
      const result = await this.summarizeContent(content);
      results.push(result);
      
      // API 호출 제한을 위한 딜레이 (선택사항)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  },

  // API 키 유효성 검사
  async validateApiKey(): Promise<boolean> {
    try {
      const testPrompt = "안녕하세요";
      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      return !!response.text();
    } catch (error) {
      console.error('❌ Gemini API 키 검증 실패:', error);
      return false;
    }
  }
};
