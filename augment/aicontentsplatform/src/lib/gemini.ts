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

export interface DescriptionEnhanceRequest {
  title: string;
  rawDescription: string;
  type: string;
  tool: string;
  tags?: string[];
}

export interface DescriptionEnhanceResponse {
  success: boolean;
  enhancedDescription?: string;
  error?: string;
}

export const geminiService = {
  // 콘텐츠 설명을 요약하는 함수
  async summarizeContent(content: SummaryRequest): Promise<SummaryResponse> {
    try {
      console.log('🤖 Gemini AI 요약 시작:', content.title);

      // 프롬프트 구성
      const prompt = `
제목과 특징에 기재된 내용을 분석해서 요약해줘.

다음 AI 콘텐츠의 제목과 특징 설명을 꼼꼼히 분석하여 간결하고 매력적으로 요약해주세요.

제목: ${content.title}
콘텐츠 유형: ${content.type}
사용된 AI 도구: ${content.tool}
태그: ${content.tags.join(', ')}

특징 설명:
${content.description}

분석 및 요약 가이드라인:
1. 제목에서 핵심 키워드와 목적을 파악하여 반영
2. 특징 설명의 주요 내용과 장점을 분석하여 포함
3. 2-3문장으로 핵심 내용만 간결하게 요약
4. 사용자가 이 콘텐츠를 왜 선택해야 하는지 명확히 전달
5. AI 도구의 특징이나 장점이 있다면 포함
6. 전문적이면서도 이해하기 쉬운 톤으로 작성
7. 한국어로 작성
8. 마케팅 문구보다는 실용적인 정보 중심

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

  // 상세설명 정리 및 마크다운 변환
  async enhanceDescription(request: DescriptionEnhanceRequest): Promise<DescriptionEnhanceResponse> {
    try {
      console.log('✨ Gemini 상세설명 정리 시작:', request.title);

      // 프롬프트 구성
      const prompt = `
다음 AI 콘텐츠의 상세설명을 정리하고 마크다운 형식으로 구조화해주세요.

제목: ${request.title}
콘텐츠 유형: ${request.type}
사용된 AI 도구: ${request.tool}
태그: ${request.tags?.join(', ') || '없음'}

작성자가 입력한 원본 설명:
${request.rawDescription}

정리 및 구조화 가이드라인:
1. 마크다운 형식으로 구조화하여 가독성 향상
2. 제목과 소제목을 적절히 사용 (##, ###)
3. 주요 특징은 불릿 포인트(-)로 정리
4. 중요한 내용은 **굵게** 강조
5. 코드나 기술적 내용은 \`백틱\`으로 표시
6. 단계별 설명이 있다면 번호 목록(1. 2. 3.)으로 정리
7. 원본 내용의 핵심을 유지하면서 더 체계적으로 구성
8. 한국어로 작성하되 전문적이고 명확한 톤 유지
9. 마케팅적 과장 없이 실용적인 정보 중심
10. 사용자가 이해하기 쉽도록 논리적 순서로 배치

구조화된 마크다운 설명:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedDescription = response.text().trim();

      if (!enhancedDescription) {
        throw new Error('정리된 설명이 비어있습니다.');
      }

      console.log('✅ Gemini 상세설명 정리 완료:', enhancedDescription.substring(0, 100) + '...');

      return {
        success: true,
        enhancedDescription
      };

    } catch (error: any) {
      console.error('❌ Gemini 상세설명 정리 오류:', error);

      return {
        success: false,
        error: error.message || '상세설명 정리 중 오류가 발생했습니다.'
      };
    }
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
