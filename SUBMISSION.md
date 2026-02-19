# ⚖️ AI Court (AI 가상 법정 시뮬레이션)

> **"AI가 당신의 법정을 열다"** — 법적 분쟁의 결과를 스트레스 없이 미리 예측하고, 최적의 전략을 세우는 혁신적인 법률 어시스턴트.

## 📺 서비스 링크
- **Live App**: [https://ai-court.pages.dev/](https://ai-court.pages.dev/)
- **GitHub**: [https://github.com/Hwani-Net/ai-court](https://github.com/Hwani-Net/ai-court)
- **Demo Video**: _(아래 DEMO.md 참조)_

---

## 💡 기획 배경

법적 분쟁은 누구에게나 두렵고 막막한 경험입니다. 변호사 상담 전, 내 사건이 법정에서 어떻게 다뤄질지, 어떤 부분이 유리하고 불리할지 미리 알 수 있다면 어떨까요?

AI Court는 고비용의 법률 자문을 받기 전, **GPT-4o 기반의 3인 AI(판사·검사·변호사)**가 실제 재판처럼 사건을 심리하여 사용자에게 시뮬레이션 결과를 제공합니다.

**타겟 사용자**:
- 💼 법적 분쟁에 처했지만 변호사 선임이 부담스러운 개인
- 📝 계약서나 소장을 받았으나 전문가 조언을 구하기 어려운 스타트업
- 🎓 법률을 공부하거나 법정 흐름을 이해하고 싶은 학습자

---

## 🚀 핵심 기능

### 1. ⚡ 빠른 법률 상담
- 8개 법률 카테고리(계약·부동산·노동·가족·형사·소비자·교통·기타) 선택
- AI 판사가 관련 법령·판례 기반으로 즉시 핵심 요점 정리
- 스트리밍 응답으로 생성 과정 실시간 시각화

### 2. ⚔️ 가상 재판 시뮬레이션
- 원고·피고 양측 주장 입력 → 7라운드 자동 공방
- **CourtRoom UI**: 판사·검사·변호사 3자 배치 + 발언자 Glow 애니메이션
- 재판 종료 후 **AI 구조화 판결 분석** (승소 확률 원형 게이지, 핵심 쟁점, 권고사항)

### 3. 📄 소송장·계약서 문서 분석
- PDF 또는 텍스트 직접 입력 지원
- 내 입장(원고/피고) 설정 후 AI가 유불리 판단 + 전략 제시
- 독소 조항 자동 감지

### 4. 📥 결과 내보내기 & 공유
- 판결 분석 카드를 **PDF / PNG** 로 내보내기 (html2canvas + jsPDF)
- 카카오·트위터·링크 복사 공유 버튼

### 5. 🛡️ Free 티어 & 사용량 관리
- localStorage 기반 일일 사용량 카운터 (자정 자동 리셋)
- 제한 초과 시 프리미엄 업셀 모달 표시

### 6. 🌓 다크/라이트 테마
- 시스템 설정 자동 감지 + 수동 전환

---

## 🛠 기술 스택

| 분야 | 기술 |
|------|------|
| **Frontend** | Vite + React 19 + TypeScript |
| **Animation** | Framer Motion (스트리밍 효과, 페이지 전환, Spring 애니메이션) |
| **Styling** | Tailwind CSS v4 (CSS 변수 기반 Court Dark/Light Theme) |
| **AI Engine** | OpenAI GPT-4o (Streaming SSE + JSON Structured Output) |
| **Backend** | Cloudflare Pages Functions (API Proxy, 키 보안) |
| **Export** | html2canvas + jsPDF |
| **Analytics** | Google Analytics 4 (커스텀 이벤트 12종) |
| **Document** | pdfjs-dist (PDF 텍스트 추출) |

---

## ✨ 구현 강조 포인트

### 🔴 Streaming Response
답변 생성 과정을 SSE로 실시간 스트리밍 → 사용자 몰입감 극대화. Cloudflare Pages Functions의 `ReadableStream`으로 구현.

### 🔵 Structured JSON Output
재판 종료 후 GPT-4o에 JSON Schema를 전달 → **승소 확률·핵심 쟁점·유불리 포인트·권고사항**을 구조화된 데이터로 수신하여 동적 UI 렌더링.

### 🟡 Role-Playing Consistency
판사(중립·권위), 검사(공격·적극), 변호사(방어·창의)의 페르소나를 System Prompt로 명확히 구분. 7라운드 내내 역할 일관성 유지.

### 🟢 CourtRoom Visual
단순 채팅 UI를 넘어 실제 법정을 시각화. 발언 중인 역할에 골드 Glow 효과 + Spring 애니메이션으로 몰입형 경험 제공.

### 🔧 GA4 Custom Event Tracking
`mode_select`, `trial_start/complete`, `quick_consult_start/complete`,  
`document_upload/analyze`, `verdict_export`, `share_click` 등 12종 커스텀 이벤트 추적.

### 📱 Mobile-First Responsive
375px 모바일부터 1440px 데스크탑까지 완벽한 반응형 레이아웃.

---

## 🔮 멀티모델 비전 (Multi-Model Future)

현재 GPT-4o 단일 모델로 3인을 구현하지만, **각 역할에 최적화된 모델** 배치 시 더욱 현실적인 공방 가능:

| 역할 | 현재 | 미래 비전 | 선택 이유 |
|:---:|:---:|:---:|:---|
| ⚖️ 판사 | GPT-4o | **Claude Opus** | 중립적 장기 추론, 긴 컨텍스트 처리 강점 |
| 🔴 검사/원고 | GPT-4o | **GPT-4o** | 공격적 논리 전개, 법적 근거 인용 강점 |
| 🔵 변호사/피고 | GPT-4o | **Gemini Pro** | 창의적 반박, 다각도 해석 강점 |

> 서로 다른 AI 모델이 각자의 강점으로 법정에서 맞붙는 **"AI 법정 토너먼트"** — 이것이 AI Court의 궁극적 비전입니다.

---

## 💰 비즈니스 모델

| 티어 | 대상 | 기능 | 가격 |
|:---:|:---:|:---|:---:|
| **Free** | 일반 사용자 | 상담 3회/일, 재판 1회/일, 문서 분석 2회/일 | 무료 |
| **Pro** | 개인 | 무제한 상담·재판, PDF 내보내기, 우선 처리 | ₩9,900/월 |
| **Business** | 법무팀·스타트업 | API 접근, 화이트라벨, 커스텀 프롬프트 | ₩99,000/월 |
| **Enterprise** | 로펌·대기업 | 전용 서버, 데이터 보안 계약, 전담 지원 | 협의 |

**추가 수익원**: 로톡·변호사닷컴 등 법률 플랫폼과 B2B 제휴 — AI 상담 후 실제 변호사 연결 시 레퍼럴 수수료.

---

## 📊 개발 타임라인

```
Day 1: 프로젝트 기획 + 아키텍처 설계 + 기본 UI 구축
Day 2: AI 엔진 통합 (스트리밍 SSE, 구조화 출력) + CourtRoom UI
Day 3: 문서 분석 + PDF 내보내기 + 반응형 최적화
Day 4: GA4 연동 + 사용량 제한 시스템 + 최종 배포
```

---

## ⚖️ 면책 조항

본 서비스는 법률 정보 제공을 목적으로 하며, 실제 법률 자문을 대체할 수 없습니다.  
중요한 법적 결정 전에는 반드시 전문 변호사와 상담하시기 바랍니다.
