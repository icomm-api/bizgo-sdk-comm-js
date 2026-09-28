# AGENTS.md — bizgo-sdk-comm-js

AI 코딩 도구와 기여자가 이 저장소를 수정할 때 따르는 규칙입니다. SDK를 *사용하는* 코드를 쓸 때는 [llms.txt](llms.txt)를 보세요.
동작 규약은 [bizgo-api-spec의 SDK-DESIGN.md](https://github.com/icomm-api/bizgo-api-spec/blob/main/docs/SDK-DESIGN.md)이며, 참조 구현은 Python SDK입니다. 언어 관례에 맞게 이름은 바꾸되 동작은 같아야 합니다.

## 명령

```bash
npm ci
npm test                  # vitest. 전부 mock fetch. 네트워크·API Key 불필요
npm run lint              # biome check (format + lint)
npm run typecheck         # tsc --strict
npm run build             # tsup: dist/{index,testing,otel}.{js,cjs,d.ts,d.cts}
npm run smoke:pack        # 패키징 결과 검사 (build 후, 모든 진입점 ESM+CJS+타입)
npm run generate          # 스펙 → src/generated/* (타입, 검증 규칙, operation 표, 리소스 메서드, 웹훅 파서)
npm run generate:check    # CI: 생성 결과가 커밋과 같은지
```

변경 후 위 명령이 모두 통과해야 합니다.

## 구조

```
spec/openapi.yaml, spec/error-codes.json   # bizgo-api-spec에서 복사한 스펙 (직접 수정 금지)
scripts/generate.mjs                       # 스펙 → 타입(TSDoc 포함)·검증 규칙·에러코드 표·operation 표·리소스 클래스·웹훅 파서
scripts/pack-smoke.mjs                     # npm pack → 임시 프로젝트에 설치 → import/require/타입 검사
src/
  index.ts              # 공개 API. 새 공개 이름은 여기서 export
  client.ts             # Bizgo (옵션 검증, 리소스 연결). GeneratedClient를 상속
  config.ts             # Environment, API Key·base URL 검증
  transport.ts          # 헤더, 재시도, 응답 봉투 해석, 오류 매핑, 속도 제한 대기, hooks 호출
  operation.ts          # 생성된 메서드의 런타임: 파라미터 검증, 경로 인코딩, 쿼리·헤더·본문(JSON/multipart), x-sdk-result, 페이지 순회
  rate-limit.ts         # 인스턴스별 토큰 버킷 2개(send: 초당 메시지·수신자 수 비용, other: 초당 요청)
  idempotency.ts        # DEFAULT_IDEMPOTENCY_TTL(86400), withDefaultIdempotencyTtl() — 키만 있고 TTL 없으면 채움(A309 방지)
  identity.ts           # SDK 식별 헤더(User-Agent, X-Bizgo-Client, appInfo 검증) — §2.1
  hooks.ts              # hooks 타입, combineHooks
  upload.ts             # 파일 읽기(한 번), content type, multipart 파트
  testing.ts            # ./testing 진입점: FakeFetch, signWebhook (core에서 import하지 않음)
  otel.ts               # ./otel 진입점: OpenTelemetry 어댑터 (@opentelemetry/api는 선택 peer 의존성)
  errors.ts             # 예외 계층, 코드→예외 매핑
  validation.ts         # 생성된 규칙으로 요청 검증 (EUC-KR 바이트 근사 포함)
  channels.ts           # sms(), alimtalk() 등 messageFlow 항목 헬퍼
  results.ts            # SendResult, ReportBatch, MessagePage, MoPage
  util.ts               # 날짜(KST) 변환, 경로 인코딩, limit 검사
  resources/            # 손으로 쓴 P0 리소스 send, files, reports, messages (생성된 <Root>Resource를 상속)
  webhooks.ts           # 서명 검증, 페이로드 파싱 (./webhooks 진입점도 같은 모듈)
  generated/            # 생성됨 (직접 수정 금지)
test/                   # vitest. helpers.ts의 MockServer를 fetch 옵션으로 주입
examples/               # test/examples.test.ts가 mock으로 실행
```

## 규칙

1. **생성 파일은 손으로 고치지 않습니다.** 모델을 바꾸려면 bizgo-api-spec을 고치고 `spec/`에 복사한 뒤 `npm run generate`.
2. 새 엔드포인트는 손으로 만들지 않습니다. 스펙에 operation과 `x-sdk-*` 메타데이터를 넣고 `npm run generate`하면 `client.<x-sdk-resource>.<x-sdk-method>`가 생깁니다. `test/spec.test.ts`가 스펙의 모든 operation이 도달 가능하고 method·path·재시도·페이지·속도 제한 버킷이 맞는지 표로 검사합니다. 편의 메서드가 필요할 때만 `src/resources/<root>.ts`에 손으로 쓰며, 같은 이름이면 손으로 쓴 메서드가 이깁니다(생성기가 해당 파일의 메서드 이름을 읽어 건너뜀).
   - `idempotencyKey`가 있는데 `idempotencyTtl`이 없으면 비즈고가 A309로 거절합니다. SDK는 `src/idempotency.ts`의 `withDefaultIdempotencyTtl()` 하나로 `DEFAULT_IDEMPOTENCY_TTL`(86400)을 채웁니다(키 없음 → 추가 안 함, 명시값·0 → 유지, 입력 객체는 복사). 손으로 쓴 발송은 `SendResource.#submit`(omni/sms/lms/mms/bulk/request), 생성된 operation은 본문 스키마에 두 필드가 모두 있으면 생성기가 `OPERATIONS[id].body.idempotencyTtl = true`를 넣고 `operation.ts`의 `prepare()`가 적용합니다(`test/idempotency.test.ts`). 메서드마다 따로 채우지 않습니다.
   - 조건부 필수(`x-sdk-required-if`, SDK-DESIGN.md §4)는 생성기가 요청 스키마의 확장을 형식 검사한 뒤 `SCHEMAS[name].requiredIf`(`{ when: { field, op, values }, required?, requiredPaths? }`)로 내보내고, `src/validation.ts`의 `Validator` 하나가 모든 요청(타입 모델·일반 객체 본문, 손으로 쓴 발송·생성된 operation)에 적용합니다. `$.` 경로는 `validate()`에 넘긴 요청 본문 루트 기준이며, 루트 스키마에 첫 속성이 없으면 건너뜁니다. 오류는 경로와 조건만(값 없음), 이미 보고한 누락 경로는 다시 보고하지 않습니다. 규칙을 SDK에 하드코딩하지 않습니다(`test/required-if.test.ts`).
   - send 버킷은 스펙의 `x-sdk-rate: send`만으로 정합니다(SDK-DESIGN.md §11.5, SDK에 목록을 하드코딩하지 않음). 생성된 `OPERATIONS[id].rate`에 들어가고, `test/rate-limit.test.ts`가 스펙 태그와 같은지 검사합니다. send 비용은 요청의 `destinations` 수(최소 1), other는 요청마다 1입니다(§11.2).
3. 공개 메서드는 `async`이고, 인자가 둘 이상이면 옵션 객체 하나로 받으며 `checkOptions()`로 알 수 없는 옵션을 거절합니다. 반환 타입은 생성 타입이나 `results.ts`의 타입입니다.
4. 재시도 정책: 조회·DELETE는 `'safe'`, 발송은 `idempotencyKey`가 있을 때만 `'safe'`, 업로드와 그 밖의 생성 요청은 `'rateLimitOnly'`. 생성된 메서드는 스펙의 `x-sdk-retry`(`safe` → `'safe'`, `rate_limit_only` → `'rateLimitOnly'`)를 그대로 씁니다.
5. 런타임 의존성은 추가하지 않습니다(`dependencies` 없음). `@opentelemetry/api`는 `./otel`만 쓰는 선택 peer 의존성이고 core(`src/` 중 `otel.ts` 밖)에서 import하지 않습니다. Node 18에서 동작해야 합니다(예: 전역 `File`은 Node 20부터라 쓰지 않음).
6. 예제·README의 코드는 실제로 동작해야 합니다. 예제를 바꾸면 `test/examples.test.ts`도 맞춥니다.
7. 문서에 없는 동작을 가정하지 않습니다. 불확실하면 스펙에 `x-unverified`로 표시하고 bizgo-api-spec의 GitHub Issues에 알립니다.
8. hooks·OpenTelemetry에는 operationId, `resource.method`, HTTP method, **경로 템플릿**, 상태, layer/code/오류 클래스 이름, 시도 횟수, 소요 시간만 넘깁니다. 본문·쿼리·헤더 값·실제 경로 값은 넘기지 않습니다(`test/hooks.test.ts`).

## 보안 규칙 (오픈소스 저장소)

- **로그·예외에 민감정보 금지**: API Key, 요청 본문, 쿼리 문자열, 전화번호, 웹훅 secret을 logger, 예외 메시지, `toString`/`inspect`에 넣지 않습니다. fetch 오류는 URL을 담고 있으므로 `cause`로 연결하지 않습니다. 관련 테스트: `test/errors-security.test.ts`.
- 검증 오류(`ValidationIssue`)에는 필드 경로와 이유만 씁니다. 입력값을 넣지 않습니다.
- 키는 `Transport`의 `#private` 필드에만 둡니다. 인스턴스 간 공유(모듈 전역 상태) 금지.
- `APIError.body`는 열거 불가 속성으로 유지합니다(`console.log(error)`로 응답 원문이 찍히지 않게).
- TLS 검증을 끄는 옵션, `http://` base URL(localhost 제외), 리다이렉트 따라가기(`redirect: 'manual'` 유지, 3xx는 재시도 없이 오류)를 추가하지 않습니다.
- 사용자가 지정한 URL로 요청을 보내는 기능(특히 Authorization 헤더 포함)을 만들지 않습니다.
- 경로 파라미터는 `segment()`로 인코딩합니다(`.`/`..` 거절, 경로 조작 방지). 브랜드메시지 `kind`는 화이트리스트로만.
- 스펙의 헤더 파라미터는 CR/LF를 거절하고, SDK가 정하는 헤더(`Authorization`, `Accept`, `User-Agent`, `X-Bizgo-Client`, `Content-Type` 등)를 덮어쓰지 못하게 합니다. 시도마다 새 헤더 객체를 넘겨 사용자 `fetch`가 다음 시도를 바꾸지 못하게 합니다.
- 식별 헤더에는 §2.1의 거친 값(런타임·버전, os/arch 5종)과 검증된 `appInfo`만 넣습니다. 호스트명·사용자명 등은 넣지 않고, SDK가 따로 데이터를 보내는 기능(phone-home)을 만들지 않습니다.
- 리포트·MO 웹훅 서명은 `X-IB-Signature` = `HmacSHA256(secret, X-IB-Timestamp)`입니다(비즈고 확인). 다른 서명 헤더 이름이나 `sha256=` 같은 접두어는 받지 않고, 출력 인코딩은 아직 확인되지 않아 hex(대소문자 무시)·base64를 모두 허용합니다. 웹훅 secret은 비즈고에 요청해 받습니다.
- 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 상담톡 메서드는 서명을 요구·검사하지 않고(헤더가 와도 무시) 본문 크기·JSON 깊이 64·형식 검사만 합니다. secret 없는 경로는 `parseWebhook(name, body)`입니다. 서명 여부는 스펙의 헤더 파라미터로 생성기가 정합니다(`WEBHOOKS[name].signature`: `required`/`none`). 리포트·MO는 항상 서명 필수이며 이 검증을 느슨하게 바꾸지 않습니다.
- 테스트 도구(`FakeFetch`)는 헤더 값(API Key)을 기록하지 않습니다.
- SDK-DESIGN.md §12(18개 규칙)는 `test/hardening.test.ts`에 규칙별 회귀 테스트가 있습니다. 약하게 바꾸지 않습니다: 응답 16MB·JSON 깊이 64(`src/json.ts`), `redirect: 'manual'` + 3xx 재시도 없음, `Retry-After`는 0~60의 10진수만, 재시도 뒤 요청 단위 A301 → `alreadyAccepted`, 수신자별 A301 → `duplicates`(`failed`·`succeeded` 아님, bulk도 합산, `src/results.ts`), API Key `^[\x21-\x7e]+$`(trim 금지), 사용자 logger/hooks 예외·거부 삼킴, 결과 출력 시 전화번호 마스킹(`src/mask.ts`, `toJSON`은 실제 값), 오류 `toJSON`/`BizgoError.fromJSON`, 업로드 파일 오류는 `ValidationError`(파일 이름만), 대량 발송 키 `<prefix>-<chunkSize>-<startIndex>-<hash8>`(Python·Java와 같은 공식).
- 사용자 `fetch`는 `trustFetch: true` 없이 거부합니다(§12.6 일반 원칙). 테스트는 `makeClient()`(helpers.ts, `trustFetch: true`)나 `FakeFetch`(`FAKE_FETCH` 표식으로 예외)를 씁니다. 프록시·CA는 Node.js 설정으로 안내하고, TLS 검증을 끄는 옵션은 만들지 않습니다.
- 마스킹은 `src/mask.ts` 하나로 합니다(모델 inspect, `SendResult`/`ReportBatch`, 웹훅 payload, `redact()`로 params·쿼리). 새 개인정보 필드는 여기 목록에 추가합니다(`test/alignment.test.ts`).
- 성공 응답은 `null`/`undefined`를 돌려주지 않습니다(§12.19, void operation 제외). `test/alignment.test.ts`가 모든 operation을 표로 검사합니다.
- README의 모든 `ts` 코드 블록은 `test/readme.test.ts`가 `tsc --strict`로 검사합니다. 스니펫에는 import를 쓰고 `{ ... }` 같은 생략은 쓰지 않습니다.
- 테스트·예제 값은 placeholder만 씁니다: 전화번호 `01000000000`, `01000001234`, 키 `test-api-key-not-real`, `SENDER_KEY_EXAMPLE`. 실제 키·번호·발신프로필 키를 커밋하지 않습니다(gitleaks가 pre-commit·CI에서 검사).
- 테스트는 Bizgo 서버에 요청하지 않습니다. 항상 `MockServer`를 `fetch` 옵션으로 주입합니다.
