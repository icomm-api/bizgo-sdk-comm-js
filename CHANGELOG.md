# Changelog

이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## 1.2.0 - 2026-09-28

> **주의: 1.2.0은 1.0.x(npm 1.0.0/1.0.1/1.0.3)와 호환되지 않습니다.** `^1` 범위로 설치했다면 1.2.0이 자동으로 설치되므로, 업그레이드 전에 코드를 옮기거나(README의 [1.0.x에서 옮기기](README.md#10x에서-옮기기)) `1.0.3`으로 고정하세요.

비즈고 커뮤니케이션 API 스펙([bizgo-api-spec](https://github.com/icomm-api/bizgo-api-spec))과 공통 SDK 설계 규약에 맞춰 새로 작성했습니다.
버전 번호는 여섯 Bizgo SDK를 1.2.0으로 맞추기 위한 것입니다.

### 추가
- 스펙의 **모든 operation(146개)** 을 생성된 메서드로 제공: `client.<x-sdk-resource>.<x-sdk-method>(params)` (중첩 리소스, 예: `client.alimtalk.templates.list`). 예약 발송, 카카오 발신프로필·카테고리·그룹·제재, 알림톡 템플릿, 브랜드메시지(템플릿·동보·타겟·친구 그룹·그룹 태그·동영상·권한), RCS 브랜드·대화방·템플릿, 인사이트, 상담톡
  - 옵션 객체 하나(경로·쿼리·헤더 값 + `body`), `<OperationId>Params`/`<OperationId>Result` 타입, 모든 요청 본문 검증, `x-sdk-result` 반환, `x-sdk-retry` 재시도, `x-sdk-pagination`(cursor/page/offset) `iter<Method>()`, multipart(파일·JSON 파트) 자동 구성
  - `OPERATIONS`(operation 메타데이터), `GeneratedClient`와 리소스 클래스 export. 손으로 쓴 P0 메서드는 그대로이며 이름이 같으면 우선
- 웹훅 파서 생성: `WebhookReceiver.counselMessage/counselReference/counselExpiredSession/counselSeenInfo/counselPersonalInfo/counselCertResult/counselResult`, `parseWebhook(name, body)`, `counselAck()`(`{"code":"A000","result":"Success"}`). 상담톡 웹훅에는 서명이 없으므로(서명은 리포트·MO 웹훅에만 적용) 서명을 검사하지 않고 본문 크기·JSON 깊이·형식만 검사합니다. `parseWebhook`은 타입이 붙은 payload를 돌려주며 secret 없이 상담톡 웹훅을 받는 방법입니다. 리포트·MO는 항상 서명 필수
- `DEFAULT_IDEMPOTENCY_TTL`(86400) export. `idempotencyKey`만 지정하고 `idempotencyTtl`을 비우면 SDK가 86400을 채워 보냄(비즈고가 TTL 없는 키를 A309로 거절, 2026-09-28 sandbox 확인). 명시값(0 포함)은 유지, 키가 없으면 추가하지 않음. `send.omni/sms/lms/mms/request`, `send.bulk` 청크(`idempotencyKeyPrefix`), 본문 스키마에 `idempotencyKey`·`idempotencyTtl`이 있는 생성된 operation(일반 객체 본문 포함, 입력 객체는 바꾸지 않음)에 적용
- 조건부 필수 검증(`x-sdk-required-if`): 생성기가 스펙의 규칙을 `SCHEMAS[...].requiredIf`로 내보내고 보내기 전에 검사(타입 모델·일반 객체 본문, `$.` 경로는 요청 루트 기준). 알림톡 전문 발송(`sendType` 없음)은 `msgType`(`AT`/`AI`)·`text` 필수(없으면 서버 A523), `sendType: 'template'`은 `destinations[].replaceWords` 필수. 브랜드메시지 `sendType`별 필수·버튼 `WL`/`AL` URL, RCS `header: '1'` → `footer`, 상담톡 `msgType`별 첨부도 검사. 오류에는 경로와 조건만
- `AlimtalkTemplate.msgType`(응답, `AT`/`AI` 등 문자열): 전문 발송의 `AlimtalkMessage.msgType`에 그대로 사용
- `send.bulk()`: 수신자 수 제한 없는 대량 발송(청크·동시성·`idempotencyKeyPrefix`, 청크별 결과·오류, `BulkSendResult`)
- 클라이언트 속도 제한: 인스턴스별 토큰 버킷 — send는 **초당 200 메시지(수신번호 기준)**, 요청 비용 = `destinations` 수(최소 1, 용량보다 크면 가득 찰 때 보내고 빚으로 남김, 재시도마다 다시 대기); other는 초당 5 요청. `rateLimit` 옵션(`null`로 끄기). send 버킷은 스펙의 `x-sdk-rate: send`로만 정함(현재 `sendOmni`, `createReservation`, `addReservationRecipients`, `createBrandMessageGroupSend`, `sendCounselPlain`, `sendCounselRich`)
- SDK 식별 헤더: `User-Agent: bizgo-sdk-comm-js/<ver> <node|bun|deno>/<ver> (<os>; <arch>)[ app/<name>-<ver>]`, `X-Bizgo-Client: bizgo-sdk-comm-js/<ver>`, 선택 `appInfo: { name, version }`(형식 검증, 위반 시 `ConfigurationError`). `Authorization`과 함께 옵션·사용자 fetch·헤더 파라미터로 덮어쓸 수 없음
- `hooks` 옵션(`onRequestStart`/`onRequestEnd`: operationId, resource.method, method, 경로 템플릿, status, layer/code, 시도 횟수, 소요 시간), `combineHooks()`
- `@bizgo/bizgo-sdk-comm-js/testing`: `FakeFetch`(요청 기록, 기본 성공 응답, 오류·타임아웃 주입), `signWebhook()`
- `@bizgo/bizgo-sdk-comm-js/otel`: OpenTelemetry 어댑터 `openTelemetryHooks()`. `@opentelemetry/api`는 선택 peer 의존성(런타임 의존성 없음 유지)

### 보안·편의성 강화 (SDK-DESIGN.md §12)
- 응답 본문을 스트림으로 읽어 압축 해제 후 16MB에서 중단(gzip bomb 방지), JSON 중첩 64단계 제한(응답·웹훅)
- 3xx는 따르지 않고(`redirect: 'manual'`) 재시도 없이 `InvalidResponseError`(`HTTP <status>`, baseUrl 확인 안내)
- `InvalidResponseError`에 `trackingId`, 열거 불가 `body`, 발송 요청이면 "접수됐을 수 있음" 안내
- 재시도(연결 오류·5xx·429) 뒤 `A301` → `DuplicateRequestError.alreadyAccepted = true`
- 수신자별 `A301`(같은 `idempotencyKey`로 다시 보냄, 응답은 HTTP 200·성공 `data.code`, 2026-09-28 sandbox 확인)은 `failed`가 아니라 `SendResult.duplicates`/`BulkSendResult.duplicates`로 돌려줌(`succeeded`에도 없음, 모두 `A301`인 청크도 오류 아님, `complete`에 영향 없음). `toString()`에 `duplicates` 개수 추가. 요청 단위 `A301`은 기존대로 `DuplicateRequestError`
- `Retry-After`는 0 이상 유한한 10진수만(최대 60초). 음수·16진수·날짜 형식은 무시하고 기본 백오프
- 오류 `toJSON()`과 `BizgoError.fromJSON()`으로 클래스·필드 왕복(본문 제외)
- `SendResult`/`ReportBatch`/조회 결과/웹훅 payload의 출력(`inspect`/`toString`)에서 전화번호 마스킹(`010****0000`), 상담 본문은 길이만. `toJSON`은 실제 값
- 웹훅: 공백뿐인 secret 거부, `tolerance`는 0보다 큰 유한한 값 또는 `null`만, timestamp 1~16자리
- 사용자 `logger`·`hooks` 예외와 async hook 거부를 삼킴(접수된 발송 결과 보존, unhandledRejection 없음)
- API Key: 출력 가능한 ASCII만, 앞뒤 공백·줄바꿈은 잘라내지 않고 설정 오류
- 업로드 파일을 읽지 못하면 `ValidationError`(파일 이름만, 전체 경로 없음)
- README 코드가 `tsc --strict`를 통과(테스트로 검사). SECURITY.md에 사용자 fetch의 TLS 설정이 적용된다는 점 명시

- 사용자 `fetch`는 `trustFetch: true`가 있어야 사용 가능(§12.6). 프록시·사내 CA는 Node.js 설정(`NODE_EXTRA_CA_CERTS`, `NODE_USE_ENV_PROXY`) 안내. 테스트용 `FakeFetch`는 예외
- 마스킹 확장(§12.11): 전화번호 길이별 규칙(8~10자리도 절반 이상), 이름·닉네임·이메일, 본문·`replaceWords`(길이만), 토큰·키(`[hidden]`). params·쿼리용 `redact()` 추가
- 성공 응답에 데이터가 없거나 `null`이어도 `{}`/`[]`를 돌려줌(§12.19, void operation 제외)

### 변경
- 사용자 `fetch` 옵션만으로는 설정 오류(`trustFetch: true` 필요)
- `send.bulk`의 멱등성 키를 `<prefix>-<i>`에서 `<prefix>-<chunkSize>-<startIndex>-<hash8>`로 변경(수신번호 SHA-256 앞 8자리, Python·Java SDK와 같은 공식). 다른 목록·청크 크기로 다시 실행해도 키가 다른 수신자 묶음에 재사용되지 않음
- `spec/`을 bizgo-api-spec 최신본으로 갱신(146 operations, 9 webhooks, `x-sdk-*` 메타데이터, `x-sdk-rate: send` 6개)
- `User-Agent` 형식 변경(os/arch, 선택 app 정보 추가)
- `createReservation` 결과는 `x-sdk-result: data`로 `resvKey`와 수신자별 결과(`data`)를 함께 돌려줌
- 기본으로 클라이언트 속도 제한이 켜짐. 한 인스턴스에서 초당 5회를 넘는 조회는 이제 SDK 안에서 대기함(`rateLimit: null`로 이전 동작)

### 변경 (1.0.x와 호환되지 않음)
- 빌더(`BizgoOptionsBuilder`, `SMSBuilder`, `OMNIRequestBodyBuilder` 등)를 없애고 `new Bizgo({ apiKey, environment })`와 일반 객체·채널 헬퍼(`sms()`, `alimtalk()` 등)로 바꿈
- base URL은 `/api/comm` 없이 `Environment.PRODUCTION`/`SANDBOX`로 고름. API Key는 `BIZGO_API_KEY` 환경변수에서도 읽음
- `Authorization` 헤더를 접두어 없는 키 하나로 통일. ID/PW 토큰 발급(`auth.getToken`) 제거
- 리소스 이름·메서드 변경: `send.omni/request/sms/lms/mms`, `files.uploadMms/uploadRcs/uploadBrandMessage`, `reports.poll/ack/consume/inquiry`, `messages.status/statusByRequestId/statistics/history/iterHistory/mo/moHistory/iterMoHistory`
- 발송 이력을 스펙의 `/api/comm/v1/message/history`(lastSeq 커서)로 바꿈 (1.0.x의 `/v1/message/sendHistory` 제거)
- 웹훅 "발송" 모듈(`webhook.getWebhook`) 제거 — 사용자 URL로 Authorization 헤더를 보냈음. 수신 측 `WebhookReceiver`/`verifySignature` 추가
- 오류를 `BizgoError` 계층으로 던짐(axios 오류와 `console.error` 출력 제거)
- 라이선스 표기를 Apache-2.0으로 통일(LICENSE 파일 추가)

### 추가 (1.0.x 대비)
- 스펙에서 생성한 타입(필드 설명 TSDoc 포함)과 검증 규칙: 필수·오타 필드, 길이, 개수(수신자 200명), enum, 범위, 패턴, EUC-KR 바이트 근사(이모지 거절), 채널 키 1개
- 재시도(429·5xx·네트워크 오류, 발송은 멱등성 키가 있을 때만), `Retry-After`, 시도당 타임아웃, 선택적 `logger`
- 게이트웨이/상품 단계 오류 구분, 에러코드 한국어 설명
- 이미지 업로드(경로·Buffer·Blob, MMS 300KB 사전 검사, 브랜드메시지 종류 검증)
- 리포트 `consume()`(처리 성공 시에만 수신 확인), 이력 async iterator, 날짜 KST 변환
- ESM + CommonJS 동시 배포(`exports` 맵, `.d.ts`/`.d.cts`), `./webhooks` 진입점, 런타임 의존성 없음(Node.js 18+)
- 예제, 오프라인 테스트, CI(lint·타입·테스트·패키징·생성 코드·의존성 감사·gitleaks), npm provenance 배포 워크플로
