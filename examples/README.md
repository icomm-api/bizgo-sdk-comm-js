# 예제

모든 예제는 **sandbox**(실제 발송 없음)에 연결하고, 값은 환경변수에서 읽습니다.
Node.js 22.18 이상은 `.ts` 파일을 바로 실행합니다(그 이전 버전은 `npx tsx examples/send-sms.ts`).

```bash
npm ci && npm run build             # 예제는 패키지 이름(@bizgo/bizgo-sdk-comm-js)으로 dist/를 불러옵니다
export BIZGO_API_KEY=...            # 콘솔 > 발송관리 > 연동관리 (코드에 쓰지 마세요)
export BIZGO_FROM=...               # 등록한 발신번호
export BIZGO_TO=...                 # 테스트 수신번호
node examples/send-sms.ts
```

| 파일 | 내용 |
|---|---|
| `send-sms.ts` | SMS 발송과 수신자별 접수 결과 확인 |
| `send-alimtalk-fallback.ts` | 알림톡 발송, 실패 시 SMS 대체발송, 멱등성 키 |
| `send-mms.ts` | 이미지 업로드 후 MMS 발송 (`BIZGO_IMAGE`) |
| `poll-reports.ts` | 리포트 Polling 처리(처리 성공 시에만 수신 확인) |
| `message-history.ts` | 발송 이력 전체 조회(페이지 자동 순회)와 상태 조회 |
| `webhook-server.ts` | 리포트 웹훅 수신 서버(서명 검증, 중복 처리, 5초 안에 응답) (`BIZGO_WEBHOOK_SECRET`) |
| `concurrent-send.ts` | 여러 요청 동시 발송 |

각 예제의 `main()`은 테스트(`test/examples.test.ts`)에서 mock 서버로 실행되므로, 예제 코드는 항상 현재 SDK와 맞습니다.
