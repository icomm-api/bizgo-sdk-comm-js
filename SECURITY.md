# 보안 정책

## 취약점 신고

보안 취약점은 **공개 Issue로 올리지 마세요.** GitHub의 [Private vulnerability reporting](../../security/advisories/new)으로 비공개 신고해 주세요.
확인 후 영업일 기준 5일 안에 답변합니다.

지원 버전: 최신 minor 버전(현재 1.2.x)에 보안 수정을 제공합니다. 1.0.x는 지원하지 않습니다.
1.0.x의 웹훅 모듈은 Authorization 헤더를 사용자 지정 URL로 보내므로 1.2.x로 옮기세요.

## 자격 증명이 노출됐을 때

1. 즉시 비즈고 콘솔 `발송관리 > 연동관리`에서 해당 API Key를 폐기하고 새로 발급합니다. 저장소 기록에서 지워도 이미 복제됐을 수 있으므로 **폐기가 먼저**입니다.
2. 웹훅 secret은 비즈고에 재발급을 요청합니다.
3. 허용 IP(ACL) 목록을 점검합니다.

## SDK의 보안 동작

- API Key는 `Authorization` 헤더로만 보내고, 인스턴스의 private 필드에만 둡니다. `toString()`·`util.inspect()`·`JSON.stringify()`·로그·예외 메시지에 넣지 않습니다.
- 기본적으로 아무것도 출력하지 않습니다. `logger`를 넘기면 `METHOD path -> status (ms, attempt n)`만 남깁니다. 요청 본문과 쿼리 문자열(전화번호가 들어갈 수 있음)은 남기지 않습니다.
- 검증 오류에는 필드 경로와 이유만 담고 입력값을 담지 않습니다. fetch 오류는 URL을 담을 수 있어 `cause`로 연결하지 않습니다.
- `APIError.body`에는 응답 원문이 있습니다. 열거 불가 속성이라 `console.log(error)`에는 나오지 않지만, 전화번호가 있을 수 있으니 직접 로그에 남기지 마세요.
- https가 아닌 base URL(테스트용 localhost 제외)과 사용자 정보·쿼리·fragment가 들어간 base URL은 거부합니다. 리다이렉트는 따르지 않고(`redirect: 'manual'`), 3xx를 받으면 재시도 없이 `InvalidResponseError`(`HTTP <status>`)로 알립니다.
- **TLS**: SDK 자체에는 TLS 검증을 끄는 옵션이 없습니다. 기본은 Node.js 전역 `fetch`(검증 켜짐)입니다. 사내 CA·프록시는 Node.js 설정(`NODE_EXTRA_CA_CERTS`, `--use-system-ca`, `NODE_USE_ENV_PROXY` + `HTTPS_PROXY`)으로 해결하세요. 검증은 켜진 채로 동작합니다.
- **사용자 fetch는 명시적 허용이 필요합니다**(`trustFetch: true`, 없으면 설정 오류). SDK는 사용자 fetch를 점검할 수 없어서, 허용하면 **그 fetch의 TLS 설정이 그대로 적용**되고(`rejectUnauthorized: false`, `NODE_TLS_REJECT_UNAUTHORIZED=0`이면 검증이 꺼짐), 그 fetch가 리다이렉트를 따르거나 스스로 재시도하거나 인증을 바꾸면 API Key 유출·중복 발송이 생길 수 있습니다. 이 위험은 허용한 쪽이 집니다. 테스트 도구의 `FakeFetch`는 예외입니다(네트워크 없음).
- 응답은 압축 해제 후 16MB까지만 읽고, JSON 중첩은 64단계까지만 받습니다(웹훅도 같음). 넘으면 `InvalidResponseError`/`WebhookVerificationError`입니다.
- API Key는 출력 가능한 ASCII(`^[\x21-\x7e]+$`)만 받고, 앞뒤 공백·줄바꿈을 조용히 잘라내지 않고 설정 오류로 알립니다.
- 결과·응답·웹훅 객체를 `console.log`/`util.inspect`/`toString()`으로 출력하면 전화번호(길이별 규칙), 이름·닉네임·이메일(첫 글자만), 본문(길이만), 토큰·키(`[hidden]`)가 가려집니다. 요청 params·쿼리는 `redact()`로 같은 규칙을 적용해 로그에 남기세요. 값 자체와 `JSON.stringify` 결과는 그대로이므로(일부러 저장하는 경우) 로그에 JSON으로 넣지 마세요.
- 사용자 `logger`·`hooks`에서 난 예외와 async hook의 Promise 거부는 SDK가 삼킵니다. 접수된 발송 결과가 콜백 오류 때문에 사라지지 않습니다.
- 사용자가 지정한 URL로 요청을 보내는 기능이 없습니다. 모든 요청은 base URL + 고정된 API 경로로만 갑니다. 경로 파라미터는 인코딩하고 `.`/`..`은 거절합니다.
- 발송은 `idempotencyKey`가 없으면 타임아웃·5xx 후 자동 재시도하지 않습니다(중복 발송 방지).
- 웹훅 서명은 길이를 확인한 뒤 `crypto.timingSafeEqual`로 비교하고, timestamp 허용 오차(기본 300초, 0보다 큰 유한한 값 또는 명시적 `null`만 허용)를 벗어난 오래된 요청을 거부합니다. timestamp는 1~16자리 숫자만 받고, 공백뿐인 secret은 거부합니다. 본문은 최대 1MB입니다. 서명은 리포트·MO 웹훅에만 적용되며, 상담톡 웹훅에는 서명이 없어 본문 크기·JSON 깊이·형식 검사만 합니다.
  운영 환경에서는 HTTPS, 발신 IP 허용 목록, `msgKey` 기준 중복 제거를 함께 적용하고, 중요한 판단은 조회 API로 결과를 확인하세요.
- 이 SDK는 서버용입니다. API Key를 브라우저·앱 번들에 넣지 마세요.

## 공급망

- 런타임 의존성이 없습니다(`dependencies` 비어 있음). 개발 의존성은 `package-lock.json`으로 고정하고 CI는 `npm ci --ignore-scripts`로 설치합니다.
- npm 배포는 GitHub Actions에서 OIDC(Trusted Publishing)와 `--provenance`로만 하며, 저장소에 npm 토큰을 두지 않습니다. 배포 환경(`npm`)에는 필수 승인자가 있습니다.
- 모든 push와 PR은 gitleaks로 검사하고, 런타임 의존성은 `npm audit --omit=dev`로 검사합니다.
