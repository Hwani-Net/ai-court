# ⚖️ AI Court (AI 가상 법정 시뮬레이션)

> **"AI가 당신의 법정을 열다"** — 법적 분쟁의 결과를 스트레스 없이 미리 예측하고, 최적의 전략을 세우는 혁신적인 법률 어시스턴트.

## 📺 서비스 링크
- **Live App**: [https://ai-court.pages.dev/](https://ai-court.pages.dev/)
- **GitHub**: [https://github.com/Hwani-Net/ai-court](https://github.com/Hwani-Net/ai-court)

## 💡 기획 배경
법적 분쟁은 누구에게나 두렵고 막막한 경험입니다. 변호사 상담 전, 내 사건이 법정에서 어떻게 다뤄질지, 어떤 부분이 유리하고 불리할지 미리 알 수 있다면 어떨까요? AI Court는 고비용의 법률 자문을 받기 전, **GPT-4o 기반의 3인 AI(판사·검사·변호사)**가 실제 재판처럼 사건을 심리하여 사용자에게 시뮬레이션 결과를 제공합니다.

## 🚀 핵심 기능
1. **⚡ 빠른 법률 상담**: 1분 안에 법률 질문의 핵심 요점과 관련 조항, 대응 방안을 판결문 포맷으로 정리.
2. **⚔️ 가상 재판 시뮬레이션**: 7라운드에 걸친 AI 판사·검사·변호사의 공방을 통해 최종 판결 예측.
3. **📄 소송장 및 문서 분석**: PDF/텍스트 업로드 시 AI가 내 입장에서 유불리를 정밀 분석하고 전략 제시.
4. **🎨 프리미엄 시각화**: 모든 결과를 실제 법정 판결문 카드 형식(`[주문]`, `[이유]`, `[권고사항]`)으로 시각화하여 신뢰도 높은 경험 제공.

## 🛠 기술 스택
- **Frontend**: Vite + React + TypeScript
- **State/Animation**: Framer Motion (부드러운 페이지 전환 및 스트리밍 효과)
- **Styling**: Tailwind CSS v4 (Modern Court Dark Theme)
- **AI Engine**: OpenAI GPT-4o (Streaming SSE 적용)
- **Deployment**: Cloudflare Pages + Pages Functions (API Proxy & 보안)
- **Analytics**: Google Analytics 4 (SEO 최적화)

## ✨ 구현 강조 포인트
- **Streaming Response**: 답변이 생성되는 과정을 실시간으로 보여주어 사용자 몰입감 극대화.
- **Role-playing Consistency**: 판사(중립), 검사(공격), 변호사(방어)의 페르소나를 명확히 유지하는 프롬프트 엔지니어링.
- **Mobile First**: 스마트폰에서도 재판의 전 과정을 매끄럽게 경험할 수 있는 반응형 레이아웃.
- **Viral Elements**: 카카오톡 포함 소셜 공유 기능을 통해 결과물을 쉽게 퍼뜨릴 수 있는 구조.

## ⚖️ 면책 조항
본 서비스는 법률 정보 제공을 목적으로 하며, 실제 법률 자문을 대체할 수 없습니다. 중요한 법적 결정 전에는 반드시 전문 변호사와 상담하시기 바랍니다.
