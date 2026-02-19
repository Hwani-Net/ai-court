# ⚖️ AI Court

> **"당신만의 AI 법률 파트너"** — 복잡한 법적 분쟁, AI가 판사·검사·변호사가 되어 미리 시뮬레이션해 드립니다.

[![Live Demo](https://img.shields.io/badge/Live-Demo-c9a84c?style=for-the-badge&logo=cloudflare)](https://ai-court.pages.dev)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-white?style=for-the-badge&logo=github)](https://github.com/Hwani-Net/ai-court)
[![Built with](https://img.shields.io/badge/Built%20with-GPT--4o-412991?style=for-the-badge&logo=openai)](https://openai.com)
[![Deployed on](https://img.shields.io/badge/Deployed%20on-Cloudflare-F38020?style=for-the-badge&logo=cloudflare)](https://pages.cloudflare.com)

---

## ✨ AI Court가 특별한 이유

단순한 챗봇이 아닙니다. **실제 법정의 메커니즘**을 그대로 담았습니다.

- **⚖️ 3인 법정 시스템**: 판사만 답변하는 것이 아니라, 공격(검사)과 방어(변호사)의 치열한 공방을 거쳐 최종 판결이 도출됩니다.
- **📊 AI 구조화 판결 분석**: 승소 확률 원형 게이지, 핵심 쟁점, 유불리 포인트를 GPT-4o JSON 모드로 분석합니다.
- **📄 스마트 문서 분석**: 업로드한 소송장이나 계약서의 텍스트를 AI가 이해하고 유리한 점과 불리한 점을 전략적으로 분석합니다.
- **🔴 실시간 스트리밍**: 답변이 생성되는 과정을 실시간으로 시각화하여 몰입감을 제공합니다.

---

## 🚀 주요 기능

### 1. ⚡ 빠른 법률 상담
8개 카테고리(계약·부동산·노동·가족·형사·소비자·교통·기타)를 선택하고 질문하면, AI 판사가 관련 법령과 판례를 기반으로 핵심 요점을 즉시 정리합니다.

### 2. ⚔️ 가상 재판 시뮬레이션
원고와 피고의 주장을 입력하면 7라운드에 걸친 AI 공방이 시작됩니다. 재판 종료 후 승소 확률·쟁점·전략을 담은 AI 판결 분석 카드가 자동 생성됩니다.

### 3. 📄 소송장 분석
PDF 파일 또는 텍스트를 업로드하면 AI가 내 입장(원고/피고)에서 유불리를 판단하고 독소 조항 및 대응 전략을 제시합니다.

### 4. 📥 결과 내보내기
판결 분석 카드를 **PDF** 또는 **PNG 이미지**로 내보내어 보관하거나 SNS에 공유할 수 있습니다.

---

## 🛠 Tech Stack

| 분야 | 기술 |
|------|------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Animation** | Framer Motion |
| **Styling** | Tailwind CSS v4 (CSS 변수 테마) |
| **AI Engine** | OpenAI GPT-4o (Streaming SSE + JSON Structured Output) |
| **Backend** | Cloudflare Pages Functions (API Proxy) |
| **Document** | pdfjs-dist |
| **Export** | html2canvas + jsPDF |
| **Analytics** | Google Analytics 4 (커스텀 이벤트 12종) |

---

## 📦 설치 및 실행

```bash
# 레포지토리 클론
git clone https://github.com/Hwani-Net/ai-court.git
cd ai-court

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 VITE_OPENAI_API_KEY=sk-... 입력

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build
```

## 🔐 환경변수

| 변수 | 설명 | 필수 |
|------|------|:---:|
| `VITE_OPENAI_API_KEY` | OpenAI API 키 (로컬 개발용) | ✅ |

> **보안 참고**: 프로덕션에서는 Cloudflare Pages 대시보드의 Environment Variables에서 `OPENAI_API_KEY`를 설정합니다. 브라우저에 키가 노출되지 않습니다.

---

## 📊 Free 티어 제한

| 기능 | 일일 무료 한도 |
|------|:---:|
| ⚡ 빠른 법률 상담 | 3회 |
| ⚔️ 가상 재판 시뮬레이션 | 1회 |
| 📄 소송장 분석 | 2회 |

> 자정(00:00)에 자동 초기화됩니다.

---

## ⚖️ Disclaimer

AI Court는 법률 정보를 제공하는 도구일 뿐, 실제 법적 효력을 갖는 자문이 아닙니다.  
법률적 판단이 필요한 경우에는 반드시 전문 법조인의 도움을 받으시기 바랍니다.

---

© 2025 AI Court. Built for Primer Hackathon. Powered by OpenAI & Cloudflare.
