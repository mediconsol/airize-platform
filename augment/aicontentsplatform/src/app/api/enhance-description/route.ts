import { NextRequest, NextResponse } from 'next/server';
import { geminiService, DescriptionEnhanceRequest } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 요청 데이터 검증
    const { title, rawDescription, type, tool, tags }: DescriptionEnhanceRequest = body;
    
    if (!title || !rawDescription) {
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

    console.log('✨ 상세설명 정리 요청:', { title, type, tool });

    // AI 상세설명 정리
    const enhanceResult = await geminiService.enhanceDescription({
      title,
      rawDescription,
      type: type || 'other',
      tool: tool || 'AI',
      tags: tags || []
    });

    if (!enhanceResult.success) {
      return NextResponse.json(
        { success: false, error: enhanceResult.error },
        { status: 500 }
      );
    }

    console.log('✅ 상세설명 정리 완료');

    return NextResponse.json({
      success: true,
      enhancedDescription: enhanceResult.enhancedDescription
    });

  } catch (error: any) {
    console.error('❌ 상세설명 정리 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '상세설명 정리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
