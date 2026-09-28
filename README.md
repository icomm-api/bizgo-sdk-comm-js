# bizgo-sdk-comm-js

> **1.2.0은 1.0.x와 호환되지 않습니다.** npm의 1.0.0/1.0.1/1.0.3과 API가 전혀 다릅니다. `^1` 범위(예: `"^1.0.3"`)로 설치했다면 다음 설치·업데이트 때 1.2.0이 자동으로 들어옵니다. 업그레이드 전에 코드를 옮기거나([1.0.x에서 옮기기](#10x에서-옮기기)) `1.0.3`으로 고정하세요(`npm install @bizgo/bizgo-sdk-comm-js@1.0.3 --save-exact`).

[비즈고(Bizgo)](https://bizgo.io) 커뮤니케이션 API의 TypeScript/JavaScript SDK입니다.
SMS/LMS/MMS, 국제문자, RCS, 카카오 알림톡·브랜드메시지, 네이버 톡톡을 하나의 클라이언트로 발송하고, 리포트·이력·통계를 조회하고, 웹훅을 검증합니다.
예약 발송, 카카오 발신프로필·템플릿, 브랜드메시지, RCS 브랜드·템플릿, 인사이트, 상담톡까지 **스펙의 모든 API**를 씁니다.

- Node.js 18 이상 · ESM(`import`)과 CommonJS(`require`) 모두 지원 · 전체 타입 선언 포함
- **런타임 의존성 없음** (전역 `fetch`, `node:crypto`만 사용)
- 요청은 보내기 전에 검증합니다: 필수 필드, 오타 필드, **바이트 길이**(SMS 90byte 등), EUC-KR 범위 밖 문자(이모지), 수신자 200명 제한
- 대량 발송(`send.bulk`), 클라이언트 속도 제한, 테스트 도구(`/testing`), hooks·OpenTelemetry(`/otel`) 제공
- 스펙: [bizgo-api-spec](https://github.com/icomm-api/bizgo-api-spec) (OpenAPI 3.1) · 원문: [API 레퍼런스](https://developers.bizgo.io/api-sdk/api-reference)

> 1.0.x를 쓰고 있다면 [1.0.x에서 옮기기](#10x에서-옮기기)를 먼저 보세요. 1.2.0은 호환되지 않는 새 API입니다.

## 설치

```bash
npm install @bizgo/bizgo-sdk-comm-js
```

## 시작하기

1. 콘솔 `발송관리 > 연동관리`에서 **API Key**를 발급하고, 호출할 서버의 **공인 IP를 등록**합니다.
2. 키를 환경변수로 설정합니다. 키는 코드나 저장소, 브라우저·앱에 넣지 않습니다. 이 SDK는 **서버에서만** 씁니다.

```bash
export BIZGO_API_KEY=...
```

3. sandbox(실제 발송 없음)에서 먼저 확인합니다.

```ts
import { Bizgo, Environment } from '@bizgo/bizgo-sdk-comm-js';

const client = new Bizgo({ environment: Environment.SANDBOX }); // 키는 BIZGO_API_KEY에서 읽음

const result = await client.send.sms({ to: '01000000000', from: '01000000000', text: '[비즈고] 인증번호는 123456 입니다.' });
console.log(result.msgKeys); // 접수된 메시지 키
console.log(result.failed); // 접수 단계에서 거절된 수신자 (없으면 [])
console.log(result.duplicates); // 같은 idempotencyKey로 이미 접수됐던 수신자(A301, 다시 발송되지 않음)
```

CommonJS에서는 `const { Bizgo, Environment } = require('@bizgo/bizgo-sdk-comm-js');`로 씁니다.
운영에 보낼 때는 `environment`를 생략하거나 `Environment.PRODUCTION`을 씁니다.

> **접수 ≠ 발송 완료.** `send.*`의 결과는 접수 결과입니다. 최종 결과는 [리포트](#리포트)로 받습니다.

## 발송

모든 채널은 `client.send.omni()` 하나로 보냅니다. `messages`에 여러 개를 넣으면 **앞 메시지가 실패할 때 다음 메시지로 대체발송**됩니다.
채널 헬퍼(`alimtalk()`, `sms()` 등)는 메시지를 `{ alimtalk: {...} }`처럼 채널 키로 감싸 줍니다. 직접 `{ sms: {...} }`로 써도 같습니다.

```ts
import { alimtalk, sms } from '@bizgo/bizgo-sdk-comm-js';

const result = await client.send.omni({
  to: [{ to: '01000000000', replaceWords: { name: '홍길동' } }], // 최대 200명
  messages: [
    alimtalk({ senderKey: 'SENDER_KEY', templateCode: 'TEMPLATE_CODE', msgType: 'AT', text: '#{name}님, 주문이 접수되었습니다.' }),
    sms({ from: '01000000000', text: '#{name}님, 주문이 접수되었습니다.' }), // 알림톡 실패 시
  ],
  idempotencyKey: 'order-20260923-0001', // 권장: 재시도해도 중복 발송되지 않음 (idempotencyTtl 기본 86400초)
  ref: 'order-20260923-0001', // 리포트에 그대로 돌아오는 참조값
});
```

`idempotencyKey`를 보낼 때는 비즈고가 `idempotencyTtl`(0~86400초)도 요구합니다(없으면 A309). SDK는 키만 지정하면 `idempotencyTtl: 86400`(`DEFAULT_IDEMPOTENCY_TTL`, 24시간)을 채워 보내고, 직접 지정한 값(0 포함)은 그대로 보냅니다. 키가 없으면 TTL을 추가하지 않습니다. `send.sms/lms/mms`, `send.bulk`의 청크, `idempotencyKey`·`idempotencyTtl`이 있는 생성된 메서드의 본문(일반 객체 포함, 입력 객체는 바꾸지 않음)에 모두 같은 규칙이 적용됩니다.

| 채널 | 헬퍼 (`messageFlow` 키) | 메시지 타입 | 간편 메서드 |
|---|---|---|---|
| SMS (90byte) | `sms()` (`sms`) | `SmsMessage` | `send.sms()` |
| LMS (2,000byte) | `mms()` (`mms`, `fileKey` 없음) | `MmsMessage` | `send.lms()` |
| MMS | `mms()` (`mms`, `fileKey` 최대 3개) | `MmsMessage` | `send.mms()` |
| 국제문자 | `international()` | `InternationalMessage` | |
| RCS | `rcs()` | `RcsMessage` | |
| 카카오 알림톡 | `alimtalk()` | `AlimtalkMessage` | |
| 카카오 브랜드메시지 | `brandMessage()` (`brandmessage`) | `BrandMessage` | |
| 네이버 톡톡 | `naverTalk()` (`navertalk`) | `NaverTalkMessage` | |

필드 이름은 API 이름(camelCase, `from`) 그대로입니다. 타입과 필드 설명은 스펙에서 생성되어 편집기 자동완성에 나옵니다.

**알림톡 발송 방식**: 전문 발송(`sendType` 없음)에는 `msgType`(`AT` 텍스트형, `AI` 이미지형)과 `text`가 필수입니다. 빠지면 서버가 A523으로 거절하므로 SDK가 보내기 전에 `ValidationError`로 막습니다. 템플릿의 `msgType`은 `client.alimtalk.templates.get()` 응답의 `msgType`을 그대로 쓰면 됩니다. 템플릿 자동 치환 발송(`sendType: 'template'`)은 `senderKey`·`templateCode`만 보내고 모든 수신자에 `replaceWords`가 필요합니다(`msgType`·`text` 불필요).

```ts
import { alimtalk, Bizgo } from '@bizgo/bizgo-sdk-comm-js';

const client = new Bizgo();
await client.send.omni({
  to: [{ to: '01000000000', replaceWords: { name: '홍길동' } }],
  messages: [alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', sendType: 'template' })],
});
```

JavaScript에서도 잘못된 요청은 **보내기 전에** `ValidationError`로 막습니다. 오류에는 필드 경로와 이유만 담기고 입력값(전화번호, 본문)은 담기지 않습니다.
다른 필드 값에 따라 필수가 되는 필드(스펙의 `x-sdk-required-if`: 알림톡·브랜드메시지 `sendType`별 필수, 브랜드메시지 버튼 `WL`/`AL`의 URL, RCS `header: '1'`이면 `footer`, 상담톡 `msgType`별 첨부 등)도 검사합니다. 예: `messageFlow[0].alimtalk.msgType: messageFlow[0].alimtalk.sendType != template일 때 필수입니다`. `destinations[].replaceWords`처럼 요청 루트 기준 규칙은 요청 전체(`send.*`, `reservations.create` 등)를 검증할 때 적용됩니다.

```ts
import { ValidationError } from '@bizgo/bizgo-sdk-comm-js';

try {
  await client.send.sms({ to: '01000000000', from: '01000000000', text: '가'.repeat(46) });
} catch (error) {
  // ValidationError: 요청 검증 실패: messageFlow[0].sms.text: 최대 90byte인데 92byte입니다 (EUC-KR 기준)
  if (error instanceof ValidationError) console.log(error.issues); // [{ path: 'messageFlow[0].sms.text', message: '...' }]
  else throw error;
}
```

- **바이트 길이**: JavaScript에는 CP949 인코더가 없어 `EUC-KR` 필드는 근사 규칙으로 셉니다: ASCII 1byte, 그 밖의 BMP 문자(한글 등) 2byte, BMP 밖 문자(이모지 등)는 오류. 서버가 CP949로 표현하지 못하는 일부 문자(예: 일부 라틴 확장 문자)는 SDK를 통과한 뒤 서버에서 거절될 수 있습니다.
- 스펙에 없는 필드(`templatecode` 같은 오타)와 메서드 옵션 오타(`idempotency_key`)도 오류입니다.
- 스펙 기본값(`responseMethod` 등)은 설정한 경우에만 보냅니다.

### 이미지

```ts
const uploaded = await client.files.uploadMms('banner.jpg'); // 파일 경로, Buffer/Uint8Array, Blob. jpg, 최대 300KB
await client.send.mms({ to: '01000000000', from: '01000000000', text: '...', fileKeys: [uploaded.fileKey!] });

await client.files.uploadRcs(buffer, { filename: 'card.png' }); // → media
await client.files.uploadBrandMessage(blob, { kind: 'wide', filename: 'wide.jpg' }); // → imgUrl
```

`kind`는 `default`, `wide`, `wideItemList`, `wideItemList/first`, `carouselFeed`, `carouselCommerce`만 받습니다.

## 리포트

콘솔에서 API Key별로 리포트 수신 방식(POLLING 또는 WEBHOOK)을 정합니다.

**Polling** — 처리에 성공한 배치만 수신 확인합니다. 처리 함수가 예외를 던지면 같은 배치를 다시 받습니다.

```ts
await client.reports.consume(async (reports) => {
  for (const r of reports) await db.upsert(r.msgKey, r.reportCode); // 같은 리포트가 다시 올 수 있으니 upsert
});
```

**Webhook** — 서명을 검증하고 5초 안에 `{"msgKey": ...}`로 응답합니다. 웹훅 secret은 비즈고에 요청해 별도로 받습니다.

```ts
import { WebhookReceiver, WebhookVerificationError } from '@bizgo/bizgo-sdk-comm-js/webhooks';

const receiver = new WebhookReceiver(process.env.BIZGO_WEBHOOK_SECRET!);

// 사용하는 웹 프레임워크의 핸들러 안에서 (헤더와 원문 본문)
try {
  const report = receiver.report(req.headers, rawBody);
  enqueue(report); // 무거운 처리는 비동기로
  res.status(200).json(receiver.ack(report.msgKey));
} catch (error) {
  if (error instanceof WebhookVerificationError) res.status(401).json({});
  else throw error;
}
```

> 웹훅 서명과 timestamp 허용 오차를 검증하세요. 운영 환경에서는 HTTPS, 비즈고 웹훅 발신 IP 허용 목록, `msgKey` 기준 중복 제거를 함께 적용하고, 중요한 판단은 리포트·상태 조회 API로 결과를 확인하세요.
> 서명 출력 인코딩(hex/base64)은 아직 확인되지 않아 둘 다 받습니다(hex는 대소문자 무시). 기본 허용 오차는 300초입니다.

**개별 조회** — `await client.reports.inquiry(msgKey)` (30일 이내)

## 조회

```ts
await client.messages.status(msgKey); // 단건 상태 (대체발송 시 채널별 항목)
await client.messages.statusByRequestId(requestId); // 동보 요청 전체 (msgKey에서 끝 3자리를 뺀 값)
await client.messages.statistics({ startDate: new Date('2026-09-01T00:00:00+09:00'), endDate: '20260923', serviceType: 'SMS' });

for await (const m of client.messages.iterHistory({ requestTime: new Date(Date.now() - 3600_000), serviceType: ['SMS', 'ALIMTALK'] })) {
  // 페이지(lastSeq)를 자동으로 따라감
}

for await (const mo of client.messages.iterMoHistory({ occurredTime: '2026-09-23T09:00:00+09:00' })) {
  // MO(수신) 이력
}
```

- `Date`는 KST로 바꿔 보냅니다: 통계 `YYYYMMDD`, 발송 이력 `yyyy-MM-ddTHH:mm:ss`, MO 이력 `yyyy-MM-ddTHH:mm:ss+09:00`. 문자열은 그대로 보냅니다.
- `limit`은 1~1000입니다. 조회 API의 기본 호출 한도는 초당 5회입니다.

## 전체 API

스펙의 **모든 operation(146개)** 을 쓸 수 있습니다. `send`·`files`·`reports`·`messages`의 편의 메서드(위 절) 외에는 스펙 메타데이터(`x-sdk-resource`, `x-sdk-method`)에서 **생성된 메서드**이며, 리소스는 점으로 중첩됩니다: `client.<리소스>.<메서드>(params)`.

| 리소스 | 예 |
|---|---|
| `reservations`, `reservations.recipients` | 예약 발송 생성·조회·수정·취소·중지·재개, 수신자 추가·조회·삭제 |
| `kakao.senders`, `kakao.categories`, `kakao.groups`, `kakao.sanctions` | 카카오 발신프로필·카테고리·그룹·제재 조회 |
| `alimtalk.templates`, `alimtalk.templateCategories`, `alimtalk.publicTemplates` | 알림톡 템플릿 등록·수정·삭제·검수 요청, 공용 템플릿 |
| `brandMessage.*` (`templates`, `groupSends`, `audience`, `friendGroups`, `groupTags`, `videos`, `permissions`, ...) | 브랜드메시지 템플릿·동보 발송·타겟·친구 그룹 |
| `rcs.*` (`brands`, `chatbots`, `templates`, `templateForms`, `templateImages`, `commonFormats`) | RCS 브랜드·대화방·템플릿 |
| `insights.alimtalk`, `insights.brandMessage`, `insights.rcs` | 메시지 인사이트 통계 |
| `counsel.*` (`messages`, `sessions`, `users`, `channels`, `systemMessages`, `files`, ...) | 카카오 상담톡 |
| `files.uploadBrandMessageWide`, `files.uploadAlimtalkTemplateImage`, ... | 그 밖의 파일 업로드 |

```ts
import { sms } from '@bizgo/bizgo-sdk-comm-js';

// 알림톡 템플릿 목록 (offset 페이지)
const templates = await client.alimtalk.templates.list({ senderKey: 'SENDER_KEY_EXAMPLE', limit: 100 });
for await (const t of client.alimtalk.templates.iterList({ senderKey: 'SENDER_KEY_EXAMPLE' })) {
  // 모든 페이지를 자동으로 따라감 (빈 페이지, 요청 크기보다 작은 페이지, total 도달 시 멈춤)
}

// 예약 발송: 결과에 resvKey와 수신자별 접수 결과(data)가 함께 옵니다
const reservation = await client.reservations.create({
  body: {
    resvSendTime: '2026-10-01 09:00:00',
    destinations: [{ to: '01000000000' }],
    messageFlow: [sms({ from: '01000000000', text: '예약 안내입니다.' })],
  },
});
if (reservation.resvKey) await client.reservations.cancel({ resvKey: reservation.resvKey });

// RCS 템플릿 조회, 브랜드메시지 친구 수
await client.rcs.templates.get({ messagebaseId: 'MESSAGEBASE_ID_EXAMPLE' });
await client.brandMessage.audience.getFriendCount({ senderKey: 'SENDER_KEY_EXAMPLE' });

// 상담톡 메시지
await client.counsel.messages.sendPlain({
  body: { senderKey: 'SENDER_KEY_EXAMPLE', userKey: 'USER_KEY_EXAMPLE', msgType: 'TEXT', message: '안녕하세요.' },
});
```

- **인자**: 객체 하나에 경로 값, 쿼리 값, 헤더 값(스펙에 있는 경우, 예: `kakao.senders.create`의 `token`·`phoneNumber`)을 이름 그대로 넣고, 요청 본문은 `body`에 넣습니다. 타입 이름은 `<OperationId>Params` / `<OperationId>Result`(예: `ListAlimtalkTemplatesParams`)입니다.
- **검증**: 보내기 전에 경로 값(빈 값, `.`/`..` 거절, URL 인코딩), 쿼리(필수, 타입, enum, 범위), 본문(스펙 규칙 전체, 알 수 없는 필드 거절)을 검사합니다. 배열 쿼리는 쉼표로 이어 보내고, `yyyyMMdd` 쿼리에 `Date`를 넣으면 KST 날짜로 바꿉니다.
- **반환**: 스펙의 `x-sdk-result`(기본 `data.data`) 부분을 돌려줍니다. 데이터가 없는 응답(삭제 등)은 `undefined`입니다.
- **재시도**: 스펙의 `x-sdk-retry`를 따릅니다. `safe`(조회, 같은 결과가 나오는 수정·삭제)는 429·5xx·네트워크 오류를 재시도하고, `rate_limit_only`(생성·발송·업로드)는 429만 재시도합니다. 각 메서드의 TSDoc에 적혀 있습니다.
- **페이지**: `x-sdk-pagination`이 있는 목록(12개)에는 `iter<Method>()`가 있습니다. cursor 방식은 `hasNext`가 false이거나 커서가 없거나 움직이지 않으면 멈춥니다.
- **multipart**: 파일 필드에는 경로, `Buffer`/`Uint8Array`, `Blob`, `{ data, filename }`을 넣습니다. 파일은 한 번만 읽어 재시도에 재사용하고, 파일 이름 확장자로 content type을 정합니다. JSON 파트(예: `rcs.brands.update`의 `regBrand`)는 자동으로 직렬화합니다.
- 같은 이름의 편의 메서드가 있으면 편의 메서드가 우선합니다(`send.omni`, `files.uploadMms` 등).
- 모든 operation의 메타데이터(메서드, 경로 템플릿, 재시도, 속도 제한 버킷)는 `OPERATIONS`로 export됩니다.

### 상담톡 웹훅

`WebhookReceiver`에는 스펙의 웹훅마다 메서드가 있습니다: `report`, `mo`, `counselMessage`, `counselReference`, `counselExpiredSession`, `counselSeenInfo`, `counselPersonalInfo`, `counselCertResult`, `counselResult`.

상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 상담톡 메서드는 서명 헤더(`X-IB-Timestamp`, `X-IB-Signature`)를 요구하거나 검사하지 않고, 헤더가 와도 무시합니다. 본문 크기(최대 1MB)·JSON 깊이(최대 64)·형식만 검사한 뒤 타입이 붙은 payload를 돌려줍니다. 리포트·MO 웹훅은 항상 서명이 필요합니다.

웹훅 secret이 없어도 상담톡 웹훅을 받을 수 있습니다. `parseWebhook(name, body)`는 secret 없이 같은 검사를 하고 타입이 붙은 payload를 돌려줍니다.

```ts
import { counselAck, parseWebhook } from '@bizgo/bizgo-sdk-comm-js/webhooks';

// <등록한 웹훅 URL>/cstalk/message — secret이 필요 없습니다
const message = parseWebhook('counselMessage', rawBody); // CounselMessageWebhookPayload
res.status(200).json(counselAck()); // {"code": "A000", "result": "Success"} (리포트·MO의 {"msgKey"}와 다름)
```

리포트·MO도 함께 받는다면 `WebhookReceiver` 하나로 모두 처리할 수 있습니다(상담톡 메서드는 secret을 쓰지 않습니다).

```ts
import { WebhookReceiver } from '@bizgo/bizgo-sdk-comm-js/webhooks';

const secret = process.env.BIZGO_WEBHOOK_SECRET;
if (!secret) throw new Error('BIZGO_WEBHOOK_SECRET이 없습니다');
const receiver = new WebhookReceiver(secret);

const message = receiver.counselMessage(req.headers, rawBody); // 서명 검사 없음, 본문 검사만
res.status(200).json(receiver.counselAck());
```

- 본문 검사에 실패하면 `WebhookVerificationError`가 납니다(HTTP 400으로 응답).
- 모든 웹훅 엔드포인트와 마찬가지로 HTTPS로 받고 비즈고 웹훅 발신 IP만 허용하세요. 재전송될 수 있으므로 `msgKey`가 있으면 그것으로 중복 처리합니다.
- 상담톡 본문에는 사용자 식별자, 상담 내용, (개인정보 웹훅은) 전화번호가 들어 있습니다. 로그·APM·오류 리포트에 남기지 마세요.

## 대량 발송

`send.bulk()`는 수신자 수에 제한이 없습니다. `chunkSize`(1~200, 기본 200)씩 나눠 `send.omni`를 호출하고, 동시에 `concurrency`(기본 4)개까지 보냅니다.

```ts
import { alimtalk, sms } from '@bizgo/bizgo-sdk-comm-js';

const result = await client.send.bulk({
  to: recipients, // 1만 명도 가능
  messages: [
    alimtalk({ senderKey: 'SENDER_KEY_EXAMPLE', templateCode: 'TEMPLATE_CODE', msgType: 'AT', text: '안내입니다.' }),
    sms({ from: '01000000000', text: '안내입니다.' }),
  ],
  idempotencyKeyPrefix: 'campaign-1', // 청크 키: campaign-1-<chunkSize>-<시작 인덱스>-<수신번호 해시 8자리>
});
console.log(result.msgKeys.length, result.failed.length); // 전체 합계
for (const e of result.errors) console.log(e.chunkIndex, e.fromIndex, e.toIndex, e.error.name); // 실패한 청크 (수신자 인덱스 범위)
```

- 모든 청크를 **먼저 검증**한 뒤 보냅니다. 검증 오류 경로는 입력 목록 기준(`to[403].to`)입니다.
- 한 청크가 실패해도 나머지는 계속 보냅니다. `results`(청크별 `SendResult`), `errors`(청크 번호·수신자 범위·예외), `succeeded`/`failed`/`duplicates`/`msgKeys`(전체 합계), `complete`를 봅니다.
- `idempotencyKeyPrefix`가 있으면 청크마다 `<prefix>-<chunkSize>-<시작 인덱스>-<hash8>` 키로 보냅니다(`hash8` = 청크 수신번호 목록(순서 포함)의 SHA-256 앞 8자리, 모든 비즈고 SDK가 같은 공식). 청크마다 `idempotencyTtl`(지정하지 않으면 86400)도 함께 보냅니다. 타임아웃·5xx도 재시도하며, 없으면 429만 재시도합니다.
- **재실행은 같은 목록·같은 `chunkSize`·같은 prefix로** 하세요(멱등성 TTL 안에서). 이미 접수된 수신자는 중복 발송되지 않고 수신자별 코드 `A301`로 `duplicates`에 들어갑니다(`failed`·`errors`가 아니며, 수신자가 모두 `A301`인 청크도 오류가 아님). 목록이나 `chunkSize`를 바꾸면 키가 달라지므로(다른 수신자 묶음에 키가 재사용되는 일은 없음) 중복 방지가 되지 않습니다. 실패한 청크만 다시 보내려면 `errors`의 `chunkIndex`/`fromIndex`/`toIndex`로 그 수신자만 골라 보내세요.
- 생성된 키는 200자 이하여야 합니다(긴 prefix는 보내기 전에 오류).
- 수신자 번호는 오류·`toString()`에 들어가지 않습니다(인덱스만).

## 속도 제한

비즈고의 기본 호출 한도는 **발송 API 초당 200 메시지(수신번호 기준), 그 외 API 초당 5 요청**입니다(넘으면 429 / A020). 클라이언트는 인스턴스마다 토큰 버킷 두 개로 속도를 미리 맞춥니다(기본 켜짐). 토큰이 모자라면 이벤트 루프를 막지 않고 기다리며, 재시도도 시도마다 다시 기다립니다.

| 버킷 | 기본값 | 요청 1건의 비용 | 쓰는 operation |
|---|---|---|---|
| `send` | 초당 200 메시지 | 요청의 수신자(`destinations`) 수, 최소 1. 수신자 목록이 없는 발송(상담톡, 친구 그룹 대상 동보)은 1 | 스펙에서 `x-sdk-rate: send`가 붙은 operation만: `sendOmni`(`send.omni/request/sms/lms/mms/bulk`), `createReservation`, `addReservationRecipients`, `createBrandMessageGroupSend`, `sendCounselPlain`, `sendCounselRich` |
| `other` | 초당 5 요청 | 1 | 그 밖의 모든 operation |

- 수신자 200명짜리 요청은 토큰 200개를 쓰므로 초당 1건만 나갑니다. `send.bulk()`로 1,000명을 보내면 200명씩 5건이 약 1초 간격(약 4~5초)으로 나갑니다.
- 버킷 용량은 초당 한도와 같습니다. 한도를 요청 크기보다 낮게 잡아도(예: `send: 100`에 200명 요청) 멈추지 않습니다: 버킷이 가득 찰 때 보내고 부족분은 빚으로 남겨 평균 속도를 지킵니다.
- operation별 버킷은 `OPERATIONS[id].rate`에서 볼 수 있습니다.

```ts
import { Bizgo } from '@bizgo/bizgo-sdk-comm-js';

new Bizgo({ rateLimit: { send: 100, other: 5 } }); // 계정 한도를 여러 서비스가 나눠 쓸 때 (send는 초당 메시지 수)
new Bizgo({ rateLimit: null });                    // 끄기 (예: 앞단에서 이미 제한하는 경우)
```

> **프로세스 하나만 맞춥니다.** 한도는 계정(API Key) 단위이므로 여러 프로세스·서버·컨테이너가 같은 키를 쓰면 이 제한만으로는 부족합니다. 인스턴스 수만큼 값을 나누거나 공유 큐·분산 rate limiter를 쓰세요. 429 자동 재시도(`Retry-After` 우선)는 그대로 동작합니다.

## SDK 식별 정보

비즈고가 SDK 사용 현황(언어·버전·런타임)을 집계할 수 있게 모든 요청에 다음 헤더를 붙입니다.

| 헤더 | 값 |
|---|---|
| `User-Agent` | `bizgo-sdk-comm-js/<SDK 버전> <node\|bun\|deno>/<런타임 버전> (<os>; <arch>)[ app/<name>-<version>]` 예: `bizgo-sdk-comm-js/1.2.0 node/22.11.0 (linux; x64) app/myshop-1.4.2` |
| `X-Bizgo-Client` | `bizgo-sdk-comm-js/<SDK 버전>` (프록시가 User-Agent를 바꿔도 남도록) |

- `<os>`는 `linux`/`windows`/`darwin`/`freebsd`/`other`, `<arch>`는 `x64`/`arm64`/`x86`/`arm`/`other`만 보냅니다. 호스트명, 사용자명, 커널 버전, IP 같은 값은 넣지 않으며, **이 헤더 외에 SDK가 따로 수집하거나 전송하는 정보는 없습니다**(phone-home 없음).
- 앱 정보(선택): `new Bizgo({ appInfo: { name: 'myshop', version: '1.4.2' } })`. `name`은 영문·숫자·`._-` 1~50자, `version`은 영문·숫자·`._+-` 1~30자만 허용하고 그 밖(공백, 줄바꿈, `@` 등)이면 `ConfigurationError`입니다. 이메일·전화번호 같은 값은 넣지 마세요.
- `Authorization`, `User-Agent`, `X-Bizgo-Client`는 옵션, 사용자 `fetch`, 스펙 헤더 파라미터(예: `kakao.senders.create`의 `token`)로 바꿀 수 없습니다.

## 테스트

`@bizgo/bizgo-sdk-comm-js/testing`으로 네트워크·API Key 없이 SDK를 쓰는 코드를 테스트합니다. 운영 코드에서는 import할 필요가 없습니다.

```ts
import { Bizgo, RateLimitError } from '@bizgo/bizgo-sdk-comm-js';
import { FakeFetch, signWebhook } from '@bizgo/bizgo-sdk-comm-js/testing';

const fake = new FakeFetch();
const client = new Bizgo(fake.clientOptions()); // 가짜 키(test-api-key-not-real), sandbox URL, 속도 제한 끔

await client.send.sms({ to: '01000000000', from: '01000000000', text: 'hello' }); // 기본: 수신자마다 A000 + 가짜 msgKey
expect(fake.lastRequest?.operationId).toBe('sendOmni');
expect(fake.lastRequest?.json).toMatchObject({ destinations: [{ to: '01000000000' }] });

fake.on('sendOmni').fail('service', 200, 'A020');      // 다음 호출: RateLimitError
fake.on('sendOmni').sendResult('A000', 'A306');        // 그다음: 두 번째 수신자 거절
fake.on('GET', '/api/comm/v1/report/inquiry/{msgKey}').data({ report: [] });
fake.on('getReportPolling').networkError();            // .timeout(), .respond(status, json, headers)도 있음

const { headers, body } = signWebhook('test-webhook-secret', payload); // WebhookReceiver 테스트용 서명 요청
```

- 요청은 operation, method, 경로, 쿼리, JSON 본문(multipart는 필드와 파일 크기)으로 기록됩니다. **헤더 값(API Key 포함)은 기록하지 않습니다.**
- 스텁이 없으면 성공 봉투로 답합니다. 발송(`sendOmni`, `createReservation`, `addReservationRecipients`)은 수신자마다 `A000`과 가짜 `msgKey`, `createReservation`은 가짜 `resvKey`도 돌려주고, 그 밖의 operation은 `data.data = {}`(빈 목록)입니다. 모르는 경로는 404입니다.
- 스텁은 호출 순서대로 쓰이고 마지막 스텁이 반복됩니다. `fake.reset()`으로 초기화합니다.

## 관측(Observability)

`hooks` 옵션으로 호출마다 시작·종료 콜백을 받습니다. 재시도를 포함한 한 호출에 `onRequestStart`와 `onRequestEnd`가 한 번씩, **같은 event 객체**로 호출됩니다.

```ts
import { Bizgo } from '@bizgo/bizgo-sdk-comm-js';

const observed = new Bizgo({
  hooks: {
    onRequestEnd(e) {
      // e.operationId 'getReportInquiry', e.operation 'reports.inquiry', e.method 'GET',
      // e.pathTemplate '/api/comm/v1/report/inquiry/{msgKey}', e.status, e.layer, e.code, e.errorType,
      // e.attempts, e.durationMs, e.success
      metrics.histogram('bizgo_request_ms', e.durationMs, { op: e.operation, status: String(e.status) });
    },
  },
});
```

- event에는 **경로 템플릿**만 들어가고 본문, 쿼리, 헤더 값, 실제 경로 값, 전화번호, API Key는 들어가지 않습니다.
- hook에서 예외가 나도 요청에는 영향이 없습니다(무시). 여러 hook은 `combineHooks(a, b)`로 묶습니다.

**OpenTelemetry** — `@bizgo/bizgo-sdk-comm-js/otel` 어댑터를 씁니다. `@opentelemetry/api`는 **선택 peer 의존성**이라 필요한 경우에만 직접 설치합니다(core 패키지의 런타임 의존성은 여전히 없음).

```bash
npm install @opentelemetry/api
```

```ts
import { Bizgo } from '@bizgo/bizgo-sdk-comm-js';
import { openTelemetryHooks } from '@bizgo/bizgo-sdk-comm-js/otel';

const traced = new Bizgo({ hooks: openTelemetryHooks() }); // 또는 openTelemetryHooks({ tracer })
```

호출마다 CLIENT span 하나(`bizgo <resource>.<method>`, 예: `bizgo send.omni`)를 만들고 `http.request.method`, `url.template`, `bizgo.operation_id`, `http.response.status_code`, `bizgo.code`, `bizgo.layer`, `bizgo.retry_count`, 실패 시 `error.type`을 남깁니다.

## 오류 처리

```ts
import * as bizgo from '@bizgo/bizgo-sdk-comm-js';

try {
  await client.send.omni({ to: '01000000000', messages: [bizgo.sms({ from: '01000000000', text: '안내입니다.' })] });
} catch (error) {
  if (error instanceof bizgo.ValidationError) { /* 보내기 전 검증 실패. error.issues */ }
  else if (error instanceof bizgo.AuthenticationError) { /* 키가 틀렸거나 IP가 등록되지 않음 */ }
  else if (error instanceof bizgo.RateLimitError) { /* 자동 재시도 후에도 한도 초과. error.retryAfter */ }
  else if (error instanceof bizgo.DuplicateRequestError) { /* 같은 idempotencyKey가 이미 접수됨 (다시 발송되지 않음). 재시도 뒤면 error.alreadyAccepted */ }
  else if (error instanceof bizgo.APIError) { /* 그 밖의 거절. error.code, error.layer, error.description, error.trackingId */ }
  else if (error instanceof bizgo.APIConnectionError) { /* 네트워크 오류. 발송은 접수됐을 수도 있음 → 상태 조회로 확인 */ }
  else if (error instanceof bizgo.InvalidResponseError) { /* 응답을 해석하지 못함(비 JSON, 16MB 초과, 리다이렉트 등). 발송은 접수됐을 수도 있음 */ }
  else throw error;
}
```

```
BizgoError
├── ConfigurationError        키 없음, http base URL, 알 수 없는 옵션
├── ValidationError           보내기 전 검증 실패 (issues: {path, message}[])
├── APIConnectionError        └── APITimeoutError
├── APIError {httpStatus, code, layer, serverMessage, description, trackingId, body}
│   ├── BadRequestError (400)  AuthenticationError (401)  PermissionDeniedError (403)  NotFoundError (404)
│   ├── DuplicateRequestError (A301)  RateLimitError (429/A020, retryAfter)  InternalServerError (5xx)
├── InvalidResponseError
└── WebhookVerificationError
```

- 응답은 두 단계로 판정합니다: `common.authCode`(게이트웨이: 인증·형식) → `data.code`(상품 처리). `error.layer`가 `'gateway'`/`'service'`입니다. 같은 코드라도 단계마다 뜻이 다릅니다(예: service `A401`은 paymentCode 오류).
- `error.message`는 `HTTP 400 | service code=A306 | <서버 메시지> | <코드 설명> | infobankTrId=...` 형식입니다.
- 재시도(타임아웃·연결 오류·5xx·429) 뒤에 `A301`을 받으면 `DuplicateRequestError.alreadyAccepted === true`입니다. 이전 시도가 이미 접수된 것이니 다시 보내지 말고 상태를 조회하세요.
- `InvalidResponseError`는 응답을 해석하지 못했을 때(JSON 아님, 압축 해제 후 16MB 초과, 중첩 64단계 초과, 3xx 리다이렉트)입니다. `httpStatus`, `trackingId`, `body`(열거 불가, 응답 원문)가 있고, 발송 요청이면 "접수됐을 수 있음" 안내가 메시지에 들어갑니다.
- 오류는 `JSON.stringify(error)`로 직렬화하고 `BizgoError.fromJSON(json)`으로 같은 클래스·필드로 되살릴 수 있습니다(작업 큐·워커용, `body`는 제외). `structuredClone`/`postMessage`는 사용자 정의 오류 클래스를 보존하지 않으니 JSON을 쓰세요.
- 결과 객체(`SendResult`, `ReportBatch`, 조회 결과, 웹훅 payload)를 `console.log`로 찍으면 가려서 나옵니다: 전화번호는 11자리 이상이면 `010****0000`, 8~10자리는 앞 3자리만 남기고 절반 이상, 7자리 이하는 전부; 이름·닉네임·이메일은 첫 글자만; 본문(`content`, `text`, `message`, `replaceWords` 등)은 길이만; 토큰·키는 `[hidden]`. 속성 값과 `JSON.stringify(result)`는 원래 값 그대로입니다(저장하려고 직렬화하는 경우를 위해). 요청 params나 쿼리 객체를 로그에 남길 때는 같은 규칙의 `redact(params)`를 쓰세요(입력은 바꾸지 않음).
- 성공 응답에 데이터(`data.data`)가 없거나 `null`이어도 결과는 `null`/`undefined`가 아니라 빈 객체(목록은 `[]`)입니다. 결과가 원래 없는 operation(삭제, 수신 확인 등)만 `undefined`입니다.
- 발송 요청이 성공해도 **일부 수신자는 거절될 수 있습니다.** 항상 `result.failed`를 확인하세요.
- 같은 `idempotencyKey`로 다시 보내면 요청은 성공(HTTP 200)하고, 이미 접수됐던 수신자는 수신자별 코드 `A301`로 `result.duplicates`에 들어갑니다. `failed`도 `succeeded`도 아니며 다시 발송되지 않습니다(이전 요청의 메시지가 처리 중). 그래서 같은 키로 재시도해도 안전합니다. 요청 전체가 `A301`로 거절되면 기존대로 `DuplicateRequestError`입니다.

## 재시도와 타임아웃

| 요청 | 자동 재시도 |
|---|---|
| 조회, 리포트 수신 확인 | 429, 500/502/503/504, 네트워크 오류 |
| 발송 (`idempotencyKey` 있음) | 429, 500/502/503/504, 네트워크 오류 |
| 발송 (`idempotencyKey` 없음), 업로드 | 429만 (중복 발송 방지) |
| 생성된 메서드 ([전체 API](#전체-api)) | 스펙의 `x-sdk-retry`: `safe`는 429·5xx·네트워크 오류, `rate_limit_only`는 429만 |

기본값은 최대 2회 재시도(지수 백오프 0.5·1·2…초, 최대 8초, ±25% jitter, `Retry-After` 우선·최대 60초), 시도당 타임아웃 30초입니다.
네트워크 오류 뒤 재시도한 발송이 요청 단위 `A301`을 받으면 "이전 시도가 이미 접수됨"을 알리는 `DuplicateRequestError`가 납니다. 수신자별 `A301`은 오류가 아니라 `result.duplicates`입니다.

```ts
import { Bizgo } from '@bizgo/bizgo-sdk-comm-js';

new Bizgo({ maxRetries: 3, timeoutMs: 10_000 });
new Bizgo({ fetch: myFetch, trustFetch: true }); // 사용자 fetch는 명시적 허용이 필요 (아래 참고)
new Bizgo({ logger: { debug: (line: string) => log.debug(line) } }); // "POST /api/comm/v1/send/omni -> 200 (85 ms, attempt 1)"
```

### 프록시·사내 CA와 사용자 fetch

기본은 Node.js 전역 `fetch`입니다. 프록시나 사내 CA 때문에 fetch를 바꾸기 전에 Node.js 자체 설정을 먼저 쓰세요(SDK 옵션이 아니라 프로세스 설정이며, TLS 검증은 그대로 켜져 있습니다).

| 필요 | Node.js 설정 |
|---|---|
| 사내 CA 인증서 추가 | `NODE_EXTRA_CA_CERTS=/path/ca.pem` (프로세스 시작 시 읽음) 또는 `node --use-system-ca` |
| HTTP(S) 프록시 | `NODE_USE_ENV_PROXY=1`(또는 `node --use-env-proxy`) + `HTTPS_PROXY`/`NO_PROXY` (지원 버전은 Node.js 문서 확인) |

그래도 사용자 `fetch`를 넘겨야 하면 `trustFetch: true`를 함께 줘야 합니다. 없으면 `ConfigurationError`입니다. SDK는 사용자 fetch를 점검할 수 없으므로, `trustFetch: true`는 **그 fetch가 리다이렉트를 따르지 않고, 스스로 재시도하지 않고, 인증·쿠키를 바꾸지 않고, TLS 검증을 끄지 않는다**는 보증입니다. 어기면 중복 발송(SDK 멱등성 규칙을 벗어난 재전송)과 API Key 유출(리다이렉트된 요청에 `Authorization` 헤더가 실림) 위험을 떠안습니다. SDK는 여전히 `redirect: 'manual'`을 넘기고 3xx를 재시도하지 않습니다. 테스트용 `FakeFetch`(`/testing`)는 네트워크에 나가지 않으므로 이 허용 없이 쓸 수 있습니다.

## 보안

- API Key는 **접두어 없이** 키 값만 씁니다(`Bearer`/`ApiKey` 접두어는 401). 환경변수나 시크릿 저장소에서 읽고, 코드·저장소·브라우저·앱에 넣지 않습니다.
- 키는 인스턴스의 private 필드에만 있고 `toString()`, `util.inspect()`, `JSON.stringify()`, 로그, 오류 메시지에 나오지 않습니다.
- SDK는 기본적으로 아무것도 출력하지 않습니다. `logger`를 넘기면 `METHOD path -> status (ms, attempt n)`만 남깁니다(키, 본문, 쿼리 문자열, 전화번호 없음). `hooks`/OpenTelemetry에는 경로 템플릿만 넘어갑니다.
- 스펙의 헤더 파라미터(예: 카카오 채널 인증 `token`, 관리자 `phoneNumber`)는 헤더로만 보내고 로그·hook·테스트 기록에 남기지 않습니다. `Authorization`, `User-Agent`, `X-Bizgo-Client` 등 SDK가 정하는 헤더는 바꿀 수 없고 CR/LF가 든 값은 거절합니다.
- 요청에 붙는 식별 정보는 [SDK 식별 정보](#sdk-식별-정보)의 두 헤더뿐입니다.
- 상담톡 웹훅의 서명 정책은 [상담톡 웹훅](#상담톡-웹훅)을 보세요.
- `APIError.body`에는 응답 원문(전화번호 포함 가능)이 있습니다. `console.log(error)`에는 나오지 않지만(열거 불가 속성), 직접 로그에 남기지 마세요.
- `http://` base URL은 거부합니다(테스트용 localhost 제외). 리다이렉트는 따르지 않으므로 키가 다른 호스트로 가지 않고, 3xx는 재시도 없이 `InvalidResponseError`(`HTTP 302` 등)입니다. SDK에는 TLS 검증을 끄는 옵션이 없지만, `fetch` 옵션으로 넘긴 fetch의 TLS 설정은 그대로 적용됩니다([SECURITY.md](SECURITY.md)).
- API Key는 출력 가능한 ASCII만 받습니다. 앞뒤 공백·줄바꿈(파일에서 읽은 키의 끝 줄바꿈 등)은 잘라내지 않고 `ConfigurationError`로 알립니다.
- 응답은 압축 해제 후 16MB, JSON 중첩 64단계까지만 받습니다. 웹훅 본문은 1MB, 중첩 64단계, timestamp 1~16자리 숫자까지입니다.
- 사용자 `logger`·`hooks`(async 포함)에서 난 예외는 SDK가 삼킵니다. 콜백이 실패해도 요청 결과는 그대로입니다.
- 업로드 파일을 읽지 못하면 `ValidationError`(파일 이름과 `ENOENT` 같은 코드만, 전체 경로는 넣지 않음)입니다.
- **런타임**: Node.js 18+(주 대상), Bun, Deno(`npm:` + node 호환)에서 동작합니다. 웹훅 검증(`./webhooks`)과 대량 발송 키는 `node:crypto`/`node:buffer`를 쓰며, `./webhooks`는 루트와 같은 모듈이라(클래스가 같아 `instanceof`가 맞도록) 루트 전체를 불러옵니다. 브라우저·엣지 런타임은 지원하지 않습니다(키를 브라우저에 두면 안 되므로).
- 사용자가 지정한 URL로 요청을 보내는 기능은 없습니다(1.0.x의 웹훅 "발송" 기능은 키를 임의 URL로 보낼 수 있어 제거했습니다).
- 취약점 신고는 [SECURITY.md](SECURITY.md)를 참고하세요.

## 1.0.x에서 옮기기

1.2.0은 [비즈고 API 스펙](https://github.com/icomm-api/bizgo-api-spec)에 맞춰 새로 작성했습니다. 주요 변경(모두 호환되지 않음):

| 1.0.x | 1.2.0 |
|---|---|
| `new Bizgo(new BizgoOptionsBuilder().setBaseURL('https://mars.ibapi.kr/api/comm').setApiKey(...).build())` | `new Bizgo({ apiKey?, environment? })`. 키는 기본으로 `BIZGO_API_KEY`에서 읽고, base URL은 `/api/comm` 없이 `Environment`로 고름 |
| `apiKey`로 만들면 `send`만 생기고 나머지 모듈은 `undefined` | 모든 리소스(`send`, `files`, `reports`, `messages`)를 항상 씀 |
| 모듈마다 다른 헤더(`Bearer `, `ApiKey ` 접두어) | `Authorization: <키>` 하나로 통일 (접두어 없음, sandbox 확인) |
| ID/PW 토큰 발급(`bizgo.auth.getToken()`, `setToken`) | 제거. API Key만 씀 |
| `SMSBuilder`, `OMNIRequestBodyBuilder`, `DestinationBuilder` 등 빌더(필수값 검증 없음) | 일반 객체 + 채널 헬퍼 `sms()`, `alimtalk()` 등. 보내기 전에 스펙 기준으로 검증 |
| `bizgo.send.OMNI(body)` | `client.send.omni({ to, messages })`, `send.request(body)`, `send.sms/lms/mms()` |
| `bizgo.file.uploadFile({serviceType, msgType, subType}, formData)` (JSON Content-Type으로 multipart가 깨짐) | `client.files.uploadMms/uploadRcs/uploadBrandMessage(file)` (경로·Buffer·Blob, multipart 자동) |
| `bizgo.polling.getReport()`, `deleteReport(id)` | `client.reports.poll()`, `ack(id)`, `consume(handler)` |
| `bizgo.report.getDetailReport(msgKey)` | `client.reports.inquiry(msgKey)` |
| `bizgo.messageStatus.getMessageStatusByMsgKey/RequestId` | `client.messages.status()`, `statusByRequestId()` |
| `bizgo.statistics.getStatistics({...})` | `client.messages.statistics({...})` |
| `bizgo.sendHistory.getSendHistory({startDate, pageNo, pageSize})` (`/v1/message/sendHistory`, 스펙에 없는 경로) | `client.messages.history({ requestTime, lastSeq, limit })`, `iterHistory()` (`/message/history`, 커서 방식) |
| `bizgo.webhook.getWebhook({userURL}, body)` (사용자 URL로 Authorization 헤더를 POST) | 제거. 수신 측 `WebhookReceiver`, `verifySignature()` 제공 |
| axios 응답을 그대로 반환, 오류는 `console.error` 후 AxiosError | 결과 객체(`SendResult`, `ReportBatch`, ...) 반환, 오류는 `BizgoError` 계층. 콘솔 출력 없음 |
| 재시도·타임아웃 없음 | 재시도 정책과 시도당 30초 타임아웃 |
| 핵심 타입 미export, `main` 경로 오류(`require` 실패) | 모든 타입 export, ESM/CJS `exports` 맵 |
| 의존성 `axios`, `flatted`, `circular-json`, 라이선스 표기 ISC/Apache 불일치 | 런타임 의존성 없음(Node 18+ 전역 fetch), Apache-2.0 |

1.0.x는 git 기록과 npm의 1.0.0/1.0.1/1.0.3 버전에 남아 있습니다. 계속 쓰려면 `1.0.3`으로 고정하세요.

## 개발

```bash
npm ci
npm test                  # vitest. 전부 mock fetch로 실행(네트워크·API Key 불필요)
npm run lint              # biome
npm run typecheck         # tsc --strict (src, test, examples)
npm run build             # tsup → dist/ (ESM + CJS + .d.ts)
npm run smoke:pack        # npm pack 결과를 설치해 import/require/타입 확인 (루트, /webhooks, /testing, /otel)
npm run generate          # spec/openapi.yaml이 바뀌었을 때 타입·검증 규칙·리소스 메서드·웹훅 파서 재생성
npm run generate:check    # 생성 결과가 커밋과 같은지 (CI)
```

배포는 `v*` 태그를 push하면 [release 워크플로](.github/workflows/release.yml)가 npm Trusted Publishing(OIDC)과 provenance로 게시합니다(필수 승인자 확인 후). 저장소에 npm 토큰은 없습니다. 사전 설정은 워크플로 파일 머리말에 있습니다.

예제는 [examples/](examples/)에 있습니다. AI 코딩 도구로 이 저장소를 수정할 때의 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.
SDK를 **사용하는** 코드를 AI로 작성할 때는 [llms.txt](llms.txt)를 컨텍스트로 넣으면 정확도가 높아집니다.

## 라이선스

[Apache-2.0](LICENSE)
