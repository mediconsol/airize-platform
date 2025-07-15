import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/firestore';
import { geminiService } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 기존 콘텐츠 AI 요약 일괄 생성 시작');

    // 모든 공개 콘텐츠 조회
    const contentsResult = await contentService.getContents(100); // 최대 100개
    
    if (!contentsResult.success) {
      return NextResponse.json(
        { success: false, error: '콘텐츠 조회 실패' },
        { status: 500 }
      );
    }

    const contents = contentsResult.data;
    console.log(`📊 총 ${contents.length}개 콘텐츠 발견`);

    // AI 요약이 없는 콘텐츠만 필터링
    const contentsWithoutSummary = contents.filter(content => !content.aiSummary);
    console.log(`🎯 AI 요약이 필요한 콘텐츠: ${contentsWithoutSummary.length}개`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 각 콘텐츠에 대해 AI 요약 생성
    for (const content of contentsWithoutSummary) {
      try {
        console.log(`🤖 AI 요약 생성 중: ${content.title}`);

        // AI 요약 생성
        const summaryResult = await geminiService.summarizeContent({
          title: content.title,
          description: content.description,
          type: content.type,
          tool: content.tool,
          tags: content.tags || []
        });

        if (summaryResult.success && summaryResult.summary) {
          // Firestore에 저장
          const saveResult = await contentService.saveAISummary(content.id, summaryResult.summary);
          
          if (saveResult.success) {
            successCount++;
            results.push({
              contentId: content.id,
              title: content.title,
              success: true,
              summary: summaryResult.summary
            });
            console.log(`✅ 성공: ${content.title}`);
          } else {
            errorCount++;
            results.push({
              contentId: content.id,
              title: content.title,
              success: false,
              error: saveResult.error
            });
            console.log(`❌ 저장 실패: ${content.title}`);
          }
        } else {
          errorCount++;
          results.push({
            contentId: content.id,
            title: content.title,
            success: false,
            error: summaryResult.error
          });
          console.log(`❌ 요약 생성 실패: ${content.title}`);
        }

        // API 호출 제한을 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        errorCount++;
        results.push({
          contentId: content.id,
          title: content.title,
          success: false,
          error: error.message
        });
        console.log(`❌ 오류: ${content.title} - ${error.message}`);
      }
    }

    console.log(`🎉 일괄 생성 완료: 성공 ${successCount}개, 실패 ${errorCount}개`);

    return NextResponse.json({
      success: true,
      message: `AI 요약 일괄 생성 완료`,
      stats: {
        totalContents: contents.length,
        needsSummary: contentsWithoutSummary.length,
        successCount,
        errorCount
      },
      results
    });

  } catch (error: any) {
    console.error('❌ 일괄 생성 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'AI 요약 일괄 생성 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// GET 요청으로 진행 상황 확인
export async function GET() {
  try {
    const contentsResult = await contentService.getContents(100);
    
    if (!contentsResult.success) {
      return NextResponse.json(
        { success: false, error: '콘텐츠 조회 실패' },
        { status: 500 }
      );
    }

    const contents = contentsResult.data;
    const withSummary = contents.filter(content => content.aiSummary);
    const withoutSummary = contents.filter(content => !content.aiSummary);

    return NextResponse.json({
      success: true,
      stats: {
        totalContents: contents.length,
        withSummary: withSummary.length,
        withoutSummary: withoutSummary.length,
        completionRate: contents.length > 0 ? Math.round((withSummary.length / contents.length) * 100) : 0
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
