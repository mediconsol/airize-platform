import { NextRequest, NextResponse } from 'next/server';
import { geminiService, SummaryRequest } from '@/lib/gemini';
import { contentService } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const { title, description, type, tool, tags, contentId }: SummaryRequest & { contentId?: string } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: '제목과 설명은 필수입니다.' },
        { status: 400 }
      );
    }

    // Gemini API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('🤖 AI 요약 요청:', { title, type, tool });

    // AI 요약 생성
    const summaryResult = await geminiService.summarizeContent({
      title,
      description,
      type: type || 'other',
      tool: tool || 'AI',
      tags: tags || []
    });

    if (!summaryResult.success) {
      return NextResponse.json(
        { success: false, error: summaryResult.error },
        { status: 500 }
      );
    }

    // Firestore에 AI 요약 저장 (contentId가 있는 경우)
    if (contentId && summaryResult.summary) {
      const saveResult = await contentService.saveAISummary(contentId, summaryResult.summary);
      if (!saveResult.success) {
        console.warn('⚠️ AI 요약 저장 실패:', saveResult.error);
        // 저장 실패해도 요약은 반환
      }
    }

    console.log('✅ AI 요약 완료');

    return NextResponse.json({
      success: true,
      summary: summaryResult.summary
    });

  } catch (error: any) {
    console.error('❌ AI 요약 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'AI 요약 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// API 키 검증 엔드포인트
export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const isValid = await geminiService.validateApiKey();
    
    return NextResponse.json({
      success: true,
      valid: isValid,
      message: isValid ? 'API 키가 유효합니다.' : 'API 키가 유효하지 않습니다.'
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
