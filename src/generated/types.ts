// Generated from spec/openapi.yaml by scripts/generate.mjs. Do not edit.
// Spec: Bizgo Communication API 1.2.0
//
// Request types (every request body and everything it references) are closed: the SDK rejects unknown
// fields before sending. Response types carry an index signature because the server may add fields.

import type { UploadFile } from '../upload.js';

/**
 * 수신자 정보입니다.
 */
export interface Destination {
  /**
   * 수신번호입니다. 휴대폰 번호는 11자리 형식을 씁니다(국제메시지는 채널 규격 참고).
   */
  to: string;
  /**
   * 치환메시지 변수입니다. 본문·제목의 `#{key}`를 이 값으로 바꿉니다. 알림톡·브랜드메시지 템플릿 자동 치환 발송(`sendType`이 `template`)에서는 필수입니다(각 채널 스키마의 `x-sdk-required-if`).
   */
  replaceWords?: Record<string, string>;
  /**
   * 수신자별 참조 필드입니다. 값이 있으면 이 수신번호에는 요청 단위 `ref` 대신 이 값이 리포트에 담깁니다.
   */
  ref?: string;
}

/**
 * SMS(단문) 메시지입니다. 제목 필드는 없습니다.
 */
export interface SmsMessage {
  /**
   * 발신번호입니다. 비즈고에 미리 등록한 번호여야 합니다.
   */
  from: string;
  /**
   * SMS 본문입니다. 최대 90byte이며, 이통사 규격상 EUC-KR 범위 밖 문자는 접수 오류가 날 수 있습니다.
   *
   * 제약: 최대 90byte (EUC-KR)
   */
  text: string;
  /**
   * 이통사 전달까지 유효한 최대 시간(초)입니다. 시간이 지나면 실패 처리됩니다.
   *
   * 제약: pattern=^[0-9]+$
   */
  ttl?: string;
  /**
   * 최초 발신사업자 식별코드(9자리)입니다. 일반 고객은 입력하지 않습니다.
   */
  originCID?: string;
}

export interface SmsFlowItem {
  sms: SmsMessage;
  mms?: never;
  international?: never;
  rcs?: never;
  alimtalk?: never;
  brandmessage?: never;
  navertalk?: never;
}

/**
 * LMS(장문) 또는 MMS(이미지+장문) 메시지입니다. `fileKey`가 있으면 MMS, 없으면 LMS로 발송됩니다.
 */
export interface MmsMessage {
  /**
   * 발신번호입니다. 비즈고에 미리 등록한 번호여야 합니다.
   */
  from: string;
  /**
   * 제목입니다.
   */
  title?: string;
  /**
   * 본문입니다. 최대 2,000byte이며, 이통사 규격상 EUC-KR 범위 밖 문자는 접수 오류가 날 수 있습니다.
   *
   * 제약: 최대 2000byte (EUC-KR)
   */
  text: string;
  /**
   * 이미지 업로드(`POST /api/comm/v1/file/mms`)로 받은 파일 키입니다. MMS 발송 시 필수이며 최대 3개입니다. 이미지 순서는 보장되지 않습니다.
   *
   * 제약: minItems=1, maxItems=3
   */
  fileKey?: string[];
  /**
   * 이통사 전달까지 유효한 최대 시간(초)입니다. 시간이 지나면 실패 처리됩니다.
   *
   * 제약: pattern=^[0-9]+$
   */
  ttl?: string;
  /**
   * 최초 발신사업자 식별코드(9자리)입니다. 일반 고객은 입력하지 않습니다.
   */
  originCID?: string;
}

export interface MmsFlowItem {
  mms: MmsMessage;
  sms?: never;
  international?: never;
  rcs?: never;
  alimtalk?: never;
  brandmessage?: never;
  navertalk?: never;
}

/**
 * 국제메시지(해외 수신자 대상 문자)입니다. `messageFlow[].international` 객체로 보냅니다.
 * 본문은 UTF-8을 지원하며, 실제 단말 전달 여부와 무관하게 접수 기준으로 과금됩니다.
 *
 * 수신번호 규칙(`destinations[].to`): 국가번호를 포함한 E.164 형식에서 `+`를 뺀 숫자로 입력합니다
 * (예: `821000000000`, 길이 8~15자리). 국가번호 목록이나 국가별 길이·세그먼트(분할) 규칙은 원문에 없습니다.
 *
 * 국제문자에서는 `title`, `fileKey`를 쓸 수 없습니다(접수코드 A321).
 */
export interface InternationalMessage {
  /**
   * 발신번호입니다.
   */
  from: string;
  /**
   * 국제메시지 본문입니다. 최대 1,000자이며 UTF-8로 인코딩됩니다(글자 수 기준, 바이트 제한 아님).
   *
   * 제약: maxLength=1000
   */
  text: string;
  /**
   * 메시지 유효 시간(초)입니다. 생략하면 86400(24시간)입니다.
   * @defaultValue "86400" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  ttl?: string;
  /**
   * Sender ID, 메시지 서명을 복수로 지정하기 위한 구분자입니다. 최대 20자입니다.
   *
   * 제약: maxLength=20
   */
  clientSubId?: string;
}

export interface InternationalFlowItem {
  international: InternationalMessage;
  sms?: never;
  mms?: never;
  rcs?: never;
  alimtalk?: never;
  brandmessage?: never;
  navertalk?: never;
}

/**
 * RCS 메시지 본문입니다. 입력할 수 있는 항목은 `formatId`로 지정한 포맷에 따라 다릅니다.
 *
 * 확인 필요: 포맷별로 title/description/media 중 어떤 항목이 필수인지와 길이 제한이 문서화되어 있지 않습니다.
 */
export interface RcsBody {
  /**
   * 메시지 제목입니다.
   */
  title?: string;
  /**
   * 메시지 본문입니다.
   */
  description?: string;
  /**
   * 이미지입니다. 필드 설명은 "이미지 URL"이지만, 이미지 업로드(`POST /api/comm/v1/file/rcs`)
   * 응답의 `data.data.media` 값(미디어 키)을 넣도록 안내합니다.
   *
   * 확인 필요: 외부 이미지 URL을 직접 넣을 수 있는지, 업로드로 받은 미디어 키(maapfile://...)만 허용되는지 불명확합니다.
   */
  media?: string;
}

/**
 * 웹 링크 연결 액션입니다.
 */
export interface RcsUrlAction {
  /**
   * 웹 링크 연결 객체입니다.
   */
  openUrl: {
    /**
     * 웹 링크 URL입니다.
     */
    url: string;
  };
}

/**
 * 전화 걸기 액션입니다.
 */
export interface RcsDialerAction {
  /**
   * 전화 걸기 객체입니다.
   */
  dialPhoneNumber: {
    /**
     * 전화 번호입니다.
     */
    phoneNumber: string;
  };
}

/**
 * 지도 위치입니다.
 */
export interface RcsLocation {
  /**
   * 위도입니다.
   */
  latitude: number;
  /**
   * 경도입니다.
   */
  longitude: number;
  /**
   * 라벨입니다.
   *
   * 확인 필요: 문서 타입은 Number이지만 라벨은 문자열일 가능성이 있습니다.
   */
  label?: number;
  /**
   * 검색 내용입니다.
   */
  query: string;
}

/**
 * 지도 검색·보여주기·위치 전송 액션입니다.
 *
 * 확인 필요: 문서상 showLocation이 필수로 표시되어 있어, requestLocationPush(위치 전송)만 쓰는 경우에도 showLocation이 필요한지 불명확합니다.
 */
export interface RcsMapAction {
  /**
   * 지도 위치 표시 객체입니다.
   */
  showLocation: {
    location: RcsLocation;
    /**
     * 위치 조회 실패 시 이동할 fallback URL입니다.
     */
    fallbackUrl?: string;
  };
  /**
   * 위치 전송 요청 객체입니다.
   *
   * 확인 필요: 하위 필드가 문서화되어 있지 않습니다.
   */
  requestLocationPush?: Record<string, unknown>;
}

/**
 * 일정 등록 액션입니다.
 */
export interface RcsCalendarAction {
  /**
   * 일정 등록 객체입니다.
   */
  createCalendarEvent: {
    /**
     * 시작 시간입니다.
     *
     * 확인 필요: 시각 형식이 문서화되어 있지 않습니다.
     */
    startTime: string;
    /**
     * 종료 시간입니다.
     *
     * 확인 필요: 시각 형식이 문서화되어 있지 않습니다.
     */
    endTime: string;
    /**
     * 일정 제목입니다.
     */
    title: string;
    /**
     * 일정 설명입니다.
     */
    description?: string;
  };
}

/**
 * 문자 보내기 또는 영상/음성 보내기 액션입니다.
 *
 * 확인 필요: 문서상 composeTextMessage가 필수로 표시되어 있어, composeRecordingMessage만 쓰는 경우에도 composeTextMessage가 필요한지 불명확합니다.
 */
export interface RcsComposeAction {
  /**
   * 문자 보내기 객체입니다.
   */
  composeTextMessage: {
    /**
     * 전화 번호입니다.
     */
    phoneNumber: string;
    /**
     * 문자(SMS/LMS/MMS) 내용입니다.
     */
    text?: string;
  };
  /**
   * 영상/음성 보내기 객체입니다.
   */
  composeRecordingMessage?: {
    /**
     * 전화 번호입니다.
     */
    phoneNumber: string;
    /**
     * 영상(`VIDEO`) 또는 음성(`AUDIO`)입니다.
     */
    type: 'VIDEO' | 'AUDIO';
  };
}

/**
 * 버튼 액션 객체입니다. 아래 액션 유형 객체를 넣습니다.
 *
 * 확인 필요: 한 action에 액션 유형을 하나만 넣어야 하는지 문서에 명시되어 있지 않습니다.
 */
export interface RcsAction {
  urlAction?: RcsUrlAction;
  dialerAction?: RcsDialerAction;
  mapAction?: RcsMapAction;
  calendarAction?: RcsCalendarAction;
  composeAction?: RcsComposeAction;
}

/**
 * 버튼 액션 정의(버튼 1개)입니다.
 */
export interface RcsSuggestion {
  action?: RcsAction;
  /**
   * 버튼 명입니다.
   */
  displayText: string;
}

/**
 * RCS 버튼입니다.
 *
 * 확인 필요: buttons 개수와 suggestions 개수 제한이 문서화되어 있지 않습니다.
 */
export interface RcsButton {
  /**
   * 버튼 액션 정의 목록입니다.
   */
  suggestions?: RcsSuggestion[];
}

/**
 * RCS 메시지입니다. 같은 `rcs` 키로 **통합 RCS**(iOS·안드로이드 동시 지원, 신규 연동 권장)와
 * **안드로이드 RCS**(기존 안드로이드 채팅+ 연동 규격 유지용)를 모두 발송합니다.
 * `copyAllowed`, `header`, `footer`는 안드로이드 RCS 발송 문서에만 있는 필드입니다.
 *
 * 확인 필요: 통합 RCS와 안드로이드 RCS를 요청에서 어떻게 구분하는지(formatId 등) 문서에 명시되어 있지 않습니다. copyAllowed/header/footer를 통합 RCS에 보냈을 때의 동작도 문서화되어 있지 않습니다.
 */
export interface RcsMessage {
  /**
   * 발신번호입니다.
   */
  from: string;
  /**
   * RCS 메시지 포맷(템플릿) ID입니다.
   */
  formatId: string;
  /**
   * RCS 브랜드 식별 키입니다.
   */
  brandKey: string;
  body: RcsBody;
  /**
   * RCS 버튼 목록입니다.
   */
  buttons?: RcsButton[];
  /**
   * RCS 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * RCS 메시지 그룹 ID입니다.
   */
  groupId?: string;
  /**
   * 전송 타임아웃 설정입니다. 기본값은 `1`입니다.
   * - `1`: 24시간
   * - `2`: 40초
   * - `3`: 3분 10초
   * - `4`: 1시간
   * @defaultValue "1" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  expiryOption?: '1' | '2' | '3' | '4';
  /**
   * (안드로이드 RCS) 메시지 복사 허용 여부입니다. `0`=허용 안 함, `1`=허용. 기본값은 `0`입니다.
   * @defaultValue "0" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  copyAllowed?: '0' | '1';
  /**
   * (안드로이드 RCS) 광고 표시 레이블 여부입니다. `0`=표시 안 함, `1`=표시. 기본값은 `0`입니다.
   * @defaultValue "0" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  header?: '0' | '1';
  /**
   * (안드로이드 RCS) 수신거부 번호입니다. `header`가 `1`이면 필수이며 최대 100자입니다.
   *
   * 제약: maxLength=100
   */
  footer?: string;
  /**
   * 대행사 ID입니다. 기본값은 `infobank`입니다.
   * @defaultValue "infobank" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  agencyId?: string;
  /**
   * 대행사 키입니다.
   */
  agencyKey?: string;
  /**
   * 메시지 유효 시간(초)입니다. 기본값은 `86400`입니다.
   *
   * 제약: pattern=^[0-9]+$
   * @defaultValue "86400" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  ttl?: string;
}

export interface RcsFlowItem {
  rcs: RcsMessage;
  sms?: never;
  mms?: never;
  international?: never;
  alimtalk?: never;
  brandmessage?: never;
  navertalk?: never;
}

/**
 * 알림톡 대표 링크 정보입니다.
 */
export interface AlimtalkLink {
  /**
   * PC 환경에서 클릭 시 이동할 URL입니다.
   */
  urlPc: string;
  /**
   * 모바일 환경에서 클릭 시 이동할 URL입니다.
   */
  urlMobile: string;
  /**
   * Android 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * iOS 커스텀 스킴입니다.
   */
  schemeIos?: string;
}

/**
 * 알림톡 버튼입니다. 버튼 타입에 따라 필요한 필드가 다릅니다.
 */
export interface AlimtalkButton {
  /**
   * 카카오 버튼 타입 코드입니다. 문서 예시에 나온 값은 `WL`(웹 링크)입니다.
   *
   * 확인 필요: 버튼 타입 코드 전체 목록과 타입별 필수 필드가 문서에 없습니다.
   */
  type: 'WL' | (string & {});
  /**
   * 카카오 버튼명입니다.
   */
  name: string;
  /**
   * PC 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * 모바일 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlMobile?: string;
  /**
   * iOS 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * 웹 링크 버튼의 target 값입니다. `type`이 `WL`이고 `target`이 `out`이면 아웃링크로 동작합니다.
   */
  target?: string;
  /**
   * 봇/상담톡 전환 시 전달할 메타 정보입니다.
   */
  chatExtra?: string;
  /**
   * 봇/상담톡 전환 시 연결할 이벤트명입니다.
   */
  chatEvent?: string;
  /**
   * 비즈플러그인 ID입니다.
   */
  pluginId?: string;
  /**
   * 비즈플러그인 relay ID입니다. 비즈플러그인 실행 시 `X-Kakao-Plugin-Relay-Id` 헤더로 전달됩니다.
   */
  relayId?: string;
  /**
   * 원클릭 결제 정보 ID입니다.
   */
  oneclickId?: string;
  /**
   * 원클릭 결제 상품 ID입니다.
   */
  productId?: string;
  /**
   * 비즈폼 키입니다.
   */
  bizFormKey?: string;
  /**
   * 비즈폼 ID입니다.
   */
  bizFormId?: string;
  /**
   * 전화번호입니다.
   */
  telNumber?: string;
}

/**
 * 알림톡 아이템 리스트의 항목 1개입니다.
 */
export interface AlimtalkItemListEntry {
  /**
   * 아이템 타이틀입니다. 최대 6자입니다.
   *
   * 제약: maxLength=6
   */
  title: string;
  /**
   * 아이템 부가정보입니다. 최대 23자입니다.
   *
   * 제약: maxLength=23
   */
  description: string;
}

/**
 * 알림톡 아이템 요약 정보입니다.
 */
export interface AlimtalkItemSummary {
  /**
   * 요약 타이틀입니다. 최대 6자입니다.
   *
   * 제약: maxLength=6
   */
  title: string;
  /**
   * 요약 가격정보입니다. 최대 14자입니다.
   * 허용 문자: 통화 기호(유니코드 통화 기호, 元, 円, 원), 통화 코드(ISO 4217), 숫자, 쉼표, 소수점, 공백. 소수점 이하는 2자리까지 허용합니다.
   *
   * 제약: maxLength=14
   */
  description: string;
}

/**
 * 알림톡 아이템 정보입니다.
 */
export interface AlimtalkItem {
  /**
   * 아이템 리스트입니다. 최소 2개, 최대 10개입니다.
   *
   * 제약: minItems=2, maxItems=10
   */
  list?: AlimtalkItemListEntry[];
  summary?: AlimtalkItemSummary;
}

/**
 * 알림톡 아이템 하이라이트 정보입니다.
 */
export interface AlimtalkItemHighlight {
  /**
   * 아이템 하이라이트 타이틀입니다. 최대 30자이며, 이미지가 있으면 최대 21자입니다.
   *
   * 제약: maxLength=30
   */
  title: string;
  /**
   * 아이템 하이라이트 부가정보입니다. 최대 19자이며, 이미지가 있으면 최대 13자입니다.
   *
   * 제약: maxLength=19
   */
  description: string;
}

/**
 * 알림톡 첨부 정보(버튼, 아이템, 아이템 하이라이트)입니다.
 */
export interface AlimtalkAttachment {
  /**
   * 버튼 정보입니다.
   */
  button?: AlimtalkButton[];
  item?: AlimtalkItem;
  itemHighlight?: AlimtalkItemHighlight;
}

/**
 * 알림톡 바로연결 1개입니다.
 */
export interface AlimtalkQuickReply {
  /**
   * 바로연결 타입 코드입니다.
   *
   * 확인 필요: 바로연결 타입 코드 목록이 문서에 없습니다.
   */
  type: string;
  /**
   * 바로연결 제목입니다. 템플릿 등록 규격상 최대 14자입니다.
   */
  name: string;
  /**
   * PC 환경에서 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * 모바일 환경에서 클릭 시 이동할 URL입니다.
   */
  urlMobile?: string;
  /**
   * iOS 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * 봇/상담톡 전환 시 전달할 메타 정보입니다.
   */
  chatExtra?: string;
  /**
   * 봇/상담톡 전환 시 연결할 이벤트명입니다.
   */
  chatEvent?: string;
  /**
   * 비즈폼 ID입니다.
   */
  bizFormId?: string;
}

/**
 * 메시지에 첨부할 바로연결 정보입니다.
 */
export interface AlimtalkSupplement {
  /**
   * 바로연결 정보입니다.
   */
  quickReply?: AlimtalkQuickReply[];
}

/**
 * 카카오 알림톡 메시지입니다. 카카오가 승인한 템플릿을 기반으로 정보성 메시지를 발송합니다.
 *
 * 발송 방식은 2가지입니다.
 * - **전문 발송**: `msgType`(AT/AI), `text` 등 템플릿 전문을 본문에 직접 넣습니다. 이때 `msgType`과 `text`는 필수입니다.
 * - **템플릿 자동 치환 발송**: `sendType`을 `template`으로 두고 `senderKey`, `templateCode`만 보냅니다.
 *   Bizgo API가 템플릿 코드에 맞는 전문을 만든 뒤 `destinations[].replaceWords` 값을 치환합니다.
 *   이 방식에서는 `destinations[].replaceWords`가 필수이며, `msgType`·`text`·`attachment` 등 전문 필드는 문서에 없습니다.
 *
 * 두 방식의 조건부 필수 필드는 `x-sdk-required-if`에 있습니다. SDK는 보내기 전에 이 규칙을 검사합니다.
 */
export interface AlimtalkMessage {
  /**
   * 카카오 비즈메시지 타입입니다. 전문 발송(`sendType`이 `template`이 아님) 시 필수이며, 빠지면 서버가 A523으로 거절합니다(템플릿 자동 치환 발송에서는 생략).
   * - `AT`: 텍스트형
   * - `AI`: 이미지형
   *
   * 확인 필요: 이미지형(AI) 발송 시 이미지를 지정하는 발송 필드가 문서에 없습니다. 템플릿에 등록된 이미지를 쓰는 것으로 추정됩니다.
   */
  msgType?: 'AT' | 'AI';
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 알림톡 템플릿 코드입니다.
   */
  templateCode: string;
  /**
   * 템플릿 변수 자동 치환 발송 타입입니다. 템플릿 자동 치환 발송 시 필수이며 `template`을 입력합니다. 전문 발송에서는 생략합니다.
   */
  sendType?: 'template';
  /**
   * 카카오 응답 방식입니다. 기본값은 `push`입니다.
   * - `push`(권장): 활성 사용자 조건에 해당하면 ACK 수신 여부를 확인하지 않고 성공 처리합니다. 조건을 만족하지 않으면 `NoSendAvailableException` 오류를 응답합니다.
   * - `polling`: `timeout` 안에 수신 결과가 도착하면 성공(`MS03`), 나머지는 성공불확실(`ME09`)로 처리합니다.
   * @defaultValue "push" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  responseMethod?: 'push' | 'polling';
  /**
   * polling 발송 시 수신 결과를 기다리는 시간(초)입니다. 10~86,400초이며 기본값은 180초입니다.
   *
   * 제약: pattern=^[0-9]+$
   * @defaultValue "180" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  timeout?: string;
  /**
   * 알림톡 본문입니다. 전문 발송(`sendType`이 `template`이 아님) 시 필수입니다. 최대 1,300자입니다.
   *
   * 제약: maxLength=1300
   */
  text?: string;
  /**
   * 알림톡 제목입니다(강조표기형 템플릿). 최대 50자입니다.
   *
   * 제약: maxLength=50
   */
  title?: string;
  /**
   * 메시지 상단에 표기할 제목입니다.
   */
  header?: string;
  link?: AlimtalkLink;
  attachment?: AlimtalkAttachment;
  supplement?: AlimtalkSupplement;
  /**
   * 메시지에 포함된 가격/금액/결제금액입니다.
   */
  price?: string;
  /**
   * 가격/금액/결제금액의 통화 단위입니다. 알려진 값은 `KRW`, `USD`, `EUR`입니다.
   */
  currencyType?: 'KRW' | 'USD' | 'EUR' | (string & {});
}

export interface AlimtalkFlowItem {
  alimtalk: AlimtalkMessage;
  sms?: never;
  mms?: never;
  international?: never;
  rcs?: never;
  brandmessage?: never;
  navertalk?: never;
}

/**
 * 기본형 변수 분리 방식에서 캐러셀 아이템 1개에 대한 변수입니다(FC, FA).
 *
 * 확인 필요: 각 변수 객체의 내부 구조(키·값 형식)가 문서에 없습니다.
 */
export interface BrandMessageCarouselVariable {
  /**
   * 캐러셀 메시지 영역 변수입니다. FC, FA 캐러셀 리스트에서 사용합니다.
   */
  messageVariable?: Record<string, unknown>;
  /**
   * 캐러셀 버튼 영역 변수입니다. FC, FA 타입에서 사용합니다.
   */
  buttonVariable?: Record<string, unknown>;
  /**
   * 캐러셀 쿠폰 영역 변수입니다. FC, FA 캐러셀 리스트에서 사용합니다.
   */
  couponVariable?: Record<string, unknown>;
  /**
   * 캐러셀 이미지 영역 변수입니다. FC, FA 캐러셀 리스트에서 사용합니다.
   */
  imageVariable?: Record<string, unknown>;
  /**
   * 캐러셀 커머스 영역 변수입니다. FA 캐러셀 리스트에서 사용합니다.
   */
  commerceVariable?: Record<string, unknown>;
}

/**
 * 기본형 변수 분리 방식에서 카탈로그(FG) 아이템 1개에 대한 변수입니다.
 *
 * 확인 필요: 각 변수 객체의 내부 구조(키·값 형식)가 문서에 없습니다.
 */
export interface BrandMessageCatalogVariable {
  /**
   * 아이템 `title`·`description`의 변수입니다.
   */
  messageVariable?: Record<string, unknown>;
  /**
   * 가격 관련 변수입니다.
   */
  commerceVariable?: Record<string, unknown>;
  /**
   * 아이템 `imgUrl`·`imgLink`의 변수입니다.
   */
  imageVariable?: Record<string, unknown>;
}

/**
 * 브랜드메시지 버튼입니다.
 */
export interface BrandMessageButton {
  /**
   * 버튼 타입입니다. 문서에 언급된 값은 `WL`, `AL`입니다.
   *
   * 확인 필요: 버튼 타입 코드 전체 목록이 문서에 없습니다.
   */
  type: 'WL' | 'AL' | (string & {});
  /**
   * 버튼명입니다. 최대 28자입니다.
   *
   * 제약: maxLength=28
   */
  name?: string;
  /**
   * PC 클릭 URL입니다. `WL` 타입에서 필수입니다.
   */
  urlPc?: string;
  /**
   * 모바일 클릭 URL입니다. `WL`, `AL` 타입에서 필수입니다.
   */
  urlMobile?: string;
  /**
   * iOS 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * 봇/상담톡 메타데이터입니다.
   */
  chatExtra?: string;
  /**
   * 봇/상담톡 이벤트명입니다.
   */
  chatEvent?: string;
  /**
   * 비즈폼 키입니다.
   */
  bizFormKey?: string;
}

/**
 * 브랜드메시지 이미지 요소입니다. 최상위 `attachment.image`는 FI, FW, FM 타입에서, 캐러셀 아이템의 `attachment.image`는 FC, FA 타입에서 필수입니다.
 */
export interface BrandMessageImage {
  /**
   * 등록된 이미지 URL입니다. 브랜드메시지 이미지 업로드 API(`/api/comm/v1/file/brandmessage/...`)로 발급받은 `imgUrl`을 씁니다.
   */
  imgUrl: string;
  /**
   * 이미지 클릭 시 이동할 URL입니다. 생략하면 카카오 뷰어로 열립니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  imgLink?: string;
}

/**
 * 브랜드메시지 와이드 아이템 목록의 항목 1개입니다.
 */
export interface BrandMessageItemListEntry {
  /**
   * 아이템 제목입니다. 첫 번째 아이템은 최대 25자(줄바꿈 1회), 2~4번째 아이템은 최대 30자(줄바꿈 1회)입니다.
   *
   * 제약: maxLength=30
   */
  title?: string;
  /**
   * 아이템 이미지 URL입니다. 첫 번째 아이템은 와이드 리스트 첫번째 이미지 업로드, 2~4번째는 와이드 리스트 이미지 업로드로 발급받은 URL을 씁니다.
   */
  imgUrl?: string;
  /**
   * 모바일 클릭 URL입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlMobile?: string;
  /**
   * PC 클릭 URL입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlPc?: string;
  /**
   * iOS 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeIos?: string;
  /**
   * Android 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeAndroid?: string;
}

/**
 * 브랜드메시지 와이드 아이템 요소입니다(와이드 리스트형, FL).
 */
export interface BrandMessageItem {
  /**
   * 아이템 목록입니다.
   */
  list?: BrandMessageItemListEntry[];
}

/**
 * 브랜드메시지 쿠폰 요소입니다.
 */
export interface BrandMessageCoupon {
  /**
   * 쿠폰명입니다. `${n}원 할인`, `${n}% 할인`, `배송비 할인`, `${7자 이내} 무료`, `${7자 이내} UP` 형식을 지원합니다.
   */
  title: string;
  /**
   * 쿠폰 상세 정보입니다. 와이드(FW)·와이드 리스트(FL)·프리미엄 동영상(FP)은 최대 18자, 그 외(캐러셀 아이템 포함)는 최대 12자입니다.
   *
   * 제약: maxLength=18
   */
  description: string;
  /**
   * PC 클릭 URL입니다.
   */
  urlPc?: string;
  /**
   * 모바일 클릭 URL입니다.
   */
  urlMobile?: string;
  /**
   * Android 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * iOS 커스텀 스킴입니다.
   */
  schemeIos?: string;
}

/**
 * 브랜드메시지 커머스 요소입니다(FM, 캐러셀 커머스 FA).
 */
export interface BrandMessageCommerce {
  /**
   * 상품명입니다. 최대 30자입니다.
   *
   * 제약: maxLength=30
   */
  title: string;
  /**
   * 정가입니다. 0~99,999,999입니다.
   *
   * 제약: minimum=0, maximum=99999999
   */
  regularPrice: number;
  /**
   * 할인가입니다. 0~99,999,999입니다.
   *
   * 제약: minimum=0, maximum=99999999
   */
  discountPrice?: number;
  /**
   * 할인율(%)입니다. `discountPrice`와 함께 씁니다. 허용 범위는 1~100입니다.
   * 2026년 8월 4일부터 `0`이면 템플릿 등록·발송 요청이 실패하므로, 할인율을 쓰지 않을 때는 `0` 대신 `null`로 보냅니다.
   *
   * 제약: minimum=1, maximum=100
   *
   * 확인 필요: Part B 필드 표는 0~100으로 적혀 있으나 Part A 안내(1~100, 0 금지)를 따릅니다.
   */
  discountRate?: number | null;
  /**
   * 정액 할인금액입니다. `discountPrice`와 함께 씁니다. 0~999,999입니다.
   *
   * 제약: minimum=0, maximum=999999
   */
  discountFixed?: number;
  /**
   * 정상 가격명입니다.
   */
  regularPriceName?: string;
  /**
   * 할인 후 가격명입니다.
   */
  discountPriceName?: string;
  /**
   * 할인율명입니다.
   */
  discountRateName?: string;
  /**
   * 정액 할인금액명입니다.
   */
  discountFixedName?: string;
}

/**
 * 브랜드메시지 동영상 요소입니다(FP).
 */
export interface BrandMessageVideo {
  /**
   * 카카오TV 동영상 URL입니다. 최대 500자입니다.
   *
   * 제약: maxLength=500
   */
  videoUrl: string;
  /**
   * 동영상 썸네일 URL입니다. 비공개 동영상이면 필수입니다. 최대 500자입니다.
   *
   * 제약: maxLength=500
   */
  thumbnailUrl?: string;
}

/**
 * 브랜드메시지 카탈로그 아이템 1개입니다.
 */
export interface BrandMessageCatalogItem {
  /**
   * 카탈로그 아이템 타입입니다.
   *
   * 확인 필요: 카탈로그 아이템 타입 값 목록이 문서에 없습니다.
   */
  type: string;
  /**
   * 아이템 이미지 URL입니다.
   */
  imgUrl?: string;
  /**
   * 이미지 클릭 시 이동할 URL입니다.
   */
  imgLink?: string;
  /**
   * 상품명입니다.
   */
  title?: string;
  /**
   * 상품 설명입니다.
   */
  description?: string;
  /**
   * 정상 가격입니다.
   */
  regularPrice?: number;
  /**
   * 할인 후 가격입니다.
   */
  discountPrice?: number;
  /**
   * 할인율입니다.
   */
  discountRate?: number;
  /**
   * 정액 할인금액입니다.
   */
  discountFixed?: number;
  /**
   * 정상 가격명입니다.
   */
  regularPriceName?: string;
  /**
   * 할인 후 가격명입니다.
   */
  discountPriceName?: string;
  /**
   * 정상 가격 고정변수명입니다.
   */
  regularPriceVariableName?: string;
  /**
   * 할인 후 가격 고정변수명입니다.
   */
  discountPriceVariableName?: string;
  /**
   * 할인율 고정변수명입니다.
   */
  discountRateVariableName?: string;
  /**
   * 정액 할인금액 고정변수명입니다.
   */
  discountFixedVariableName?: string;
}

/**
 * 브랜드메시지 카탈로그 요소입니다. `msgType`이 `FG`일 때 사용합니다.
 */
export interface BrandMessageCatalog {
  /**
   * 카탈로그 아이템 목록입니다. FG 타입에서 필수이며 최소 3개, 최대 7개입니다.
   * 아이템이 홀수 개(3·5·7)이면 첫 번째 아이템만 2:1 가로형 이미지(카탈로그 홀수형 첫번째 이미지 업로드)를, 나머지는 1:1 정사각형 이미지(카탈로그 이미지 업로드)를 씁니다. 짝수 개(4·6)이면 전부 1:1입니다.
   *
   * 제약: minItems=3, maxItems=7
   */
  list?: BrandMessageCatalogItem[];
}

/**
 * 브랜드메시지 첨부 정보(버튼, 이미지, 와이드 아이템, 쿠폰, 커머스, 동영상, 카탈로그)입니다.
 */
export interface BrandMessageAttachment {
  /**
   * 버튼 목록입니다. 최대 5개이며, FT/FI 타입에 쿠폰을 함께 쓰면 최대 4개입니다.
   *
   * 제약: maxItems=5
   */
  button?: BrandMessageButton[];
  image?: BrandMessageImage;
  item?: BrandMessageItem;
  coupon?: BrandMessageCoupon;
  commerce?: BrandMessageCommerce;
  video?: BrandMessageVideo;
  catalog?: BrandMessageCatalog;
}

/**
 * 캐러셀 인트로 정보입니다. FC 타입에서는 사용할 수 없습니다.
 */
export interface BrandMessageCarouselHead {
  /**
   * 캐러셀 인트로 헤더입니다. 줄바꿈 불가, 최대 20자입니다.
   *
   * 제약: maxLength=20
   */
  header?: string;
  /**
   * 캐러셀 인트로 내용입니다. 줄바꿈 최대 2회, 최대 50자입니다.
   *
   * 제약: maxLength=50
   */
  content?: string;
  /**
   * 캐러셀 인트로 이미지 URL입니다.
   */
  imageUrl?: string;
  /**
   * 모바일 클릭 URL입니다. URL 또는 스킴 중 하나라도 입력하면 필수입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlMobile?: string;
  /**
   * PC 클릭 URL입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlPc?: string;
  /**
   * Android 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeAndroid?: string;
  /**
   * iOS 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeIos?: string;
}

/**
 * 캐러셀 아이템 첨부 정보입니다.
 */
export interface BrandMessageCarouselItemAttachment {
  /**
   * 캐러셀 아이템 버튼 목록입니다. 최대 5개이며, FC/FA 타입에 쿠폰을 함께 쓰면 최대 4개입니다.
   *
   * 제약: maxItems=5
   */
  button?: BrandMessageButton[];
  image?: BrandMessageImage;
  coupon?: BrandMessageCoupon;
  commerce?: BrandMessageCommerce;
}

/**
 * 캐러셀 아이템 1개입니다.
 */
export interface BrandMessageCarouselItem {
  /**
   * 캐러셀 아이템 제목입니다. FC 타입에서 필수, FA 타입에서는 사용할 수 없습니다. 줄바꿈 불가, 최대 20자입니다.
   *
   * 제약: maxLength=20
   */
  header?: string;
  /**
   * 캐러셀 아이템 본문입니다. FC 타입에서 필수, FA 타입에서는 사용할 수 없습니다. 줄바꿈 최대 2회, 최대 180자입니다.
   *
   * 제약: maxLength=180
   */
  message?: string;
  /**
   * 부가 정보입니다. FA 타입에서는 사용할 수 없습니다. 줄바꿈 최대 1회, 최대 34자입니다.
   *
   * 제약: maxLength=34
   */
  additionalContent?: string;
  attachment?: BrandMessageCarouselItemAttachment;
}

/**
 * 캐러셀 더보기 버튼 정보입니다.
 */
export interface BrandMessageCarouselTail {
  /**
   * 모바일 클릭 URL입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlMobile: string;
  /**
   * PC 클릭 URL입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  urlPc?: string;
  /**
   * iOS 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeIos?: string;
  /**
   * Android 커스텀 스킴입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  schemeAndroid?: string;
}

/**
 * 브랜드메시지 캐러셀 객체입니다(FC 캐러셀 피드, FA 캐러셀 커머스).
 */
export interface BrandMessageCarousel {
  head?: BrandMessageCarouselHead;
  /**
   * 캐러셀 아이템 목록입니다. 최소 2개, 최대 10개입니다.
   *
   * 제약: minItems=2, maxItems=10
   */
  list?: BrandMessageCarouselItem[];
  tail?: BrandMessageCarouselTail;
}

/**
 * 카카오 브랜드메시지입니다. 카카오톡 채널 친구에게 브랜드형 메시지를 발송합니다. `sendType`으로 발송 방식을 구분합니다.
 *
 * | sendType | 방식 | 필수 필드 |
 * | --- | --- | --- |
 * | `basic` | 기본형. 사전 승인된 템플릿으로 발송합니다. 변수 분리 방식(`messageVariable` 등 `*Variable` 필드) 또는 전문 방식(`text`, `attachment`, `carousel`)을 템플릿 구조와 `msgType`에 맞게 선택해 씁니다. Variable 필드는 변수 치환이 필요할 때만 씁니다. | `sendType`, `msgType`, `senderKey`, `templateCode`, `targeting` |
 * | `template` | 기본형 템플릿 자동 치환. 템플릿 코드와 `destinations[].replaceWords`만으로 발송하며 Bizgo API가 전문을 생성합니다. 사용 가능 필드는 `senderKey`, `templateCode`, `sendType`, `targeting`, `pushAlarm`, `originCID`, `unsubscribePhoneNumber`, `unsubscribeAuthNumber`입니다. | `sendType`, `senderKey`, `templateCode`, `targeting` (+ `destinations[].replaceWords`) |
 * | `free` | 자유형. 템플릿 없이 본문·버튼·이미지·캐러셀 등을 직접 구성합니다. `templateCode`와 `*Variable` 필드는 쓰지 않으며, `groupTagKey`·`adult`·`adFlag`는 자유형에서만 씁니다. | `sendType`, `msgType`, `senderKey` |
 *
 * 위 표의 `sendType`별 필수 필드는 `x-sdk-required-if`에 있으며 SDK가 보내기 전에 검사합니다. 아래 `msgType`별 요소는 설명으로만 두고 SDK가 검사하지 않습니다(`msgType` 값 확인 전).
 *
 * `msgType`별 주요 요소(문서의 필드 제약에서 정리):
 * - `FT`: 본문 최대 1,300자
 * - `FI`: `attachment.image` 필수, 본문 최대 400자
 * - `FW`: 와이드 이미지. `attachment.image` 필수, 본문 최대 76자
 * - `FL`: 와이드 리스트. `attachment.item`
 * - `FP`: 동영상. `attachment.video`, 본문 최대 76자
 * - `FM`: 커머스. `attachment.image` 필수, `attachment.commerce`, `additionalContent`
 * - `FC`: 캐러셀 피드. `carousel`, 아이템별 `header`·`message`·`attachment.image` 필수, `carousel.head` 사용 불가
 * - `FA`: 캐러셀 커머스. `carousel`, 아이템별 `attachment.image` 필수·`attachment.commerce`, 아이템 `header`·`message`·`additionalContent` 사용 불가
 * - `FG`: 카탈로그. `header`(헤더 타이틀)·`attachment.catalog`(아이템 3~7개) 필수, `headerDescription` 사용. 친구톡 호환 모드로는 발송할 수 없고, PC톡·맥톡에서는 노출되지 않으며 카카오톡 v25.8.0 이상에서 확인할 수 있습니다. 기본형으로 등록한 카탈로그 템플릿은 `targeting` `M`·`N`으로 발송할 수 있습니다.
 */
export interface BrandMessage {
  /**
   * 브랜드메시지 발송 타입입니다.
   * - `basic`: 기본형 발송
   * - `template`: 기본형 템플릿 자동 치환 발송
   * - `free`: 자유형 발송
   */
  sendType: 'basic' | 'template' | 'free';
  /**
   * 카카오 비즈메시지(브랜드메시지) 타입입니다. `basic`, `free` 발송 시 필수입니다(`template`에서는 생략).
   * 카카오 원본 chatBubbleType으로 변환됩니다. 알려진 값은 `FT`, `FI`, `FW`, `FL`, `FC`, `FM`, `FA`, `FP`, `FG`입니다.
   *
   * 확인 필요: 문서의 요청 예시는 msgType에 `TEXT`를 쓰지만 필드 설명·템플릿 규격은 `FT` 등 2자리 코드를 씁니다. 각 코드의 명칭(와이드/커머스 등)은 필드 제약과 이미지 업로드 API 이름에서 추정한 것입니다.
   */
  msgType?: 'FT' | 'FI' | 'FW' | 'FL' | 'FC' | 'FM' | 'FA' | 'FP' | 'FG' | (string & {});
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 브랜드메시지 템플릿 코드입니다. `basic`, `template` 발송 시 필수이며 `free`에서는 쓰지 않습니다.
   */
  templateCode?: string;
  /**
   * 고객사의 광고성 정보 수신동의 회원 대상 타겟팅입니다. `basic`, `template` 발송 시 필수, `free`에서는 선택입니다. 허용된(allowlist) 발신프로필만 사용할 수 있습니다.
   * - `M`: 광고성 정보 수신동의 회원
   * - `N`: 광고성 정보 수신동의 회원 − 채널 친구
   * - `O`: 광고성 정보 수신동의 회원 ∩ 채널 친구 (수신거부 방식: 080 번호 안내)
   * - `I`: 광고성 정보 수신동의 회원 ∩ 채널 친구 (수신거부 방식: 채널 차단 안내)
   */
  targeting?: 'M' | 'N' | 'O' | 'I';
  /**
   * 브랜드메시지 본문입니다. 최대 글자 수는 `msgType`에 따라 다릅니다(FT 1,300자, FI 400자, FW/FP 76자).
   *
   * 제약: maxLength=1300
   *
   * 확인 필요: 자유형 발송 요청 예시는 본문을 `text`가 아닌 `content` 필드로 보냅니다. 필드 표(Part A)의 `text`를 따릅니다.
   */
  text?: string;
  /**
   * 헤더 정보입니다. 최대 20자입니다. `FG`(카탈로그)에서는 헤더 타이틀로 필수입니다.
   *
   * 제약: maxLength=20
   */
  header?: string;
  /**
   * 헤더 디스크립션입니다. `msgType`이 `FG`일 때만 사용합니다.
   */
  headerDescription?: string;
  /**
   * 부가 정보입니다. `FM` 타입 전용이며 최대 34자입니다.
   *
   * 제약: maxLength=34
   */
  additionalContent?: string;
  /**
   * 그룹태그 등록으로 발급받은 키입니다. 자유형(`free`) 발송에서 씁니다. 최대 40자입니다.
   *
   * 제약: maxLength=40
   */
  groupTagKey?: string;
  /**
   * 성인 대상 메시지 여부입니다. 자유형(`free`) 발송에서 씁니다. 기본값은 `N`입니다.
   * @defaultValue "N" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  adult?: 'Y' | 'N';
  /**
   * 메시지 도착 시 푸시 알림 발송 여부입니다. 기본값은 `Y`입니다.
   * @defaultValue "Y" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  pushAlarm?: 'Y' | 'N';
  /**
   * 광고성 메시지 필수 표기 사항 노출 여부입니다. 자유형(`free`) 발송에서 씁니다. 기본값은 `Y`이며, `msgType`이 `FL`, `FC`, `FA`이면 `Y`로만 발송할 수 있습니다.
   * @defaultValue "Y" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  adFlag?: 'Y' | 'N';
  /**
   * 메시지 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FT, FI, FW, FL, FP, FM 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조(키·값 형식)가 문서에 없습니다. 기본형 요청 예시는 `messageVariable`을 `destinations[]` 안에 넣고 있어 위치도 불명확합니다.
   */
  messageVariable?: Record<string, unknown>;
  /**
   * 버튼 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FT, FI, FW, FL, FP, FM 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조가 문서에 없습니다.
   */
  buttonVariable?: Record<string, unknown>;
  /**
   * 쿠폰 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FT, FI, FW, FL, FP, FM 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조가 문서에 없습니다.
   */
  couponVariable?: Record<string, unknown>;
  /**
   * 이미지 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FI, FW, FL, FM 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조가 문서에 없습니다.
   */
  imageVariable?: Record<string, unknown>;
  /**
   * 비디오 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FP 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조가 문서에 없습니다.
   */
  videoVariable?: Record<string, unknown>;
  /**
   * 커머스 영역 변수 정의입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FM 타입에서 사용합니다.
   *
   * 확인 필요: 변수 객체의 내부 구조가 문서에 없습니다.
   */
  commerceVariable?: Record<string, unknown>;
  /**
   * 캐러셀 영역 변수 목록입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다. FC, FA 타입에서 사용합니다.
   */
  carouselVariable?: BrandMessageCarouselVariable[];
  /**
   * FG(카탈로그) 전용 아이템 단위 변수입니다. 기본형(`basic`) 변수 분리 방식에서 씁니다.
   */
  catalogVariable?: BrandMessageCatalogVariable[];
  /**
   * 최초 발신사업자 식별코드(최대 9자)입니다. 재판매사·특수부가통신사업자는 필수입니다.
   *
   * 제약: maxLength=9
   */
  originCID?: string;
  /**
   * 무료 수신거부 전화번호입니다. 최대 13자입니다.
   *
   * 제약: maxLength=13
   */
  unsubscribePhoneNumber?: string;
  /**
   * 무료 수신거부 인증번호입니다. 최대 10자입니다.
   *
   * 제약: maxLength=10
   */
  unsubscribeAuthNumber?: string;
  attachment?: BrandMessageAttachment;
  carousel?: BrandMessageCarousel;
}

export interface BrandMessageFlowItem {
  brandmessage: BrandMessage;
  sms?: never;
  mms?: never;
  international?: never;
  rcs?: never;
  alimtalk?: never;
  navertalk?: never;
}

/**
 * 네이버 톡톡 버튼입니다.
 * - `WEB_LINK` 버튼은 `mobileUrl`이 필수입니다(접수코드 A606).
 * - `APP_LINK` 버튼은 `aOsAppScheme`과 `iOsAppScheme`이 모두 필수입니다(접수코드 A607).
 */
export interface NaverTalkButton {
  /**
   * 버튼 코드입니다. 알려진 값은 `WEB_LINK`, `APP_LINK`입니다(요청 예시와 접수코드 A605~A607 기준). 전체 목록은 원문에 없습니다.
   */
  buttonCode: 'WEB_LINK' | 'APP_LINK' | (string & {});
  /**
   * 모바일 이동 URL입니다.
   */
  mobileUrl?: string;
  /**
   * PC 이동 URL입니다.
   */
  pcUrl?: string;
  /**
   * Android OS 환경에서 버튼 클릭 시 이동할 앱 링크입니다.
   */
  aOsAppScheme?: string;
  /**
   * iOS 환경에서 버튼 클릭 시 이동할 앱 링크입니다.
   */
  iOsAppScheme?: string;
}

/**
 * 네이버 톡톡 쿠폰 정보 객체입니다(접수코드 A608).
 */
export interface NaverTalkGift {
  /**
   * 쿠폰 코드입니다.
   */
  code: string;
  /**
   * 쿠폰 이미지 URL입니다. 쿠폰을 첨부하면 반드시 필요합니다(리포트 코드 72106).
   */
  imageUrl: string;
  /**
   * 쿠폰 종료일입니다. 오늘 이후 날짜를 `YYYY-MM-DD` 형식으로 입력합니다(리포트 코드 72107).
   *
   * 제약: pattern=^[0-9]{4}-[0-9]{2}-[0-9]{2}$, 형식 YYYY-MM-DD
   */
  endDate: string;
  /**
   * 쿠폰 이름입니다. 생략하면 템플릿에 등록된 이름으로 발송됩니다.
   */
  name?: string;
  /**
   * 쿠폰 발급자입니다.
   */
  publisher?: string;
  /**
   * 쿠폰 설명입니다.
   */
  couponDescription?: string;
  /**
   * 쿠폰 라벨입니다.
   */
  label?: string;
  /**
   * 쿠폰 내용입니다.
   */
  value?: string;
}

/**
 * 네이버 톡톡 첨부 정보 객체입니다(이미지, 버튼, 쿠폰).
 * 쿠폰(`gift`)을 첨부하면 이미지는 첨부되지 않습니다(리포트 코드 72105).
 */
export interface NaverTalkAttachments {
  /**
   * 첨부 이미지 URL입니다.
   */
  imageUrl?: string;
  /**
   * 첨부 이미지 hashId입니다. 이미지 hashId에 해당하는 파트너 키나 템플릿 그룹키를 써야 합니다(리포트 코드 72011, 72104).
   */
  imageHashId?: string;
  /**
   * 버튼 목록입니다. 템플릿에 필요한 버튼 개수와 같아야 합니다(리포트 코드 72004).
   */
  buttons?: NaverTalkButton[];
  gift?: NaverTalkGift;
}

/**
 * 네이버 톡톡(네이버 스마트알림) 메시지입니다. `messageFlow[].navertalk` 객체로 보냅니다.
 * 네이버 스마트알림 규격에 맞춘 템플릿 기반 정보성 메시지입니다.
 *
 * 수신번호 규칙(`destinations[].to`): 11자리 휴대폰 번호입니다(예: `01000000000`).
 */
export interface NaverTalkMessage {
  /**
   * 네이버 톡톡 파트너 키입니다(접수코드 A601).
   *
   * 확인 필요: 원문 필드표는 partnerKey를 필수로 표시하지만, 리포트 코드 71005는 '파트너키나 발송그룹키(groupKey)가 반드시 있어야 합니다'로 둘 중 하나만 있어도 되는 것처럼 읽힙니다. 필드표(Part A)를 따라 필수로 둡니다.
   */
  partnerKey: string;
  /**
   * 네이버 톡톡 템플릿 코드입니다.
   */
  templateCode: string;
  /**
   * 템플릿의 상품 코드입니다. 등록된 템플릿의 상품 코드와 같아야 합니다(접수코드 A602, 리포트 코드 71007).
   * 원문 요청 예시 값은 `INFORMATION`이며, 전체 값 목록은 원문에 없습니다.
   */
  productCode: 'INFORMATION' | (string & {});
  /**
   * 전화번호 소유자의 실명입니다.
   */
  userName?: string;
  /**
   * 템플릿 본문입니다. 최대 2,048자입니다.
   *
   * 제약: maxLength=2048
   */
  text?: string;
  /**
   * 템플릿 치환 변수입니다. 치환할 키-값 쌍을 넣습니다. 최대 150자입니다.
   *
   * 확인 필요: 원문은 'max: 150 chars'만 적혀 있어 값 하나당 150자인지, 전체 합계 150자인지 불명확합니다. 값의 타입(문자열)도 원문에 명시되지 않았습니다.
   */
  templateParams?: Record<string, string>;
  attachments?: NaverTalkAttachments;
  /**
   * 네이버 톡톡 발송 그룹입니다. 요청 최상위의 `groupKey`(메시지 인사이트 통계용)와는 다른 필드입니다.
   */
  groupKey?: string;
}

export interface NaverTalkFlowItem {
  navertalk: NaverTalkMessage;
  sms?: never;
  mms?: never;
  international?: never;
  rcs?: never;
  alimtalk?: never;
  brandmessage?: never;
}

/**
 * 발송할 채널 메시지 1개입니다. 객체에는 채널 키(`sms`, `mms`, `international`, `rcs`, `alimtalk`,
 * `brandmessage`, `navertalk`) 중 **정확히 하나**를 넣습니다.
 * `messageFlow` 배열의 앞 메시지가 실패하면 다음 메시지가 자동으로 대체발송(Fallback)됩니다.
 */
export type MessageFlowItem = SmsFlowItem | MmsFlowItem | InternationalFlowItem | RcsFlowItem | AlimtalkFlowItem | BrandMessageFlowItem | NaverTalkFlowItem;

/**
 * 통합 발송 요청입니다. 모든 채널이 같은 형식을 쓰며, 채널은 `messageFlow` 안의 채널 키로 구분합니다.
 */
export interface SendOmniRequest {
  /**
   * 수신자 목록입니다. 한 요청에 최대 200건까지 동보발송할 수 있습니다(초과 시 A318).
   *
   * 제약: minItems=1, maxItems=200
   */
  destinations: Destination[];
  /**
   * 발송할 메시지 목록입니다. 순서대로 대체발송(Fallback)됩니다.
   *
   * 제약: minItems=1
   */
  messageFlow: MessageFlowItem[];
  /**
   * 정산용 부서 코드입니다.
   */
  paymentCode?: string;
  /**
   * 메시지 인사이트에서 통계를 그룹으로 묶어 보기 위한 키입니다.
   */
  groupKey?: string;
  /**
   * 중복 요청을 막는 멱등성 키입니다. 같은 키로 유효시간 안에 다시 요청하면 요청은 성공(HTTP 200)으로 오고 수신자별 결과(`destinations[].code`)가 A301이 됩니다(2026-09-28 sandbox 확인). SDK는 이 수신자를 실패가 아닌 `duplicates`로 돌려줍니다. 이 값을 보내면 `idempotencyTtl`도 함께 보내야 합니다.
   *
   * 제약: maxLength=200
   */
  idempotencyKey?: string;
  /**
   * 멱등성 키 유효시간(초)입니다. 공개 문서는 선택 항목으로 표기하지만 `idempotencyKey`를 보내면 **반드시 함께 보내야 합니다**(없으면 A309).
   * `idempotencyKey` 없이 이 값만 보내면 SDK는 받은 값을 그대로 보냅니다.
   * 공식 SDK는 `idempotencyKey`만 지정하고 이 값을 비워 두면 86400(24시간)을 채워 보냅니다. 직접 지정한 값(0 포함)은 그대로 보냅니다.
   *
   * 제약: minimum=0, maximum=86400
   */
  idempotencyTtl?: number;
  /**
   * 요청 단위 참조 필드입니다. 리포트에 그대로 담겨 요청·메시지를 구분하는 데 씁니다.
   */
  ref?: string;
}

/**
 * API Gateway 공통 결과(인증·권한·요청 형식 검증)입니다.
 */
export interface CommonResult {
  /**
   * 인증 결과 코드입니다. `A000`이면 성공입니다.
   */
  authCode: string;
  /**
   * 인증 결과 메시지입니다.
   */
  authResult: string;
  /**
   * 인포뱅크 트랜잭션 추적 ID입니다. 문의 시 이 값을 전달합니다.
   */
  infobankTrId?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상품 API 처리 결과(개별부)입니다.
 */
export interface ServiceResult {
  /**
   * 처리 결과 코드입니다. `A000`이면 성공입니다. 코드 목록은 에러코드 문서를 참고합니다.
   */
  code: string;
  /**
   * 처리 결과 설명입니다.
   */
  result: string;
  /**
   * 요청 시 전달한 참조값입니다.
   */
  ref?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 개별 데이터가 없는 기본 응답 봉투입니다.
 */
export interface ApiResponse {
  common: CommonResult;
  data?: ServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 수신자별 접수 결과입니다.
 */
export interface SendDestinationResult {
  /**
   * 수신번호입니다.
   */
  to?: string;
  /**
   * 메시지 키입니다. 리포트·상태 조회에 씁니다. 끝 3자리를 뺀 값이 동보 요청의 `requestId`입니다.
   */
  msgKey?: string;
  /**
   * 수신자별 접수 코드입니다. `A000`이 아니면 해당 수신자는 접수되지 않은 것입니다.
   */
  code?: string;
  /**
   * 수신자별 접수 결과입니다.
   */
  result?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface SendOmniResult {
  /**
   * 수신자별 접수 결과입니다.
   */
  destinations?: SendDestinationResult[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type SendOmniServiceResult = ServiceResult & {
  data?: SendOmniResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface SendOmniResponse {
  common: CommonResult;
  data?: SendOmniServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface MmsFileUploadRequest {
  /**
   * 업로드할 이미지 파일입니다. jpg(jpeg), 최대 300KB, 권장 1,500×1,440px 이하입니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 생성합니다.
   */
  fileKey?: string;
  /**
   * 파일 이름입니다. 생략하면 확장자를 뺀 파일명을 씁니다.
   */
  imageName?: string;
}

export interface FileUploadResult {
  /**
   * 업로드 후 발급된 파일 키입니다. 메시지 본문의 `fileKey`에 씁니다.
   */
  fileKey?: string;
  /**
   * 파일 키 만료 일시(ISO 8601)입니다.
   */
  expired?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type FileUploadServiceResult = ServiceResult & {
  data?: FileUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface FileUploadResponse {
  common: CommonResult;
  data?: FileUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface RcsFileUploadRequest {
  /**
   * 업로드할 RCS 이미지 파일입니다. jpg, bmp, png, gif 형식, 최대 1MB입니다.
   *
   * 제약: 최대 1048576byte
   *
   * 확인 필요: 형식·용량 제한(jpg/bmp/png/gif, 1MB)은 영문 문서에만 있습니다. 1MB가 1,000,000byte인지 1,048,576byte인지 불명확합니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 생성합니다.
   *
   * 확인 필요: 한국어 문서에만 있고 영문 문서에는 없는 필드입니다. 응답에는 fileKey가 아닌 media가 돌아옵니다.
   */
  fileKey?: string;
  /**
   * 파일 이름입니다. 생략하면 확장자를 뺀 파일명을 씁니다.
   *
   * 확인 필요: 한국어 문서에만 있고 영문 문서에는 없는 필드입니다.
   */
  imageName?: string;
}

export interface RcsFileUploadResult {
  /**
   * RCS 메시지 본문(`body.media`)에 넣을 미디어 키입니다.
   */
  media?: string;
  /**
   * 미디어 키 만료 일시(ISO 8601)입니다.
   */
  expired?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsFileUploadServiceResult = ServiceResult & {
  data?: RcsFileUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsFileUploadResponse {
  common: CommonResult;
  data?: RcsFileUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface BrandMessageDefaultFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 권장 크기 800×400px, 가로 500px 이상, 비율(세로÷가로) 0.5, 형식 jpg·png, 최대 500KB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

/**
 * 브랜드메시지 이미지 업로드 결과입니다.
 */
export interface BrandMessageFileUploadResult {
  /**
   * 브랜드메시지 템플릿·발송 구성(`attachment.image.imgUrl` 등)에 사용할 이미지 URL입니다.
   */
  imgUrl?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFileUploadServiceResult = ServiceResult & {
  data?: BrandMessageFileUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 브랜드메시지 이미지 업로드 응답입니다. MMS 업로드(`FileUploadResponse`)와 달리 `fileKey`가 아닌 `imgUrl`을 돌려줍니다.
 */
export interface BrandMessageFileUploadResponse {
  common: CommonResult;
  data?: BrandMessageFileUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface BrandMessageWideFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 권장 크기 800×600px 또는 800×400px, 가로 500px 이상, 비율 0.5~1, 형식 jpg·png, 최대 5MB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

export interface BrandMessageWideItemListFirstFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 가로 500px 이상, 비율(세로÷가로) 0.5, 형식 jpg·png, 최대 5MB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

export interface BrandMessageWideItemListFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 가로 500px 이상, 비율(세로÷가로) 1, 형식 jpg·png, 최대 5MB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

export interface BrandMessageCarouselFeedFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 권장 크기 800×600px 또는 800×400px, 가로 500px 이상, 비율 0.5~1.333, 형식 jpg·png, 최대 5MB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

export interface BrandMessageCarouselCommerceFileUploadRequest {
  /**
   * 업로드할 브랜드메시지 이미지 파일입니다. 권장 크기 800×600px 또는 800×400px, 가로 500px 이상, 비율 0.5~1.333, 형식 jpg·png, 최대 5MB입니다. 전체 캐러셀 이미지 비율은 동일해야 합니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고 한국어 페이지(Part A)에는 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

/**
 * 메시지 발송 결과 리포트 1건입니다.
 */
export interface Report {
  /**
   * 메시지 키입니다.
   */
  msgKey?: string;
  /**
   * 서비스 타입입니다.
   */
  serviceType?: 'SMS' | 'MMS' | 'RCS' | 'ALIMTALK' | 'BRANDMESSAGE' | (string & {});
  /**
   * 메시지 타입입니다(예 SM, RS, AT, FT).
   */
  msgType?: string;
  /**
   * 전송 처리 일시입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  sendTime?: string;
  /**
   * 리포트 수신 일시입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  reportTime?: string;
  /**
   * 리포트 종류입니다.
   */
  reportType?: string;
  /**
   * 리포트 코드입니다. `10000`이면 성공입니다.
   */
  reportCode?: string;
  /**
   * 리포트 상세 내용입니다.
   */
  reportText?: string;
  /**
   * (문자메시지) 이통사 코드입니다.
   */
  carrier?: string;
  /**
   * (카카오 브랜드메시지) 메시지 발송 처리 타입입니다.
   */
  userType?: string;
  /**
   * (국제메시지) 메시지 분할 수입니다.
   */
  resCnt?: string;
  /**
   * 요청 시 입력한 참조 필드입니다.
   */
  ref?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface ReportPollingResult {
  /**
   * 수신 확인(`DELETE /api/comm/v1/report/polling/{reportId}`)에 쓰는 리포트 ID입니다. 전달할 리포트가 없으면 빈 문자열입니다.
   */
  reportId?: string;
  /**
   * 리포트 목록입니다. 전달할 리포트가 없으면 null입니다.
   */
  report?: Report[] | null;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type ReportPollingServiceResult = ServiceResult & {
  data?: ReportPollingResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReportPollingResponse {
  common: CommonResult;
  data?: ReportPollingServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface ReportInquiryResult {
  /**
   * 리포트 목록입니다.
   */
  report?: Report[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type ReportInquiryServiceResult = ServiceResult & {
  data?: ReportInquiryResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReportInquiryResponse {
  common: CommonResult;
  data?: ReportInquiryServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 일자별 접수·리포트 통계입니다.
 */
export interface MessageStatistics {
  /**
   * 집계일입니다.
   *
   * 제약: pattern=^[0-9]{8}$, 형식 YYYYMMDD
   */
  statDate?: string;
  /**
   * 접수 전체 건수입니다.
   */
  recvTotalCnt?: number;
  /**
   * 접수 성공 건수입니다.
   */
  recvSuccCnt?: number;
  /**
   * 접수 실패 건수입니다.
   */
  recvFailCnt?: number;
  /**
   * 리포트 전체 건수입니다.
   */
  reportTotalCnt?: number;
  /**
   * 리포트 성공 건수입니다.
   */
  reportSuccCnt?: number;
  /**
   * 리포트 실패 건수입니다.
   */
  reportFailCnt?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface MessageStatisticsResult {
  /**
   * 일자별 통계 목록입니다.
   */
  statistics?: MessageStatistics[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type MessageStatisticsServiceResult = ServiceResult & {
  data?: MessageStatisticsResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface MessageStatisticsResponse {
  common: CommonResult;
  data?: MessageStatisticsServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 메시지 1건의 접수·발송·리포트 상태입니다. 대체발송이 일어나면 같은 msgKey로 채널별 항목이 여러 개 있습니다.
 */
export interface MessageStatus {
  /**
   * 메시지 키입니다.
   */
  msgKey?: string;
  /**
   * 서비스 타입입니다.
   */
  serviceType?: 'SMS' | 'MMS' | 'RCS' | 'ALIMTALK' | 'BRANDMESSAGE' | (string & {});
  /**
   * 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 수신번호입니다.
   */
  to?: string;
  /**
   * 대체발송 여부입니다.
   */
  fallback?: 'Y' | 'N';
  /**
   * 접수 결과 코드입니다.
   */
  responseCode?: string;
  /**
   * 접수 결과 메시지입니다.
   */
  responseText?: string;
  /**
   * 요청 시각(ISO 8601)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  requestTime?: string;
  /**
   * 발송 시각(ISO 8601)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  sendTime?: string;
  /**
   * 리포트 시각(ISO 8601)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  reportTime?: string;
  /**
   * 리포트 타입입니다.
   */
  reportType?: string;
  /**
   * 리포트 코드입니다.
   */
  reportCode?: string;
  /**
   * 리포트 결과 메시지입니다.
   */
  reportText?: string;
  /**
   * 채널 친구 여부입니다(브랜드메시지 전용).
   */
  userType?: string;
  /**
   * 이통사 코드입니다.
   */
  carrier?: string;
  /**
   * 요청 시 전달한 참조 필드입니다.
   */
  ref?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface MessageStatusListResult {
  /**
   * 메시지 목록입니다.
   */
  messages?: MessageStatus[];
  /**
   * 다음 페이지 조회에 쓰는 커서입니다. 다음 요청의 `lastSeq` 쿼리에 그대로 넣습니다.
   * 발송 이력 조회(`GET /message/history`) 응답에 있으며, 상태 조회(inquiry) 응답에는 없을 수 있습니다.
   */
  lastSeq?: number;
  /**
   * 다음 페이지가 있는지 여부입니다. 발송 이력 조회 응답에 있습니다.
   */
  hasNext?: boolean;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type MessageStatusListServiceResult = ServiceResult & {
  data?: MessageStatusListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface MessageStatusListResponse {
  common: CommonResult;
  data?: MessageStatusListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * MO(수신) 메시지 1건입니다.
 */
export interface MoMessage {
  /**
   * 메시지 키입니다.
   */
  msgKey?: string;
  /**
   * 서비스 타입입니다. MO로 고정입니다.
   */
  serviceType?: 'MO';
  /**
   * 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 수신번호(MO 번호)입니다.
   */
  to?: string;
  /**
   * 발신번호입니다(MO 발신자가 입력한 번호, 기본은 단말기 번호).
   */
  from?: string;
  /**
   * 실제 발신 원번호(MO 발신 단말기 번호)입니다.
   */
  originator?: string;
  /**
   * MO 메시지 본문입니다.
   */
  content?: string;
  /**
   * 이통사 코드입니다.
   */
  carrier?: string;
  /**
   * MO 발생 시각(ISO 8601)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  occurredTime?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface MoMessageListResult {
  /**
   * 다음 페이지 조회에 쓰는 커서입니다(MO 이력 조회).
   */
  lastSeq?: number;
  /**
   * 다음 페이지가 있는지 여부입니다(MO 이력 조회).
   */
  hasNext?: boolean;
  /**
   * MO 메시지 목록입니다.
   */
  messages?: MoMessage[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type MoMessageListServiceResult = ServiceResult & {
  data?: MoMessageListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface MoMessageListResponse {
  common: CommonResult;
  data?: MoMessageListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 예약 발송할 채널 메시지 1개입니다. 객체에는 채널 키(`sms`, `mms`, `international`, `rcs`, `alimtalk`,
 * `brandmessage`) 중 **정확히 하나**를 넣습니다. 채널별 필드는 통합 발송(`POST /api/comm/v1/send/omni`) 규격과 같습니다.
 * `messageFlow` 배열의 앞 메시지가 실패하면 다음 메시지가 자동으로 대체발송(Fallback)됩니다.
 *
 * 네이버 톡톡(`navertalk`)은 예약 발송 문서에 없으므로 넣지 않았습니다.
 *
 * 확인 필요: 네이버 톡톡 예약 발송 가능 여부가 문서에 없습니다. RCS도 통합 RCS 예약 발송만 안내되고 안드로이드 RCS 예약 발송 섹션은 없습니다.
 */
export type ReservationMessageFlowItem = SmsFlowItem | MmsFlowItem | InternationalFlowItem | RcsFlowItem | AlimtalkFlowItem | BrandMessageFlowItem;

/**
 * 예약 발송 등록 요청입니다. 통합 발송 요청과 같은 `destinations`·`messageFlow` 구조에 예약 시각(`resvSendTime`)과 예약명(`resvName`)을 더합니다.
 * 예약 발송 문서에는 `groupKey`, `idempotencyKey`, `idempotencyTtl`이 없으므로 넣지 않았습니다.
 *
 * 확인 필요: 예약 발송 요청이 idempotencyKey·idempotencyTtl·groupKey를 받는지 문서에 없습니다. 멱등성 키가 없으면 네트워크 오류 뒤 재시도할 때 예약이 중복 등록될 수 있습니다.
 */
export interface ReservationCreateRequest {
  /**
   * 수신자 목록입니다. 한 요청에 최대 200건까지 동보발송할 수 있습니다. 국제메시지는 국가번호를 포함한 E.164 형식(+ 제외)을 씁니다.
   *
   * 제약: minItems=1, maxItems=200
   */
  destinations: Destination[];
  /**
   * 예약 발송할 메시지 목록입니다. 순서대로 대체발송(Fallback)됩니다.
   *
   * 제약: minItems=1
   */
  messageFlow: ReservationMessageFlowItem[];
  /**
   * 예약 발송 시각입니다. `yyyy-MM-dd HH:mm:ss` 또는 `yyyy-MM-dd'T'HH:mm:ss` 형식을 씁니다.
   * 현재 시각 + 10분부터 1년 이내로 지정할 수 있습니다(너무 이르면 A316, 1년 초과 시 A331).
   * 광고성 메시지는 야간 차단 시간대(20:00~08:00 KST)에 예약할 수 없습니다(A330).
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   *
   * 확인 필요: 시각의 기준 시간대가 명시되지 않았습니다(야간 차단 규칙만 KST로 표기). 형식·범위 제약은 영문 문서(Part B)에만 있습니다.
   */
  resvSendTime: string;
  /**
   * 예약 건을 식별하기 위한 이름입니다.
   *
   * 제약: maxLength=100
   */
  resvName?: string;
  /**
   * 정산용 부서 코드입니다.
   *
   * 제약: maxLength=20
   *
   * 확인 필요: 한국어 문서(Part A)는 SMS/MMS·알림톡 예약 발송에만 paymentCode를 표기하고 국제·RCS·브랜드메시지 예약 발송에는 없습니다.
   */
  paymentCode?: string;
  /**
   * 요청 단위 참조 필드입니다. 리포트에 그대로 담겨 요청·메시지를 구분하는 데 씁니다.
   *
   * 제약: maxLength=200
   */
  ref?: string;
}

export type ReservationCreateServiceResult = ServiceResult & {
  /**
   * 예약 발송 키입니다. 예약 조회·수정·취소·중지·재개·수신자 관리에 씁니다. `data.data`가 아니라 `data` 바로 아래에 있습니다.
   *
   * 확인 필요: 문서 예시마다 resvKey 형식이 다릅니다(`MO`로 시작하는 22자 형식과 `RESV`가 들어간 28자 형식). SDK는 형식을 가정하지 않고 문자열로 다룹니다.
   */
  resvKey?: string;
  data?: SendOmniResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReservationCreateResponse {
  common: CommonResult;
  data?: ReservationCreateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 예약 발송 건입니다.
 */
export interface Reservation {
  /**
   * 예약 순번입니다. 목록 조회의 `lastSeq` 기준값으로 쓸 수 있습니다.
   */
  seq?: number;
  /**
   * 예약 발송 키입니다.
   */
  resvKey?: string;
  /**
   * 정산 코드입니다.
   */
  paymentCode?: string;
  /**
   * 예약명입니다.
   */
  resvName?: string;
  /**
   * 상품 유형입니다. 알려진 값은 `MESSAGE`입니다.
   *
   * 확인 필요: productType 값 목록이 문서에 없습니다(예시에 MESSAGE만 있음).
   */
  productType?: 'MESSAGE' | (string & {});
  /**
   * 예약 상태입니다. 알려진 값: `PENDING`(예약 대기), `PROCESSING`(발송 처리 중), `STOPPED`(예약 중지), `CANCELLED`(취소).
   * 수정은 PENDING, 취소는 PENDING·STOPPED, 중지는 PROCESSING, 재개는 STOPPED 상태에서만 할 수 있습니다(그 밖에는 A824).
   *
   * 확인 필요: 예약 상태 전체 목록(발송 완료 등)이 문서에 없습니다. A824 적용 여부는 에러코드표 설명에서 추정했습니다.
   */
  status?: 'PENDING' | 'PROCESSING' | 'STOPPED' | 'CANCELLED' | (string & {});
  /**
   * 광고 메시지 여부입니다(Y/N).
   */
  adYn?: 'Y' | 'N' | (string & {});
  /**
   * 예약 발송 시각입니다(yyyy-MM-dd HH:mm:ss).
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  resvSendTime?: string;
  /**
   * 예약 발송 요청 본문(JSON 문자열)입니다. 수정 응답과 목록 응답 예시에는 없습니다.
   *
   * 확인 필요: resvData에 담기는 범위가 불명확합니다. 문서 예시는 messageFlow 항목 하나(sms 객체)만 담고 있습니다.
   */
  resvData?: string;
  /**
   * 예상 발송 수량입니다.
   */
  expectedCnt?: number;
  /**
   * 발송 처리 수량입니다.
   */
  sentCnt?: number;
  /**
   * 성공 수량입니다.
   */
  successCnt?: number;
  /**
   * 실패 수량입니다.
   */
  failCnt?: number;
  /**
   * 수정 일시입니다(yyyy-MM-dd HH:mm:ss).
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  updateDate?: string;
  /**
   * 등록 일시입니다(yyyy-MM-dd HH:mm:ss).
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  regDate?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface ReservationListResult {
  /**
   * 다음 페이지 조회에 쓰는 커서입니다. 다음 요청의 `lastSeq` 쿼리에 그대로 넣습니다. 결과가 없으면 0입니다.
   */
  lastSeq?: number;
  /**
   * 다음 페이지가 있는지 여부입니다.
   */
  hasNext?: boolean;
  /**
   * 예약 발송 건 목록입니다.
   */
  reservations?: Reservation[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type ReservationListServiceResult = ServiceResult & {
  data?: ReservationListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReservationListResponse {
  common: CommonResult;
  data?: ReservationListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type ReservationServiceResult = ServiceResult & {
  data?: Reservation;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReservationResponse {
  common: CommonResult;
  data?: ReservationServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 예약 수정 요청입니다. 예약 대기(PENDING) 상태인 예약 건의 발송 시각과 예약명만 바꿀 수 있습니다.
 */
export interface ReservationUpdateRequest {
  /**
   * 변경할 예약 발송 시각입니다(yyyy-MM-dd HH:mm:ss).
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   *
   * 확인 필요: 수정 시 허용 형식(`T` 구분 형식 포함 여부)과 범위 제약(현재+10분~1년, 광고 야간 차단)이 등록 때와 같은지 문서에 없습니다.
   */
  resvSendTime: string;
  /**
   * 예약명입니다.
   *
   * 제약: maxLength=100
   */
  resvName?: string;
}

/**
 * 예약 건에 등록된 수신자입니다.
 */
export interface ReservationRecipient {
  /**
   * 메시지 키입니다. 수신자 삭제에 씁니다.
   */
  msgKey?: string;
  /**
   * 수신자 순번입니다.
   */
  destSeq?: number;
  /**
   * 수신번호입니다.
   */
  to?: string;
  /**
   * 수신자별 치환 데이터입니다.
   *
   * 확인 필요: destData 형식이 불명확합니다. 요청은 replaceWords(JSON 객체)인데 응답 예시는 `name=홍길동` 형태의 문자열입니다.
   */
  destData?: string;
  /**
   * 수신자 상태입니다. 알려진 값은 `PENDING`입니다.
   *
   * 확인 필요: 수신자 상태 값 목록이 문서에 없습니다.
   */
  status?: 'PENDING' | (string & {});
  /**
   * 처리 결과 코드입니다.
   */
  responseCode?: string;
  /**
   * 처리 결과 메시지입니다.
   */
  responseText?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface ReservationRecipientListResult {
  /**
   * 다음 페이지 조회에 쓰는 커서입니다. 다음 요청의 `lastSeq` 쿼리에 그대로 넣습니다.
   */
  lastSeq?: number;
  /**
   * 다음 페이지가 있는지 여부입니다.
   */
  hasNext?: boolean;
  /**
   * 예약 수신자 목록입니다.
   */
  destinations?: ReservationRecipient[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type ReservationRecipientListServiceResult = ServiceResult & {
  data?: ReservationRecipientListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReservationRecipientListResponse {
  common: CommonResult;
  data?: ReservationRecipientListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 예약 수신자 추가 요청입니다.
 */
export interface ReservationRecipientCreateRequest {
  /**
   * 추가할 수신자 목록입니다. 한 번에 최대 1,000건까지 추가할 수 있습니다.
   *
   * 제약: minItems=1, maxItems=1000
   */
  destinations: Destination[];
}

export type ReservationRecipientCreateServiceResult = ServiceResult & {
  data?: SendOmniResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface ReservationRecipientCreateResponse {
  common: CommonResult;
  data?: ReservationRecipientCreateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오(알림톡·브랜드메시지) 발송·읽음·클릭 통계 1건입니다. 카카오가 직접 제공하는 채널 기반 통계입니다.
 *
 * 확인 필요: 비율 필드(sendRate·readRate·clickRate·ctr)의 단위(백분율 여부)와 소수 자릿수가 문서에 없습니다. 예시 값(98.57 등)은 백분율로 보입니다.
 */
export interface InsightKakaoStatistics {
  /**
   * 발송 성공 건수입니다.
   */
  successCount?: number;
  /**
   * 발송 실패 건수입니다.
   */
  failCount?: number;
  /**
   * 읽음 건수입니다.
   */
  readCount?: number;
  /**
   * 버튼 클릭 건수입니다.
   */
  buttonClickCount?: number;
  /**
   * 목록 클릭 건수입니다.
   */
  listClickCount?: number;
  /**
   * 썸네일 클릭 건수입니다.
   */
  thumbnailClickCount?: number;
  /**
   * 기타 클릭 건수입니다.
   */
  etcClickCount?: number;
  /**
   * 발송 성공률입니다.
   */
  sendRate?: number;
  /**
   * 읽음률입니다.
   */
  readRate?: number;
  /**
   * 클릭률입니다.
   */
  clickRate?: number;
  /**
   * CTR(클릭률/읽음률)입니다.
   */
  ctr?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface InsightKakaoStatisticsResult {
  /**
   * 발송 통계 목록입니다.
   *
   * 확인 필요: 주요 인사이트 응답이 배열인데 항목에 발신프로필·템플릿 구분 필드가 없어, 여러 senderKey를 조회할 때 항목이 무엇 단위로 나뉘는지 문서에 없습니다.
   */
  statistics?: InsightKakaoStatistics[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type InsightKakaoStatisticsServiceResult = ServiceResult & {
  data?: InsightKakaoStatisticsResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightKakaoStatisticsResponse {
  common: CommonResult;
  data?: InsightKakaoStatisticsServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오(알림톡·브랜드메시지) 시간대별 반응 통계 1건입니다.
 */
export type InsightKakaoHourlyStatistics = {
  /**
   * 집계 시간대(0~23)입니다.
   *
   * 확인 필요: 한 자리 시간대를 0으로 채우는지(`9`/`09`) 문서에 없습니다.
   */
  hour?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
} & InsightKakaoStatistics;

export interface InsightKakaoHourlyStatisticsResult {
  /**
   * 시간대별 통계 목록입니다.
   */
  statistics?: InsightKakaoHourlyStatistics[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type InsightKakaoHourlyStatisticsServiceResult = ServiceResult & {
  data?: InsightKakaoHourlyStatisticsResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightKakaoHourlyStatisticsResponse {
  common: CommonResult;
  data?: InsightKakaoHourlyStatisticsServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오(알림톡·브랜드메시지) 템플릿별 통계 1건입니다.
 */
export type InsightKakaoTemplateStatistics = {
  /**
   * 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 템플릿 이름입니다.
   */
  templateName?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
} & InsightKakaoStatistics;

export interface InsightKakaoTemplateStatisticsResult {
  /**
   * 템플릿별 통계 목록입니다.
   */
  statistics?: InsightKakaoTemplateStatistics[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type InsightKakaoTemplateStatisticsServiceResult = ServiceResult & {
  data?: InsightKakaoTemplateStatisticsResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightKakaoTemplateStatisticsResponse {
  common: CommonResult;
  data?: InsightKakaoTemplateStatisticsServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 메시지 발송·노출 일자별 통계 1건입니다.
 */
export interface InsightRcsMessageStat {
  /**
   * 통계 일자(yyyyMMdd)입니다.
   *
   * 제약: 형식 yyyyMMdd
   */
  statDate?: string;
  /**
   * 기업 ID입니다.
   */
  corpId?: string;
  /**
   * 사업자등록번호입니다.
   */
  corpRegNum?: string;
  /**
   * RCS 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 챗봇 ID입니다.
   */
  chatbotId?: string;
  /**
   * 그룹 ID입니다. 발송 요청의 `messageFlow[].rcs.groupId` 값입니다.
   */
  groupId?: string;
  /**
   * 메시지베이스 ID입니다.
   */
  messagebaseId?: string;
  /**
   * 발송 건수입니다.
   */
  deliveredCount?: number;
  /**
   * 노출(읽음) 건수입니다.
   */
  displayedCount?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 응답 정보입니다.
 */
export interface InsightRcsMessageStatResult {
  /**
   * 일자별 통계 목록입니다.
   */
  stat?: InsightRcsMessageStat[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 인사이트 응답은 실제 데이터를 `data.data`가 아니라 `data.rcs`에 담습니다.
 */
export type InsightRcsMessageStatServiceResult = ServiceResult & {
  rcs?: InsightRcsMessageStatResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightRcsMessageStatResponse {
  common: CommonResult;
  data?: InsightRcsMessageStatServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 메시지 버튼 1개의 클릭 통계입니다.
 */
export interface InsightRcsButtonClick {
  /**
   * 버튼 번호입니다.
   */
  buttonNum?: number;
  /**
   * 버튼 액션 유형입니다. 알려진 값은 `urlAction`입니다(발송 규격의 action 키 이름으로 보입니다).
   */
  actionType?: 'urlAction' | (string & {});
  /**
   * 버튼 제목입니다.
   */
  title?: string;
  /**
   * 클릭 수입니다.
   */
  clickCount?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 메시지 버튼 클릭 일자별 통계 1건(카드 단위)입니다.
 */
export interface InsightRcsMessageButtonStat {
  /**
   * 통계 일자(yyyyMMdd)입니다.
   *
   * 제약: 형식 yyyyMMdd
   */
  statDate?: string;
  /**
   * 기업 ID입니다.
   */
  corpId?: string;
  /**
   * 사업자등록번호입니다.
   */
  corpRegNum?: string;
  /**
   * RCS 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 챗봇 ID입니다.
   */
  chatbotId?: string;
  /**
   * 그룹 ID입니다.
   */
  groupId?: string;
  /**
   * 메시지베이스 ID입니다.
   */
  messagebaseId?: string;
  /**
   * 반응 유형입니다. 알려진 값은 `button`입니다.
   */
  reactionType?: 'button' | (string & {});
  /**
   * 카드 번호입니다.
   */
  cardNum?: number;
  /**
   * 버튼별 클릭 상세입니다.
   */
  buttonList?: InsightRcsButtonClick[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 응답 정보입니다.
 */
export interface InsightRcsMessageButtonStatResult {
  /**
   * 일자별 버튼 클릭 통계 목록입니다.
   */
  stat?: InsightRcsMessageButtonStat[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 인사이트 응답은 실제 데이터를 `data.data`가 아니라 `data.rcs`에 담습니다.
 */
export type InsightRcsMessageButtonStatServiceResult = ServiceResult & {
  rcs?: InsightRcsMessageButtonStatResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightRcsMessageButtonStatResponse {
  common: CommonResult;
  data?: InsightRcsMessageButtonStatServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 대화방 메뉴 1개의 클릭 통계입니다.
 */
export interface InsightRcsMenuClick {
  /**
   * 포스트백 ID입니다.
   */
  postbackId?: string;
  /**
   * 메뉴 유형입니다. 알려진 값은 `text`입니다.
   */
  menuType?: 'text' | (string & {});
  /**
   * 메뉴 액션 유형입니다. 알려진 값은 `postbackAction`입니다.
   */
  actionType?: 'postbackAction' | (string & {});
  /**
   * 메뉴 제목입니다.
   */
  title?: string;
  /**
   * 클릭 수입니다.
   */
  clickCount?: number;
  /**
   * 하위 메뉴 목록입니다. 상위 메뉴와 같은 항목으로 구성됩니다.
   *
   * 확인 필요: 하위 메뉴가 다시 subList를 가질 수 있는지(중첩 깊이)가 문서에 없습니다.
   */
  subList?: InsightRcsMenuClick[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 대화방 메뉴 클릭 일자별 통계 1건입니다.
 */
export interface InsightRcsPersistentMenuStat {
  /**
   * 통계 일자(yyyyMMdd)입니다.
   *
   * 제약: 형식 yyyyMMdd
   */
  statDate?: string;
  /**
   * 기업 ID입니다.
   */
  corpId?: string;
  /**
   * 사업자등록번호입니다.
   */
  corpRegNum?: string;
  /**
   * RCS 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 챗봇 ID입니다.
   */
  chatbotId?: string;
  /**
   * 메뉴별 클릭 상세입니다.
   */
  menuList?: InsightRcsMenuClick[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 응답 정보입니다.
 */
export interface InsightRcsPersistentMenuStatResult {
  /**
   * 일자별 메뉴 클릭 통계 목록입니다.
   */
  stat?: InsightRcsPersistentMenuStat[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 인사이트 응답은 실제 데이터를 `data.data`가 아니라 `data.rcs`에 담습니다.
 */
export type InsightRcsPersistentMenuStatServiceResult = ServiceResult & {
  rcs?: InsightRcsPersistentMenuStatResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightRcsPersistentMenuStatResponse {
  common: CommonResult;
  data?: InsightRcsPersistentMenuStatServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드 프로필 노출 일자별 통계 1건입니다.
 */
export interface InsightRcsBrandProfileStat {
  /**
   * 통계 일자(yyyyMMdd)입니다.
   *
   * 제약: 형식 yyyyMMdd
   */
  statDate?: string;
  /**
   * 챗봇 ID입니다.
   */
  chatbotId?: string;
  /**
   * 노출 건수입니다.
   */
  displayedCount?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 응답 정보입니다.
 */
export interface InsightRcsBrandProfileStatResult {
  /**
   * 일자별 노출 통계 목록입니다.
   */
  stat?: InsightRcsBrandProfileStat[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 인사이트 응답은 실제 데이터를 `data.data`가 아니라 `data.rcs`에 담습니다.
 */
export type InsightRcsBrandProfileStatServiceResult = ServiceResult & {
  rcs?: InsightRcsBrandProfileStatResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface InsightRcsBrandProfileStatResponse {
  common: CommonResult;
  data?: InsightRcsBrandProfileStatServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오 채널 인증 토큰 요청 본문입니다.
 */
export interface KakaoSenderTokenRequest {
  /**
   * 카카오톡 채널 아이디입니다(`@`로 시작).
   */
  yellowId: string;
  /**
   * 카카오톡 채널 알림을 받는 관리자 전화번호입니다. 이 번호에 연결된 카카오톡이 채널을 차단하지 않았으면 인증 토큰이 발송됩니다.
   */
  phoneNumber: string;
}

/**
 * 카카오 비즈메시지 발신프로필 정보입니다.
 * 발신프로필 등록(`POST /account/kakao/sender`), uuid·senderKey 조회(`GET /account/kakao/sender`),
 * 발신프로필 키로 조회(`GET /center/kakao/sender`) 응답에서 함께 씁니다. 엔드포인트마다 포함되는 필드가 조금씩 다릅니다.
 */
export interface KakaoSenderProfile {
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 카카오톡 채널 아이디(uuid)입니다. `@`로 시작하는 카카오톡 채널 검색용 아이디입니다.
   *
   * 확인 필요: account 경로 응답 예시는 `@`로 시작하는 채널 아이디, center 경로 응답 예시는 UUID 형식 문자열로 서로 다릅니다.
   */
  uuid?: string;
  /**
   * 카카오톡 채널 프로필명입니다.
   */
  name?: string;
  /**
   * 발신프로필 상태값입니다. 알려진 값은 `A`(정상)입니다.
   */
  status?: 'A' | (string & {});
  /**
   * 발신프로필 차단 여부입니다.
   */
  block?: boolean;
  /**
   * 발신프로필 휴면 여부입니다. 휴면이면 휴면 해제(`POST /center/kakao/sender/recover`)로 복구합니다.
   */
  dormant?: boolean;
  /**
   * 카카오톡 채널 상태입니다.
   * - `A`: activated
   * - `C`: deactivated
   * - `B`: block
   * - `E`: deleting
   *
   * 확인 필요: 상태값 목록은 Copy Markdown(Part B)에만 있습니다.
   */
  profileStatus?: 'A' | 'C' | 'B' | 'E';
  /**
   * 등록일입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   *
   * 확인 필요: account 경로 응답 예시는 `yyyy-MM-dd HH:mm:ss`, center 경로 응답 예시는 `yyyy-MM-dd'T'HH:mm:ssXXX` 형식으로 서로 다릅니다.
   */
  createdAt?: string;
  /**
   * 최종 수정일입니다. 형식은 `createdAt`과 같습니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   *
   * 확인 필요: createdAt과 같은 형식 불일치가 있습니다.
   */
  modifiedAt?: string;
  /**
   * 발신프로필 카테고리 코드(11자리 숫자)입니다.
   */
  categoryCode?: string;
  /**
   * 상담톡 사용 여부입니다. 조회 응답에만 있고 등록 응답에는 없습니다.
   */
  bizchat?: boolean;
  /**
   * 브랜드톡 사용 여부입니다. account 경로 응답에만 있습니다.
   */
  brandtalk?: boolean;
  /**
   * 브랜드메시지 타겟팅 사용 여부입니다.
   *
   * 확인 필요: account 경로 문서는 타겟팅 M·N·O, center 경로 문서는 M·N 사용 여부로 설명합니다.
   */
  brandMessage?: boolean;
  /**
   * 상담톡 위탁사 이름입니다. 조회 응답에만 있습니다.
   */
  committalCompanyName?: string;
  /**
   * 메시지 발송 결과 수신 채널키입니다.
   */
  channelKey?: string;
  /**
   * 카카오톡 채널 비즈니스 인증 여부입니다.
   */
  businessProfile?: boolean;
  /**
   * 비즈니스 유형입니다. 알려진 값은 `BUSINESS`입니다. account 경로 응답에만 있습니다.
   */
  businessType?: 'BUSINESS' | (string & {});
  /**
   * 무료수신거부 전화번호입니다.
   */
  unsubscribePhoneNumber?: string;
  /**
   * 무료수신거부 인증번호입니다.
   */
  unsubscribeAuthNumber?: string;
  /**
   * 카카오톡 채널 스팸 상태입니다. 정상 / 경고제한(프로필 초기화, 상담·발송 가능) / 영구제한(상담·발송 불가)입니다.
   * 문서 예시 값은 `정상`입니다.
   *
   * 확인 필요: 정상 외 상태의 실제 문자열 값이 문서에 없습니다(Part B 영문 설명만 있음).
   */
  profileSpamLevel?: '정상' | (string & {});
  /**
   * 카카오톡 메시지 스팸 상태입니다. 정상 / 경고제한(상담·발송 가능) / 활동제한(상담 가능, 발송 불가)입니다.
   * 문서 예시 값은 `정상`입니다.
   *
   * 확인 필요: 정상 외 상태의 실제 문자열 값이 문서에 없습니다(Part B 영문 설명만 있음).
   */
  profileMessageSpamLevel?: '정상' | (string & {});
  /**
   * 알림톡 차단 해제 링크입니다.
   */
  clearBlockUrl?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 정보를 담는 카카오 응답 영역입니다.
 */
export interface KakaoSenderProfileResult {
  senderProfile?: KakaoSenderProfile;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoSenderAccountServiceResult = ServiceResult & {
  /**
   * 호출 결과 메시지입니다.
   */
  resultMsg?: string;
  kakao?: KakaoSenderProfileResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 카카오 채널 인증 토큰 요청, 발신프로필 등록, uuid·senderKey 조회 응답입니다.
 */
export interface KakaoSenderAccountResponse {
  common: CommonResult;
  data?: KakaoSenderAccountServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 인증 토큰으로 발신프로필을 등록하는 요청 본문입니다. 인증 토큰과 관리자 전화번호는 헤더(`token`, `phoneNumber`)로 보냅니다.
 */
export interface KakaoSenderCreateRequest {
  /**
   * 등록할 카카오톡 채널 아이디입니다.
   */
  yellowId: string;
  /**
   * 발신프로필 카테고리 코드(11자리 숫자)입니다. 사용할 수 있는 코드는 카테고리 전체조회로 확인합니다.
   *
   * 제약: pattern=^[0-9]{11}$
   */
  categoryCode: string;
  /**
   * 무료수신거부 전화번호입니다(예 `080-0000-0000`). 브랜드메시지를 쓰는 발신프로필이 설정하며, 타겟팅 M, N, O 사용 시 필수입니다.
   */
  unsubscribePhoneNumber?: string;
  /**
   * 무료수신거부 인증번호입니다(예 `12345`). 타겟팅 M, N, O 사용 시 필수입니다.
   */
  unsubscribeAuthNumber?: string;
}

/**
 * 발신프로필 목록 조회(`GET /account/kakao/sender/profiles`)의 항목 1개입니다.
 */
export interface KakaoSenderChannel {
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 발신키 유형입니다. 문서 예시 값은 `S`입니다.
   *
   * 확인 필요: 이 응답의 senderKeyType 값 목록이 문서에 없습니다(다른 API는 S: 발신프로필, G: 그룹).
   */
  senderKeyType?: 'S' | (string & {});
  /**
   * 카카오톡 채널 이름입니다.
   */
  channelName?: string;
  /**
   * 카카오톡 채널 검색용 아이디입니다.
   */
  channelId?: string;
  /**
   * 카카오톡 채널 키입니다.
   */
  channelKey?: string;
  /**
   * 발신프로필 카테고리 코드입니다.
   */
  categoryCode?: string;
  /**
   * 발신프로필 상태입니다.
   */
  status?: string;
  /**
   * 카카오톡 채널 프로필 상태입니다.
   */
  profileStatus?: string;
  /**
   * 휴면 상태 여부입니다.
   */
  dormant?: boolean;
  /**
   * 차단 상태 여부입니다.
   */
  block?: boolean;
  /**
   * 비즈니스 인증 채널 여부입니다.
   */
  businessProfile?: boolean;
  /**
   * 비즈니스 인증 유형입니다.
   */
  businessType?: string;
  /**
   * 발신프로필 생성 일시(yyyy-MM-dd HH:mm:ss)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 등록 일시(yyyy-MM-dd HH:mm:ss)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  regDate?: string;
  /**
   * 수정 일시(yyyy-MM-dd HH:mm:ss)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  updateDate?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoSenderListServiceResult = ServiceResult & {
  /**
   * 호출 결과 메시지입니다.
   */
  resultMsg?: string;
  /**
   * 현재 페이지 번호입니다.
   */
  page?: number;
  /**
   * 전체 페이지 수입니다.
   */
  totalPage?: number;
  /**
   * 전체 조회 건수입니다.
   */
  totalCount?: number;
  /**
   * 다음 페이지 존재 여부입니다.
   */
  hasNext?: boolean;
  /**
   * 발신프로필 목록입니다.
   */
  channels?: KakaoSenderChannel[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발신프로필 목록 조회 응답입니다.
 */
export interface KakaoSenderListResponse {
  common: CommonResult;
  data?: KakaoSenderListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 키로 조회(`GET /center/kakao/sender`) 응답 데이터입니다.
 */
export interface KakaoSenderResult {
  kakao?: KakaoSenderProfileResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoSenderServiceResult = ServiceResult & {
  data?: KakaoSenderResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발신프로필 키로 조회 응답입니다.
 */
export interface KakaoSenderResponse {
  common: CommonResult;
  data?: KakaoSenderServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 휴면 해제 요청 본문입니다.
 */
export interface KakaoSenderRecoverRequest {
  /**
   * 휴면 해제할 발신프로필 키입니다.
   */
  senderKey: string;
}

/**
 * 발신프로필 카테고리입니다.
 */
export interface KakaoCategory {
  /**
   * 카테고리 코드입니다.
   *
   * 확인 필요: 발신프로필 등록 규격은 11자리 숫자라고 하나 카테고리 조회 응답 예시는 `001`처럼 3자리입니다.
   */
  code?: string;
  /**
   * 카테고리 이름입니다.
   */
  name?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 카테고리 전체조회 응답 데이터입니다.
 */
export interface KakaoCategoryListResult {
  /**
   * 카카오 비즈메시지 응답 데이터입니다.
   */
  kakao?: {
    /**
     * 카테고리 목록입니다.
     */
    categories?: KakaoCategory[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoCategoryListServiceResult = ServiceResult & {
  data?: KakaoCategoryListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발신프로필 카테고리 전체조회 응답입니다.
 */
export interface KakaoCategoryListResponse {
  common: CommonResult;
  data?: KakaoCategoryListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 카테고리 상세조회 응답 데이터입니다.
 */
export interface KakaoCategoryResult {
  /**
   * 카카오 비즈메시지 응답 데이터입니다.
   */
  kakao?: {
    category?: KakaoCategory;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoCategoryServiceResult = ServiceResult & {
  data?: KakaoCategoryResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발신프로필 카테고리 상세조회 응답입니다.
 */
export interface KakaoCategoryResponse {
  common: CommonResult;
  data?: KakaoCategoryServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 그룹입니다.
 */
export interface KakaoGroup {
  /**
   * 그룹 키입니다.
   */
  groupKey?: string;
  /**
   * 그룹 이름입니다.
   */
  groupName?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 그룹 조회 응답 데이터입니다.
 */
export interface KakaoGroupListResult {
  /**
   * 카카오 비즈메시지 응답 데이터입니다.
   */
  kakao?: {
    /**
     * 발신프로필 그룹 목록입니다.
     */
    groups?: KakaoGroup[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoGroupListServiceResult = ServiceResult & {
  data?: KakaoGroupListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발신프로필 그룹 조회 응답입니다.
 */
export interface KakaoGroupListResponse {
  common: CommonResult;
  data?: KakaoGroupListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 그룹에 발신프로필 등록 요청 본문입니다.
 */
export interface KakaoGroupSenderAddRequest {
  /**
   * 발신프로필을 등록할 그룹 키입니다.
   */
  groupKey: string;
  /**
   * 등록할 발신프로필 키입니다. 최대 40자입니다.
   *
   * 제약: maxLength=40
   */
  senderKey: string;
  /**
   * 그룹 이름입니다.
   */
  groupName?: string;
}

/**
 * 발신프로필·템플릿 제재 정보입니다. 제재가 적용되면 발송이 불가하거나 일부 기능이 제한될 수 있습니다.
 */
export interface KakaoSanction {
  /**
   * 제재 적용 시각(yyyy-MM-dd HH:mm:ss)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  restrictedAt?: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 발신프로필 그룹 키입니다.
   */
  groupKey?: string;
  /**
   * 발신프로필 키 타입입니다.
   * - `G`: 그룹
   * - `S`: 발신프로필
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 제재 사유입니다. 알려진 값:
   * - `BZM`: 비즈메시지 운영정책 위반(스팸/어뷰징)
   * - `CHANNEL`: 채널 운영정책 위반
   */
  reasonType?: 'BZM' | 'CHANNEL' | (string & {});
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 제재 조회 응답 데이터입니다.
 */
export interface KakaoSanctionResult {
  /**
   * 카카오 비즈메시지 응답 데이터입니다.
   */
  kakao?: {
    abusing?: KakaoSanction;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type KakaoSanctionServiceResult = ServiceResult & {
  data?: KakaoSanctionResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 제재 조회(발신프로필 제재, 그룹템플릿 발신프로필 제외, 템플릿 제재) 응답입니다.
 */
export interface KakaoSanctionResponse {
  common: CommonResult;
  data?: KakaoSanctionServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 심사 의견 1건입니다.
 */
export interface AlimtalkTemplateComment {
  /**
   * 심사 의견 ID입니다.
   */
  id?: number;
  /**
   * 심사 의견을 남긴 담당자명입니다.
   */
  userName?: string;
  /**
   * 심사 의견 등록일입니다.
   *
   * 확인 필요: 날짜 형식이 문서에 없습니다.
   */
  createdAt?: string;
  /**
   * 해당 의견 시점의 심사 상태입니다.
   */
  status?: string;
  /**
   * 심사 의견에 첨부된 파일 목록입니다.
   *
   * 확인 필요: 첨부 파일 항목의 하위 필드가 문서에 없습니다.
   */
  attachment?: Array<Record<string, unknown>>;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 조회·등록·수정 응답의 알림톡 템플릿 정보입니다. 응답에는 요청 필드 외에 검수 상태, 차단·휴면 여부, 심사 의견 등이 더해집니다.
 * 응답에 따라 일부 필드만 올 수 있습니다.
 */
export interface AlimtalkTemplate {
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 발신프로필 키 타입입니다. 기본값은 `S`입니다.
   * - `G`: 그룹
   * - `S`: 발신프로필
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 템플릿 이름입니다.
   */
  templateName?: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 이 템플릿으로 발송할 때 쓰는 카카오 비즈메시지 타입입니다(`AT` 텍스트형, `AI` 이미지형).
   * 전문 발송의 `AlimtalkMessage.msgType`에 그대로 넣습니다. 필드 표에는 없지만 응답에 옵니다(2026-09-28 sandbox 확인).
   */
  msgType?: 'AT' | 'AI' | (string & {});
  /**
   * 템플릿 메시지 타입입니다. 문서 예시 값은 `BA`입니다.
   */
  templateMessageType?: 'BA' | (string & {});
  /**
   * 템플릿 강조 타입입니다. 문서 예시 값은 `NONE`입니다.
   */
  templateEmphasizeType?: 'NONE' | (string & {});
  /**
   * 템플릿 본문입니다.
   */
  text?: string;
  /**
   * 강조표기형 템플릿 제목입니다.
   */
  title?: string;
  /**
   * 강조 표기 보조 문구입니다.
   */
  subTitle?: string;
  /**
   * 메시지 상단에 표시할 제목입니다.
   */
  header?: string;
  /**
   * 이미지 이름입니다.
   */
  imgName?: string;
  /**
   * 이미지 URL입니다.
   */
  imgUrl?: string;
  link?: AlimtalkLink;
  attachment?: AlimtalkAttachment;
  supplement?: AlimtalkSupplement;
  /**
   * 템플릿 카테고리 코드입니다.
   */
  categoryCode?: string;
  /**
   * 보안 템플릿 여부입니다.
   */
  securityFlag?: boolean;
  /**
   * 연령 인증 설정 여부입니다.
   */
  adultFlag?: boolean;
  /**
   * 템플릿 미리보기 메시지입니다.
   */
  previewMessage?: string;
  /**
   * 부가 정보입니다.
   */
  extra?: string;
  /**
   * 검수 상태입니다.
   * - `REG`: 등록
   * - `REQ`: 검수 요청
   * - `APR`: 승인
   * - `REJ`: 반려
   *
   * 확인 필요: 검수 상태 값 목록은 Copy Markdown(Part B)에만 있습니다.
   */
  inspectionStatus?: 'REG' | 'REQ' | 'APR' | 'REJ';
  /**
   * 템플릿 상태입니다. 목록 조회·최근 변경 템플릿 조회 응답에 있습니다.
   *
   * 확인 필요: 값 목록이 문서에 없고, 목록 조회 예시는 `A`, 최근 변경 조회 예시는 `APR`로 서로 다릅니다. 검수 요청 문서는 '템플릿 상태가 대기'일 때 요청 가능하다고 하나 대기에 해당하는 코드가 없습니다.
   */
  status?: string;
  /**
   * 템플릿 차단 여부입니다. `true` 또는 `false` 문자열입니다.
   *
   * 확인 필요: 문서상 타입이 Boolean이 아닌 String입니다(발신프로필의 block은 Boolean).
   */
  block?: 'true' | 'false' | (string & {});
  /**
   * 템플릿 휴면 여부입니다. `true` 또는 `false` 문자열입니다.
   *
   * 확인 필요: 문서상 타입이 Boolean이 아닌 String입니다(발신프로필의 dormant는 Boolean).
   */
  dormant?: 'true' | 'false' | (string & {});
  /**
   * 생성일입니다.
   *
   * 확인 필요: 날짜 형식이 문서에 없습니다.
   */
  createdAt?: string;
  /**
   * 수정일입니다.
   *
   * 확인 필요: 날짜 형식이 문서에 없습니다.
   */
  modifiedAt?: string;
  /**
   * 템플릿 심사 의견 목록입니다.
   */
  comments?: AlimtalkTemplateComment[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 조회·등록·수정 응답 데이터입니다.
 */
export interface AlimtalkTemplateResult {
  alimtalk?: AlimtalkTemplate;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type AlimtalkTemplateServiceResult = ServiceResult & {
  data?: AlimtalkTemplateResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 알림톡 템플릿 조회·등록·수정 응답입니다.
 */
export interface AlimtalkTemplateResponse {
  common: CommonResult;
  data?: AlimtalkTemplateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 알림톡 템플릿 등록·수정 요청의 템플릿 정보(`alimtalk`)입니다.
 * 이미지형·아이템리스트형 템플릿은 템플릿 이미지 업로드(`POST /file/alimtalk/template`)로 받은 `imgUrl`과 이름을 `imgUrl`, `imgName`에 넣습니다.
 * 버튼·바로연결·아이템 구조는 발송 규격의 `AlimtalkButton`, `AlimtalkQuickReply`, `AlimtalkItem` 등과 같습니다.
 */
export interface AlimtalkTemplateBody {
  /**
   * 카카오 비즈메시지 발신프로필 키입니다. `senderKeyType`이 `G`이면 그룹 키입니다.
   */
  senderKey: string;
  /**
   * 발신프로필 키 타입입니다. 기본값은 `S`입니다.
   * - `G`: 그룹
   * - `S`: 발신프로필
   * @defaultValue "S" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 템플릿 이름입니다. 최대 200자입니다.
   *
   * 제약: maxLength=200
   */
  templateName: string;
  /**
   * 알림톡 템플릿 코드입니다. 최대 30자입니다.
   *
   * 제약: maxLength=30
   */
  templateCode: string;
  /**
   * 템플릿 메시지 타입입니다. 문서 예시 값은 `BA`입니다.
   *
   * 확인 필요: 템플릿 메시지 타입 코드 전체 목록이 문서에 없습니다.
   */
  templateMessageType: 'BA' | (string & {});
  /**
   * 템플릿 강조 타입입니다. 문서 예시 값은 `NONE`입니다.
   *
   * 확인 필요: 템플릿 강조 타입 코드 전체 목록과 타입별 필수 필드(title, imgUrl, itemHighlight 등)가 문서에 없습니다.
   */
  templateEmphasizeType: 'NONE' | (string & {});
  /**
   * 알림톡 템플릿 본문입니다. 최대 1,300자이며 `#{변수}` 형식의 치환 변수를 쓸 수 있습니다.
   *
   * 제약: maxLength=1300
   */
  text: string;
  /**
   * 강조표기형 템플릿 제목입니다. 최대 50자입니다.
   *
   * 제약: maxLength=50
   */
  title?: string;
  /**
   * 강조 표기 보조 문구입니다.
   */
  subTitle?: string;
  /**
   * 메시지 상단에 표시할 제목입니다.
   */
  header?: string;
  /**
   * 템플릿 이미지 파일 이름입니다.
   *
   * 확인 필요: 이미지 업로드 응답은 `fileName`을 돌려주므로 `imgName`에 그 값을 그대로 넣는지 문서에 명시되지 않았습니다.
   */
  imgName?: string;
  /**
   * 템플릿 이미지 URL입니다. 템플릿 이미지 업로드 응답의 `imgUrl`을 씁니다.
   */
  imgUrl?: string;
  link?: AlimtalkLink;
  attachment?: AlimtalkAttachment;
  supplement?: AlimtalkSupplement;
  /**
   * 템플릿 카테고리 코드입니다. 템플릿 카테고리 전체 조회로 확인합니다.
   */
  categoryCode?: string;
  /**
   * 보안 템플릿 여부입니다.
   */
  securityFlag?: boolean;
  /**
   * 연령 인증 설정 여부입니다. 수신자가 연령 인증을 마치기 전까지 채팅방에서 메시지가 가려지며 만 20세 이상만 볼 수 있습니다. 기본값은 `false`입니다.
   * @defaultValue false (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  adultFlag?: boolean;
  /**
   * 템플릿 미리보기 메시지입니다.
   */
  previewMessage?: string;
  /**
   * 부가 정보입니다.
   */
  extra?: string;
}

/**
 * 알림톡 템플릿 등록(`POST`)·수정(`PUT`) 요청 본문입니다.
 */
export interface AlimtalkTemplateSaveRequest {
  alimtalk: AlimtalkTemplateBody;
}

/**
 * 템플릿 목록 조회·최근 변경 템플릿 조회 응답 데이터입니다.
 */
export interface AlimtalkTemplateListResult {
  /**
   * 알림톡 템플릿 결과 영역입니다.
   */
  alimtalk?: {
    /**
     * 조회한 템플릿 목록입니다.
     *
     * 확인 필요: 최근 변경 템플릿 조회 응답 예시에는 필드 표에 없는 `msgType`(예 AT)이 들어 있습니다.
     */
    templates?: AlimtalkTemplate[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type AlimtalkTemplateListServiceResult = ServiceResult & {
  data?: AlimtalkTemplateListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 알림톡 템플릿 목록 응답입니다.
 */
export interface AlimtalkTemplateListResponse {
  common: CommonResult;
  data?: AlimtalkTemplateListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 알림톡 템플릿 이미지 업로드 요청(multipart/form-data)입니다.
 */
export interface AlimtalkTemplateImageUploadRequest {
  /**
   * 업로드할 이미지 파일입니다. 권장 크기 800×400px, 가로 500px 이상, 비율(세로÷가로) 0.5, 형식 jpg·png, 최대 500KB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있고, 500KB의 기준(1000/1024)이 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

/**
 * 알림톡 템플릿 이미지·아이템 하이라이트 이미지 업로드 결과입니다.
 */
export interface AlimtalkTemplateImageUploadResult {
  /**
   * 업로드된 이미지 URL입니다. 템플릿 등록의 `imgUrl`에 씁니다.
   */
  imgUrl?: string;
  /**
   * 업로드된 이미지 파일 이름입니다.
   */
  fileName?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type AlimtalkTemplateImageUploadServiceResult = ServiceResult & {
  data?: AlimtalkTemplateImageUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 알림톡 템플릿 이미지 업로드 응답입니다. MMS 업로드(`FileUploadResponse`)와 달리 `fileKey`가 아닌 `imgUrl`, `fileName`을 돌려줍니다.
 */
export interface AlimtalkTemplateImageUploadResponse {
  common: CommonResult;
  data?: AlimtalkTemplateImageUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 알림톡 템플릿 아이템 하이라이트 이미지 업로드 요청(multipart/form-data)입니다.
 */
export interface AlimtalkTemplateItemHighlightImageUploadRequest {
  /**
   * 업로드할 아이템 하이라이트 이미지 파일입니다. 108×108px 이상, 비율(세로÷가로) 1, 형식 jpg·png, 최대 500KB입니다.
   *
   * 확인 필요: 이미지 규격(크기·비율·형식·용량)은 Copy Markdown(Part B)에만 있습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
}

/**
 * 알림톡 템플릿 카테고리입니다.
 */
export interface AlimtalkTemplateCategory {
  /**
   * 카테고리 코드입니다.
   */
  code?: string;
  /**
   * 카테고리 이름입니다.
   */
  name?: string;
  /**
   * 카테고리 그룹 이름입니다.
   */
  groupName?: string;
  /**
   * 포함 기준 설명입니다.
   */
  inclusion?: string;
  /**
   * 제외 기준 설명입니다.
   */
  exclusion?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 카테고리 조회 응답 데이터입니다.
 * `categoryCode` 없이 호출하면 `categories`(전체 목록), `categoryCode`를 주면 `category`(상세 1건)가 옵니다.
 */
export interface AlimtalkTemplateCategoryResult {
  /**
   * 템플릿 카테고리 목록입니다(전체 조회).
   */
  categories?: AlimtalkTemplateCategory[];
  category?: AlimtalkTemplateCategory;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type AlimtalkTemplateCategoryServiceResult = ServiceResult & {
  data?: AlimtalkTemplateCategoryResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 알림톡 템플릿 카테고리 조회 응답입니다.
 */
export interface AlimtalkTemplateCategoryResponse {
  common: CommonResult;
  data?: AlimtalkTemplateCategoryServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 알림톡 템플릿 검수 요청 본문(JSON)입니다. 템플릿 상태가 대기이고 검수 상태가 등록(`REG`)일 때 요청할 수 있습니다.
 */
export interface AlimtalkTemplateInspectionRequest {
  /**
   * 검수 요청할 알림톡 템플릿 정보입니다.
   */
  alimtalk: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 발신프로필 키 타입입니다. 기본값은 `S`입니다.
     * - `G`: 그룹
     * - `S`: 발신프로필
     * @defaultValue "S" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
     */
    senderKeyType?: 'G' | 'S';
    /**
     * 템플릿 코드입니다.
     */
    templateCode: string;
    /**
     * 검수 의견 또는 문의 사항입니다.
     */
    comment?: string;
  };
}

/**
 * 알림톡 템플릿 검수 요청(파일첨부, multipart/form-data)입니다. 파일 형식은 png, jpg, jpeg, gif, pdf, hwp, doc, docx입니다.
 */
export interface AlimtalkTemplateInspectionFileRequest {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 발신프로필 키 타입입니다. 기본값은 `S`입니다.
   * - `G`: 그룹
   * - `S`: 발신프로필
   * @defaultValue "S" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 템플릿 코드입니다.
   */
  templateCode: string;
  /**
   * 검수 의견 또는 문의 사항입니다. 파일첨부 요청에서는 필수입니다.
   */
  comment: string;
  /**
   * 검수 요청에 첨부할 파일입니다. `attachment` 필드를 반복해 최대 10개까지 보낼 수 있으며, 파일당 최대 50MB, 합계 최대 100MB입니다.
   *
   * 제약: maxItems=10
   *
   * 확인 필요: 한국어 페이지(Part A)는 단일 Binary로, Copy Markdown(Part B)은 최대 10개·파일당 50MB·합계 100MB로 설명합니다. 여러 파일을 같은 필드명으로 반복하는지 확인이 필요합니다.
   */
  attachment?: UploadFile[];
}

/**
 * 알림톡 템플릿 검수 요청 취소 본문입니다.
 */
export interface AlimtalkTemplateInspectionCancelRequest {
  /**
   * 검수 요청 취소 대상 템플릿 정보입니다.
   */
  alimtalk: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 템플릿 코드입니다.
     */
    templateCode: string;
  };
}

/**
 * 카카오가 제공하는 공용템플릿 1건입니다.
 */
export interface AlimtalkTemplatePublic {
  /**
   * 공용 템플릿 이름입니다.
   */
  templateName?: string;
  /**
   * 공용 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 공용 템플릿 상태입니다. 문서 예시 값은 `APR`입니다.
   */
  status?: 'APR' | (string & {});
  /**
   * 카테고리 코드입니다.
   */
  categoryCode?: string;
  /**
   * 공용 템플릿 배포 일시(yyyy-MM-dd HH:mm:ss)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  releaseDate?: string;
  /**
   * 미리보기 이미지 URL입니다.
   */
  previewImageUrl?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 공용템플릿 조회 응답 데이터입니다.
 */
export interface AlimtalkTemplatePublicListResult {
  /**
   * 공용 템플릿 목록입니다.
   */
  templates?: AlimtalkTemplatePublic[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type AlimtalkTemplatePublicListServiceResult = ServiceResult & {
  data?: AlimtalkTemplatePublicListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 공용템플릿 조회 응답입니다.
 */
export interface AlimtalkTemplatePublicListResponse {
  common: CommonResult;
  data?: AlimtalkTemplatePublicListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 동보 발송 요청 정보입니다.
 */
export interface BrandMessageGroupSend {
  /**
   * 동보 발송 요청 아이디입니다.
   */
  requestId?: string;
  /**
   * 동보 발송 상태입니다. 알려진 값: `READY`(발송 대기), `SENDING`(발송 중), `PAUSED`(발송 중지), `DONE`(발송 완료), `TERMINATED`(발송 종료), `BLOCKED`(발송 차단).
   */
  status?: 'READY' | 'SENDING' | 'PAUSED' | 'DONE' | 'TERMINATED' | 'BLOCKED' | (string & {});
  /**
   * 동보 발송 시작 일시(`yyyy-MM-dd HH:mm:ss`, KST)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  sendStartAt?: string;
  /**
   * 고객 캠페인 식별자입니다.
   */
  campaignId?: string;
  /**
   * 초당 발송 건수 상한입니다.
   */
  tpsLimit?: number;
  /**
   * 메시지 푸시 알림 발송 여부입니다.
   */
  pushAlarm?: 'Y' | 'N';
  /**
   * 예상 발송 수입니다.
   */
  expectedCount?: number;
  /**
   * 실제 발송 처리 수입니다.
   */
  sendCount?: number;
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 브랜드메시지 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 기본형 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 친구 그룹 키입니다. 전체 친구 대상이면 없을 수 있습니다.
   */
  friendGroupKey?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 동보 발송 응답 데이터입니다.
 */
export interface BrandMessageGroupSendResult {
  /**
   * 동보 발송 기본 정보입니다.
   */
  brandmessage?: BrandMessageGroupSend;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageGroupSendServiceResult = ServiceResult & {
  data?: BrandMessageGroupSendResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 동보 발송 생성·제어·조회 응답입니다.
 */
export interface BrandMessageGroupSendResponse {
  common: CommonResult;
  data?: BrandMessageGroupSendServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드메시지 기본형 템플릿 동보 발송 요청입니다.
 */
export interface BrandMessageGroupSendCreateRequest {
  /**
   * 기본형 템플릿 동보 발송 정보입니다.
   */
  brandmessage: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 기본형 템플릿 코드입니다. 변수가 없고 상태가 등록(`A`)인 템플릿이어야 합니다.
     */
    templateCode: string;
    /**
     * 친구 그룹 등록으로 발급받은 키입니다. 생략하면 전체 친구를 대상으로 합니다. 친구 그룹을 쓰면 그룹 상태가 완료이고 등록 유저 수(`userCount`)가 10 이상이어야 합니다.
     */
    friendGroupKey?: string;
    /**
     * 동보 발송 시작 일시(`yyyy-MM-dd HH:mm:ss`, KST)입니다. 요청 시점으로부터 10분 이후, 08:00~20:50 범위로 설정합니다. 20:50~익일 08:00에는 자동 중지 후 익일 08:00 이후 자동 재개됩니다.
     *
     * 제약: 형식 yyyy-MM-dd HH:mm:ss
     */
    sendStartAt: string;
    /**
     * 고객 캠페인 식별자입니다. 동일 캠페인의 중복 발송을 방지하는 데 사용합니다.
     *
     * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다. 중복 방지 동작(같은 campaignId 재요청 시 결과)도 문서에 없습니다.
     */
    campaignId?: string;
    /**
     * 초당 발송 건수 상한입니다.
     *
     * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다. 허용 범위가 문서에 없습니다.
     */
    tpsLimit?: number;
    /**
     * 메시지 푸시 알림 발송 여부입니다. 기본값은 `Y`입니다.
     * @defaultValue "Y" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
     */
    pushAlarm?: 'Y' | 'N';
    /**
     * 최초 발신사업자 식별코드입니다. 재판매사·특수부가통신사업자는 필수입니다. 최대 9자입니다.
     *
     * 제약: maxLength=9
     */
    originCID?: string;
  };
  /**
   * 정산용 부서 코드입니다. 최대 20자입니다.
   *
   * 제약: maxLength=20
   */
  paymentCode?: string;
}

/**
 * 동보 발송 제어(재개·중지·종료) 요청입니다.
 */
export interface BrandMessageGroupSendControlRequest {
  /**
   * 동보 발송 제어 정보입니다.
   */
  brandmessage: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 동보 발송 요청 아이디입니다. 동보 발송 응답의 `requestId`를 씁니다.
     */
    requestId: string;
  };
}

/**
 * 발송 가능 수 응답 데이터입니다.
 */
export interface BrandMessageAudiencePossibleResult {
  /**
   * 동보 발송 가능 수 결과입니다.
   */
  brandmessage?: {
    /**
     * 예상 발송 수입니다.
     */
    possible?: number;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageAudiencePossibleServiceResult = ServiceResult & {
  data?: BrandMessageAudiencePossibleResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발송 예상 모수 확인 응답입니다.
 */
export interface BrandMessageAudiencePossibleResponse {
  common: CommonResult;
  data?: BrandMessageAudiencePossibleServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 전화번호 명단 기반 발송 예상 모수 확인 요청입니다.
 */
export interface BrandMessageAudiencePossibleByPhoneNumbersRequest {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 발송 가능 여부를 확인할 전화번호 목록입니다. 최소 10건이며, 하나라도 형식이 잘못되면 요청 전체가 거부됩니다. 국가코드는 자동 정규화됩니다(010 / +82 / 82 → 82).
   *
   * 제약: minItems=10
   */
  phoneNumbers: string[];
}

/**
 * 친구 수 응답 데이터입니다.
 */
export interface BrandMessageAudienceFriendCountResult {
  /**
   * 친구 수 조회 결과입니다.
   */
  brandmessage?: {
    /**
     * 보유 친구 수입니다.
     */
    count?: number;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageAudienceFriendCountServiceResult = ServiceResult & {
  data?: BrandMessageAudienceFriendCountResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 채널 전체 친구 수 조회 응답입니다.
 */
export interface BrandMessageAudienceFriendCountResponse {
  common: CommonResult;
  data?: BrandMessageAudienceFriendCountServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 예상 시간 응답 데이터입니다.
 */
export interface BrandMessageAudienceEstimateResult {
  /**
   * 동보 발송 예상 시간 결과입니다.
   */
  brandmessage?: {
    /**
     * 예상 종료 시각(`yyyy-MM-dd'T'HH:mm:ss`, KST)입니다.
     *
     * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
     */
    estimatedFinishedAt?: string;
    /**
     * 예상 소요 시간(분)입니다.
     */
    duration?: number;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageAudienceEstimateServiceResult = ServiceResult & {
  data?: BrandMessageAudienceEstimateResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 동보 발송 예상 소요시간 조회 응답입니다.
 */
export interface BrandMessageAudienceEstimateResponse {
  common: CommonResult;
  data?: BrandMessageAudienceEstimateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드메시지 발송권한(고객사 회원 대상 발송, targeting M·N·O) 신청 요청입니다.
 */
export interface BrandMessagePermissionApplyRequest {
  /**
   * 발송 권한 신청 정보입니다. 다른 브랜드메시지 API와 달리 키 이름이 `brandMessage`(대문자 M)입니다.
   *
   * 확인 필요: 다른 API는 `brandmessage`(소문자)를 쓰는데 이 API만 `brandMessage`로 표기되어 있습니다(Part A·B 동일). 서버가 대소문자를 구분하는지 확인이 필요합니다.
   */
  brandMessage: {
    /**
     * 발신프로필 키입니다. 최대 40자입니다.
     *
     * 제약: maxLength=40
     */
    senderKey: string;
  };
}

export interface BrandMessageCatalogFileUploadRequest {
  /**
   * 업로드할 카탈로그(FG) 아이템 이미지 파일입니다. 1:1 비율 이미지를 씁니다. 홀수형의 첫 번째 아이템(2:1)은 카탈로그 홀수형 첫번째 이미지 업로드를 씁니다.
   *
   * 확인 필요: 형식·용량·권장 크기가 문서에 없습니다(이 엔드포인트는 Copy Markdown(Part B)에 없음).
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   */
  imageName?: string;
}

export interface BrandMessageCatalogOddFirstFileUploadRequest {
  /**
   * 업로드할 카탈로그 홀수형(아이템 3·5·7개) 첫 번째 아이템 이미지 파일입니다. 2:1 가로형 비율 이미지를 씁니다.
   *
   * 확인 필요: 형식·용량·권장 크기가 문서에 없습니다(이 엔드포인트는 Copy Markdown(Part B)에 없음).
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   */
  imageName?: string;
}

/**
 * 동영상 업로드 등록(업로드 채널 발급) 요청입니다.
 */
export interface BrandMessageVideoUploadRegisterRequest {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   *
   * 제약: maxLength=40
   */
  senderKey: string;
  /**
   * 업로드할 동영상 파일 이름입니다.
   */
  fileName: string;
  /**
   * 업로드할 동영상 파일 크기(byte)입니다.
   *
   * 확인 필요: 문서 타입이 Number로만 표기되어 정수 여부와 최대 용량을 알 수 없습니다.
   */
  fileSize: number;
}

/**
 * 발급된 카카오 업로드 채널 정보입니다. `uploadUrl`과 `token`은 발급 후 5분간만 유효합니다. 파일은 `POST {uploadUrl}`에 `x-kamp-upload-token: {token}` 헤더와 multipart `file` 필드로 직접 전송합니다(비즈고 API를 거치지 않음).
 */
export interface BrandMessageVideoUploadChannel {
  /**
   * 동영상 식별자입니다. 이후 조회 API에서 사용합니다.
   */
  vid?: string;
  /**
   * 동영상 파일을 전송할 카카오 업로드 URL입니다.
   */
  uploadUrl?: string;
  /**
   * 업로드 요청 시 `x-kamp-upload-token` 헤더로 보낼 인증 토큰(JWT)입니다.
   */
  token?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 업로드 등록 결과 데이터입니다.
 */
export interface BrandMessageVideoUploadRegisterResult {
  /**
   * 브랜드메시지 응답 영역입니다.
   */
  brandmessage?: {
    /**
     * 발급된 업로드 채널 정보입니다.
     */
    video?: BrandMessageVideoUploadChannel;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageVideoUploadRegisterServiceResult = ServiceResult & {
  data?: BrandMessageVideoUploadRegisterResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 동영상 업로드 등록 응답입니다. `A000`은 업로드 채널 발급 성공만 뜻하며, 사용 가능 여부는 동영상 조회의 `status`로 확인합니다.
 */
export interface BrandMessageVideoUploadRegisterResponse {
  common: CommonResult;
  data?: BrandMessageVideoUploadRegisterServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 기존 동영상 등록 요청입니다. 카카오톡 채널에 이미 올라가 있는 `PUBLIC` 또는 `PRIVATE` 상태의 동영상을 재업로드 없이 등록합니다.
 *
 * 확인 필요: Part A는 `vid`·`videoUrl` 중 정확히 하나만 입력해야 하며 둘 다 입력하거나 비우면 `A502`라고 하나, Part B 규칙 설명은 '하나 이상, 둘 다 입력 시 videoUrl 우선'이라고 합니다. Part A를 따릅니다.
 */
export interface BrandMessageVideoRegisterRequest {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   *
   * 제약: maxLength=40
   */
  senderKey: string;
  /**
   * 등록할 동영상 식별자입니다. `videoUrl`과 함께 사용할 수 없습니다.
   */
  vid?: string;
  /**
   * 등록할 채널 동영상 URL입니다. 형식: `https://business.kakao.com/{채널식별자}/videos/{vid}`. `vid`와 함께 사용할 수 없습니다.
   */
  videoUrl?: string;
}

/**
 * 브랜드메시지 동영상 정보입니다.
 */
export interface BrandMessageVideoInfo {
  /**
   * 동영상 식별자입니다.
   */
  vid?: string;
  /**
   * 동영상 처리 상태입니다. 알려진 값: `REGISTERED`(업로드 등록됨), `ENCODING`(인코딩 중), `PUBLIC`(공개, 발송·템플릿 등록 가능), `PRIVATE`(비공개, 템플릿 등록만 가능), `VIOLATED`(정책 위반), `ILLEGAL`(불법촬영물), `DELETED`(삭제됨), `ERROR`(업로드·인코딩 오류).
   */
  status?: 'REGISTERED' | 'ENCODING' | 'PUBLIC' | 'PRIVATE' | 'VIOLATED' | 'ILLEGAL' | 'DELETED' | 'ERROR' | (string & {});
  /**
   * 동영상 제목입니다.
   */
  title?: string;
  /**
   * 동영상 썸네일 URL입니다.
   */
  thumbnailUrl?: string;
  /**
   * 동영상 재생 URL입니다.
   */
  videoUrl?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 동영상 응답 데이터입니다.
 */
export interface BrandMessageVideoInfoResult {
  /**
   * 브랜드메시지 응답 영역입니다.
   */
  brandmessage?: {
    /**
     * 동영상 정보입니다.
     */
    video?: BrandMessageVideoInfo;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageVideoInfoServiceResult = ServiceResult & {
  data?: BrandMessageVideoInfoResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 기존 동영상 등록·동영상 조회 응답입니다.
 */
export interface BrandMessageVideoInfoResponse {
  common: CommonResult;
  data?: BrandMessageVideoInfoServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 동영상 업로드 이력 1건입니다.
 */
export interface BrandMessageVideoListEntry {
  /**
   * 동영상 식별자입니다.
   */
  vid?: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 업로드한 파일 이름입니다.
   */
  fileName?: string;
  /**
   * 업로드한 파일 크기(byte)입니다.
   */
  fileSize?: number;
  /**
   * 동영상 처리 상태입니다. 알려진 값: `REGISTERED`(업로드 등록됨), `ENCODING`(인코딩 중), `PUBLIC`(공개, 발송·템플릿 등록 가능), `PRIVATE`(비공개, 템플릿 등록만 가능), `VIOLATED`(정책 위반), `ILLEGAL`(불법촬영물), `DELETED`(삭제됨), `ERROR`(업로드·인코딩 오류).
   */
  status?: 'REGISTERED' | 'ENCODING' | 'PUBLIC' | 'PRIVATE' | 'VIOLATED' | 'ILLEGAL' | 'DELETED' | 'ERROR' | (string & {});
  /**
   * 동영상 제목입니다.
   */
  title?: string;
  /**
   * 동영상 썸네일 URL입니다. 처리 실패 시 빈 값입니다.
   */
  thumbnailUrl?: string;
  /**
   * 동영상 재생 URL입니다. 처리 실패 시 빈 값입니다.
   */
  videoUrl?: string;
  /**
   * 카카오 기준 최종 변경 일시(`yyyy-MM-dd HH:mm:ss`)입니다. 처리 실패 시 반환되지 않습니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  modifiedAt?: string;
  /**
   * 업로드 등록 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  regDate?: string;
  /**
   * 최종 갱신 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  updateDate?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 동영상 목록 데이터입니다.
 */
export interface BrandMessageVideoListResult {
  /**
   * 조회 시작 위치입니다.
   */
  offset?: number;
  /**
   * 조회 건수입니다.
   */
  limit?: number;
  /**
   * 전체 동영상 건수입니다.
   */
  totalCount?: number;
  /**
   * 동영상 이력 배열입니다.
   */
  videos?: BrandMessageVideoListEntry[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageVideoListServiceResult = ServiceResult & {
  data?: BrandMessageVideoListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 동영상 목록 조회 응답입니다.
 */
export interface BrandMessageVideoListResponse {
  common: CommonResult;
  data?: BrandMessageVideoListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드메시지 템플릿 상세 정보입니다.
 *
 * 확인 필요: 응답 필드 표에 `templateName`, `headerDescription`, `catalogVariable`, 카탈로그(`attachment.catalog`)가 없어 응답에 포함되는지 알 수 없습니다. 첨부 스키마는 발송용 스키마를 재사용하므로 발송 규격의 필수 표시가 응답에도 적용되는지는 확인이 필요합니다.
 */
export interface BrandMessageTemplate {
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 브랜드메시지 발송 타입입니다(`basic`, `free`).
   */
  sendType?: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 브랜드메시지 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 템플릿 본문입니다.
   */
  text?: string;
  /**
   * 캐러셀 정보입니다.
   */
  carousel?: BrandMessageCarousel;
  /**
   * 첨부 정보입니다.
   */
  attachment?: BrandMessageAttachment;
  /**
   * 헤더 정보입니다.
   */
  header?: string;
  /**
   * 부가 정보입니다.
   */
  additionalContent?: string;
  /**
   * 메시지 푸시 알림 발송 여부입니다.
   */
  pushAlarm?: 'Y' | 'N';
  /**
   * 메시지 영역 변수입니다.
   */
  messageVariable?: Record<string, unknown>;
  /**
   * 버튼 영역 변수입니다.
   */
  buttonVariable?: Record<string, unknown>;
  /**
   * 쿠폰 영역 변수입니다.
   */
  couponVariable?: Record<string, unknown>;
  /**
   * 이미지 영역 변수입니다.
   */
  imageVariable?: Record<string, unknown>;
  /**
   * 비디오 영역 변수입니다.
   */
  videoVariable?: Record<string, unknown>;
  /**
   * 커머스 영역 변수입니다.
   */
  commerceVariable?: Record<string, unknown>;
  /**
   * 캐러셀 영역 변수입니다.
   */
  carouselVariable?: BrandMessageCarouselVariable[];
  /**
   * 등록일(`yyyy-MM-dd'T'HH:mm:ssXXX`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  createAt?: string;
  /**
   * 수정일(`yyyy-MM-dd'T'HH:mm:ssXXX`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  modifiedAt?: string;
  /**
   * 템플릿 상태입니다. 알려진 값: `A`(등록), `S`(차단).
   */
  status?: 'A' | 'S' | (string & {});
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 응답 데이터입니다.
 */
export interface BrandMessageTemplateResult {
  /**
   * 브랜드메시지 템플릿 정보입니다.
   */
  brandmessage?: BrandMessageTemplate;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageTemplateServiceResult = ServiceResult & {
  data?: BrandMessageTemplateResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 브랜드메시지 템플릿 조회·등록·수정 응답입니다.
 */
export interface BrandMessageTemplateResponse {
  common: CommonResult;
  data?: BrandMessageTemplateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드메시지 템플릿 등록·수정 정보입니다. 이미지가 필요한 유형은 이미지 파일 관리 API로 먼저 `imgUrl`을 발급받아 씁니다.
 *
 * 확인 필요: 등록 요청 필드 표에 응답용으로 보이는 `createAt`·`modifiedAt`·`status`가 포함되어 있습니다(문서 그대로 옮김). 변수 객체(`*Variable`) 내부 구조도 문서에 없습니다.
 */
export interface BrandMessageTemplateInput {
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 발신프로필 키 타입입니다. 문서 예시 값은 `S`입니다.
   *
   * 확인 필요: Part A 필드 표는 필수로 표시하지만 요청 예시와 Part B 필드 표에는 없습니다. 값 목록도 문서에 없습니다.
   */
  senderKeyType: string;
  /**
   * 브랜드메시지 발송 타입입니다. `basic`(기본형) 또는 `free`(자유형)입니다.
   *
   * 확인 필요: `basic`/`free` 값 목록은 Part B에만 있습니다. 자유형(`free`) 템플릿의 의미가 문서에 설명되어 있지 않습니다.
   */
  sendType: 'basic' | 'free';
  /**
   * 템플릿 이름입니다. 최대 200자입니다.
   *
   * 제약: maxLength=200
   */
  templateName: string;
  /**
   * 브랜드메시지 메시지 타입입니다. 알려진 값: `FT`, `FI`, `FW`, `FL`, `FC`, `FM`, `FA`, `FP`, `FG`(카탈로그).
   */
  msgType: 'FT' | 'FI' | 'FW' | 'FL' | 'FC' | 'FM' | 'FA' | 'FP' | 'FG' | (string & {});
  /**
   * 템플릿 코드입니다. 수정 시 대상 템플릿을 지정합니다.
   *
   * 확인 필요: 등록 시 직접 지정할 수 있는지(응답에서 발급되는지), 수정 시 필수인지 문서에 없습니다. 수정 요청 예시에도 templateCode가 없습니다.
   */
  templateCode?: string;
  /**
   * 템플릿 본문입니다.
   */
  text?: string;
  /**
   * 캐러셀 정보입니다(FC, FA).
   */
  carousel?: BrandMessageCarousel;
  /**
   * 첨부 정보입니다. 버튼은 최대 5개, FT/FI에 쿠폰을 함께 쓰면 최대 4개입니다.
   */
  attachment?: BrandMessageAttachment;
  /**
   * 헤더 정보입니다. 최대 20자입니다. `FG`에서는 헤더 타이틀로 씁니다.
   *
   * 제약: maxLength=20
   */
  header?: string;
  /**
   * 헤더 디스크립션입니다. `msgType`이 `FG`일 때만 사용합니다.
   */
  headerDescription?: string;
  /**
   * 부가 정보입니다. `msgType`이 `FM`일 때 사용합니다.
   */
  additionalContent?: string;
  /**
   * 메시지 푸시 알림 발송 여부입니다. 기본값은 `Y`입니다.
   * @defaultValue "Y" (서버 기본값. 지정하지 않으면 SDK는 보내지 않습니다)
   */
  pushAlarm?: 'Y' | 'N';
  /**
   * 메시지 영역 변수입니다.
   */
  messageVariable?: Record<string, unknown>;
  /**
   * 버튼 영역 변수입니다.
   */
  buttonVariable?: Record<string, unknown>;
  /**
   * 쿠폰 영역 변수입니다.
   */
  couponVariable?: Record<string, unknown>;
  /**
   * 이미지 영역 변수입니다.
   */
  imageVariable?: Record<string, unknown>;
  /**
   * 비디오 영역 변수입니다.
   */
  videoVariable?: Record<string, unknown>;
  /**
   * 커머스 영역 변수입니다.
   */
  commerceVariable?: Record<string, unknown>;
  /**
   * 캐러셀 영역 변수입니다.
   */
  carouselVariable?: BrandMessageCarouselVariable[];
  /**
   * FG(카탈로그) 전용 아이템 단위 변수입니다.
   */
  catalogVariable?: BrandMessageCatalogVariable[];
  /**
   * 등록일입니다.
   */
  createAt?: string;
  /**
   * 수정일입니다.
   */
  modifiedAt?: string;
  /**
   * 템플릿 상태입니다. 알려진 값: `A`(등록), `S`(차단).
   */
  status?: 'A' | 'S' | (string & {});
}

/**
 * 브랜드메시지 템플릿 등록·수정 요청입니다.
 */
export interface BrandMessageTemplateRequest {
  /**
   * 브랜드메시지 템플릿 정보입니다.
   */
  brandmessage: BrandMessageTemplateInput;
}

/**
 * 템플릿 목록의 항목 1개입니다.
 */
export interface BrandMessageTemplateSummary {
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 발신키 유형입니다. 문서 예시 값은 `S`(발신프로필)입니다. 기본값은 `S`입니다.
   */
  senderKeyType?: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode?: string;
  /**
   * 템플릿 상태입니다. 알려진 값: `A`(등록), `S`(차단). 최근 변경 템플릿 조회 응답에는 없습니다.
   */
  status?: 'A' | 'S' | (string & {});
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 목록 응답 데이터입니다.
 */
export interface BrandMessageTemplateListResult {
  /**
   * 브랜드메시지 템플릿 결과 영역입니다.
   */
  brandmessage?: {
    /**
     * 조회한 템플릿 목록입니다.
     */
    templates?: BrandMessageTemplateSummary[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageTemplateListServiceResult = ServiceResult & {
  data?: BrandMessageTemplateListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 브랜드메시지 템플릿 목록·최근 변경 템플릿 조회 응답입니다.
 */
export interface BrandMessageTemplateListResponse {
  common: CommonResult;
  data?: BrandMessageTemplateListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드메시지 그룹태그입니다.
 */
export interface BrandMessageGroupTag {
  /**
   * 그룹태그 키입니다.
   */
  groupTagKey?: string;
  /**
   * 그룹태그 이름입니다.
   */
  groupTagName?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 그룹태그 응답 데이터입니다.
 */
export interface BrandMessageGroupTagListResult {
  /**
   * 그룹태그 목록입니다.
   */
  groupTags?: BrandMessageGroupTag[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageGroupTagListServiceResult = ServiceResult & {
  data?: BrandMessageGroupTagListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 그룹태그 조회·등록·수정 응답입니다. 단건 조회도 `groupTags` 배열로 돌려줍니다.
 */
export interface BrandMessageGroupTagListResponse {
  common: CommonResult;
  data?: BrandMessageGroupTagListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 그룹태그 등록·수정 요청입니다.
 *
 * 확인 필요: 등록·수정 요청 본문에 `senderKey`가 없습니다(Part A·B 동일). 어떤 발신프로필에 등록되는지, 키·이름 길이 제한이 문서에 없습니다.
 */
export interface BrandMessageGroupTagRequest {
  /**
   * 브랜드메시지 그룹태그 정보입니다.
   */
  groupTag: {
    /**
     * 그룹태그 키입니다.
     */
    groupTagKey: string;
    /**
     * 그룹태그 이름입니다.
     */
    groupTagName: string;
  };
}

export interface BrandMessageFriendGroupFileUploadRequest {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 업로드할 전화번호 목록 파일입니다. 줄바꿈으로 구분한 전화번호 파일이며 txt, csv만 허용됩니다.
   */
  file: UploadFile;
}

/**
 * 친구 그룹 파일 업로드 결과입니다.
 */
export interface BrandMessageFriendGroupFileUploadResult {
  /**
   * 임시 업로드 파일 정보입니다.
   */
  friendGroup?: {
    /**
     * 친구 그룹 등록·전화번호 추가·삭제에 쓸 임시 파일 키입니다.
     */
    fileKey?: string;
    /**
     * 파일 키 만료 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
     *
     * 제약: 형식 yyyy-MM-dd HH:mm:ss
     */
    expiredAt?: string;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupFileUploadServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupFileUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 파일 업로드 응답입니다.
 */
export interface BrandMessageFriendGroupFileUploadResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupFileUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 상세 정보입니다. 동보 발송에 쓰려면 상태가 완료이고 `userCount`가 10 이상이어야 합니다.
 */
export interface BrandMessageFriendGroup {
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey?: string;
  /**
   * 등록 유저 수입니다.
   */
  userCount?: number;
  /**
   * 친구 수입니다. `status`가 `IN_PROGRESS`이면 없을 수 있습니다.
   */
  friendCount?: number;
  /**
   * 친구 그룹 처리 상태입니다. 알려진 값: `IN_PROGRESS`, `COMPLETED`.
   *
   * 확인 필요: 동보 발송 안내는 그룹 상태를 `C`(Completed)로 표기하지만 응답 값은 `COMPLETED`입니다. 같은 값인지 확인이 필요합니다.
   */
  status?: 'IN_PROGRESS' | 'COMPLETED' | (string & {});
  /**
   * 생성 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 수정 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  modifiedAt?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 상세 응답 데이터입니다.
 */
export interface BrandMessageFriendGroupResult {
  /**
   * 친구 그룹 상세 정보입니다.
   */
  friendGroup?: BrandMessageFriendGroup;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 조회 응답입니다.
 */
export interface BrandMessageFriendGroupResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 등록, 전화번호 추가·삭제 요청입니다. 전화번호는 `fileKey` 또는 `phoneNumbers`로 전달합니다.
 */
export interface BrandMessageFriendGroupRequest {
  /**
   * 친구 그룹 정보입니다.
   *
   * 확인 필요: `fileKey`와 `phoneNumbers`를 둘 다 보내거나 둘 다 생략할 때의 동작이 문서에 없습니다. 친구 그룹 등록 시 `friendGroupKey`를 고객이 정하는지(요청 필수)만 명시되어 있습니다.
   */
  friendGroup: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 친구 그룹 키입니다. 1~50자이며 한글·영문·숫자와 일부 특수문자를 쓸 수 있습니다.
     *
     * 제약: minLength=1, maxLength=50
     */
    friendGroupKey: string;
    /**
     * 친구 그룹 파일 업로드로 발급받은 임시 파일 키입니다.
     */
    fileKey?: string;
    /**
     * 전화번호 목록입니다. 1~10,000건입니다.
     *
     * 제약: minItems=1, maxItems=10000
     */
    phoneNumbers?: string[];
  };
}

/**
 * 친구 그룹 등록·전화번호 추가·삭제 요청의 처리 정보입니다. 처리는 비동기이며 진행 상황은 전화번호 요청 조회 API로 확인합니다.
 */
export interface BrandMessageFriendGroupProcessing {
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey?: string;
  /**
   * 요청 아이디입니다.
   *
   * 확인 필요: Part A는 String, Part B는 Integer로 표기합니다. 예시 값이 int64 범위의 큰 수이므로 정밀도 손실을 피하려 Part A(String)를 따릅니다.
   */
  requestId?: string;
  /**
   * 친구 그룹 처리 상태입니다. 알려진 값: `IN_PROGRESS`, `COMPLETED`.
   */
  status?: 'IN_PROGRESS' | 'COMPLETED' | (string & {});
  /**
   * 생성 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 수정 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  modifiedAt?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 응답 데이터입니다.
 */
export interface BrandMessageFriendGroupProcessingResult {
  /**
   * 친구 그룹 정보입니다.
   */
  friendGroup?: BrandMessageFriendGroupProcessing;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupProcessingServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupProcessingResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 등록·전화번호 추가·삭제 응답입니다.
 */
export interface BrandMessageFriendGroupProcessingResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupProcessingServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 목록 응답 데이터입니다.
 */
export interface BrandMessageFriendGroupListResult {
  /**
   * 친구 그룹 목록입니다.
   */
  friendGroups?: BrandMessageFriendGroup[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupListServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 목록 조회 응답입니다.
 */
export interface BrandMessageFriendGroupListResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 친구 그룹 전화번호 추가·삭제 요청 1건의 처리 상태입니다.
 */
export interface BrandMessageFriendGroupPhoneNumberRequest {
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey?: string;
  /**
   * 요청 아이디입니다.
   */
  requestId?: string;
  /**
   * 요청 유형입니다. 문서 예시 값은 `ADD`입니다.
   *
   * 확인 필요: 요청 유형 값 목록이 문서에 없습니다(예시는 `ADD`만 있음. 삭제 요청의 값은 미확인).
   */
  type?: 'ADD' | (string & {});
  /**
   * 요청 처리 상태입니다. 문서 예시 값은 `COMPLETED`입니다.
   */
  status?: 'IN_PROGRESS' | 'COMPLETED' | (string & {});
  /**
   * 처리된 전화번호 건수입니다.
   */
  processedCount?: number;
  /**
   * 요청 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 상태 변경 일시(`yyyy-MM-dd HH:mm:ss`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  modifiedAt?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 전화번호 요청 목록 응답 데이터입니다.
 */
export interface BrandMessageFriendGroupPhoneNumberRequestListResult {
  /**
   * 전화번호 추가·삭제 요청 목록입니다.
   */
  friendGroups?: BrandMessageFriendGroupPhoneNumberRequest[];
  /**
   * 다음 페이지 존재 여부입니다.
   */
  hasNext?: boolean;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupPhoneNumberRequestListServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupPhoneNumberRequestListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 전화번호 요청 목록 조회 응답입니다.
 */
export interface BrandMessageFriendGroupPhoneNumberRequestListResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupPhoneNumberRequestListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 전화번호 요청 응답 데이터입니다.
 */
export interface BrandMessageFriendGroupPhoneNumberRequestResult {
  /**
   * 전화번호 추가·삭제 요청 정보입니다.
   */
  friendGroup?: BrandMessageFriendGroupPhoneNumberRequest;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageFriendGroupPhoneNumberRequestServiceResult = ServiceResult & {
  data?: BrandMessageFriendGroupPhoneNumberRequestResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 친구 그룹 전화번호 요청 단건 조회 응답입니다.
 */
export interface BrandMessageFriendGroupPhoneNumberRequestResponse {
  common: CommonResult;
  data?: BrandMessageFriendGroupPhoneNumberRequestServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface BrandMessageMarketingAgreeUploadRequest {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   *
   * 제약: maxLength=40
   */
  senderKey: string;
  /**
   * 업로드할 광고성 정보 수신동의 증적자료 파일입니다.
   *
   * 확인 필요: 허용 파일 형식·용량이 문서에 없습니다(예시는 pdf).
   */
  file: UploadFile;
}

/**
 * 업로드 결과 데이터입니다.
 */
export interface BrandMessageMarketingAgreeResult {
  /**
   * 업로드된 증적자료 정보입니다.
   */
  marketingAgree?: {
    /**
     * 업로드된 파일의 식별 키입니다.
     */
    fileKey?: string;
    /**
     * 업로드된 파일의 URL입니다.
     */
    fileUrl?: string;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type BrandMessageMarketingAgreeServiceResult = ServiceResult & {
  data?: BrandMessageMarketingAgreeResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 증적자료 파일 업로드 응답입니다.
 */
export interface BrandMessageMarketingAgreeResponse {
  common: CommonResult;
  data?: BrandMessageMarketingAgreeServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 발신프로필 무료수신거부 정보 입력 요청입니다.
 */
export interface BrandMessageUnsubscribeContentRequest {
  /**
   * 무료수신거부 정보입니다.
   */
  brandmessage: {
    /**
     * 발신프로필 키입니다.
     */
    senderKey: string;
    /**
     * 무료수신거부 전화번호입니다.
     *
     * 확인 필요: 하이픈 포함 여부·길이 제한이 문서에 없습니다(예시는 하이픈 포함). 발송 규격의 같은 필드는 최대 13자입니다.
     */
    unsubscribePhoneNumber: string;
    /**
     * 무료수신거부 인증번호입니다.
     */
    unsubscribeAuthNumber?: string;
  };
}

/**
 * 브랜드 이미지의 파일 ID, URL, 사용 유형 정보입니다.
 */
export interface RcsBrandMediaUrl {
  /**
   * 파일 ID입니다.
   */
  fileId?: string;
  /**
   * 파일 URL입니다.
   */
  url?: string;
  /**
   * 이미지의 사용 유형입니다. 알려진 값(영문 문서 기준): `icon`(템플릿 양식 아이콘 이미지),
   * `profile`(브랜드 프로필 이미지), `background`(브랜드 배경 이미지).
   */
  typeName?: 'icon' | 'profile' | 'background' | (string & {});
  /**
   * 등록한 파일의 이름입니다.
   */
  fileName?: string;
}

/**
 * 브랜드 홈 메뉴입니다.
 *
 * 확인 필요: buttonType에 들어갈 수 있는 값과 applink·weblink 사용 조건이 문서화되어 있지 않습니다.
 */
export interface RcsBrandMenu {
  /**
   * 버튼 타입입니다.
   */
  buttonType?: string;
  /**
   * 앱 링크입니다.
   */
  applink?: string;
  /**
   * 웹 링크입니다.
   */
  weblink?: string;
}

/**
 * RCS 브랜드 정보입니다.
 *
 * 확인 필요: 일시 필드(registerDate, approvalDate, updateDate, chatbotDate, logoDate, messagebaseDate)의 형식이 문서화되어 있지 않습니다.
 */
export interface RcsBrand {
  /**
   * 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 브랜드 이름입니다.
   */
  name?: string;
  /**
   * 브랜드 키입니다(최대 200자).
   *
   * 제약: maxLength=200
   */
  brandKey?: string;
  /**
   * 등록일시입니다(최대 30자).
   *
   * 제약: maxLength=30
   */
  registerDate?: string;
  /**
   * 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 수정일시입니다.
   */
  updateDate?: string;
  /**
   * 브랜드의 상태입니다(최대 1300자). 문서 예시 값은 `ready`입니다.
   *
   * 제약: maxLength=1300
   *
   * 확인 필요: 상태 값 목록이 문서화되어 있지 않고, 길이 제한 1300자는 상태 코드로 보기에 이례적입니다.
   */
  status?: string;
  /**
   * 이미지 파일 ID와 URL 및 사용 유형 정보입니다.
   */
  mediaUrl?: RcsBrandMediaUrl[];
  /**
   * 브랜드 내 등록된 대화방 중 가장 최근에 변경된 대화방의 일시입니다.
   */
  chatbotDate?: string;
  /**
   * 로고 이미지 중 가장 최근에 변경된 일시입니다.
   */
  logoDate?: string;
  /**
   * 브랜드 내 등록된 템플릿 중 가장 최근에 변경된 템플릿의 일시입니다.
   */
  messagebaseDate?: string;
  /**
   * 브랜드 설명에 등록된 내용입니다.
   */
  description?: string;
  /**
   * 브랜드 홈에 노출될 전화번호입니다.
   */
  tel?: string;
  /**
   * 메뉴입니다.
   */
  menus?: RcsBrandMenu[];
  /**
   * 브랜드 카테고리 ID입니다.
   *
   * 확인 필요: 문서 타입은 Object이지만 하위 필드가 없고, ID 값이므로 문자열일 가능성이 있습니다.
   */
  categoryId?: Record<string, unknown>;
  /**
   * 브랜드 카테고리명입니다.
   *
   * 확인 필요: 문서 타입은 Object Array이지만 하위 필드가 없고, 이름 값이므로 문자열일 가능성이 있습니다.
   */
  categoryName?: Array<Record<string, unknown>>;
  /**
   * 브랜드 하위 카테고리 ID입니다.
   *
   * 확인 필요: 문서 타입은 Object이지만 하위 필드가 없고, ID 값이므로 문자열일 가능성이 있습니다.
   */
  subCategoryId?: Record<string, unknown>;
  /**
   * 브랜드 하위 카테고리명입니다.
   *
   * 확인 필요: 문서 타입은 Object이지만 하위 필드가 없고, 이름 값이므로 문자열일 가능성이 있습니다.
   */
  subCategoryName?: Record<string, unknown>;
  /**
   * 검색용 키워드입니다.
   *
   * 확인 필요: 문서 타입은 Object이지만 하위 필드가 없습니다.
   */
  categoryOpt?: Record<string, unknown>;
  /**
   * 브랜드 홈에 표시될 우편번호입니다.
   *
   * 확인 필요: 문서 타입은 Object Array이지만 하위 필드가 없고, 우편번호는 문자열일 가능성이 있습니다.
   */
  zipCode?: Array<Record<string, unknown>>;
  /**
   * 브랜드 홈에 표시되는 도로명주소입니다.
   */
  roadAddress?: string;
  /**
   * 브랜드 홈에 표시되는 상세주소입니다.
   */
  detailAddress?: string;
  /**
   * 브랜드 홈에 표시되는 이메일 주소입니다.
   */
  email?: string;
  /**
   * 브랜드 홈에 표시되는 홈페이지 주소입니다.
   */
  webSiteUrl?: string;
  /**
   * 검수 시 반려 사유입니다.
   */
  approvalReason?: string;
  /**
   * 브랜드 소식 URL입니다.
   */
  brandFeedUrl?: string;
  /**
   * 단말에 표시되는 브랜드 홈의 기본 탭입니다. 알려진 값은 `FEED`입니다.
   *
   * 확인 필요: FEED 외의 탭 값이 문서화되어 있지 않습니다.
   */
  initTab?: 'FEED' | (string & {});
  /**
   * `initTab`이 `FEED`인 경우 소식 탭에 표시할 메뉴입니다.
   */
  initFeedItems?: string;
  /**
   * 브랜드 내 등록되는 템플릿의 버튼 컬러 값입니다.
   */
  templateColor?: string;
  /**
   * 브랜드 소식 탭에 운영정보를 사용할지 여부입니다(`Y`/`N`).
   *
   * 확인 필요: Y 외의 값(N 등)이 문서에 명시되어 있지 않습니다.
   */
  bizInfoYn?: string;
  /**
   * `bizInfoYn`이 `Y`인 경우 운영정보 제목입니다.
   */
  bizInfoTitle?: string;
  /**
   * `bizInfoYn`이 `Y`인 경우 운영정보 내용입니다.
   */
  bizInfoContent?: string;
  /**
   * 안심마크 지정 기업 여부입니다. 필드명은 문서 표기(`safty`)를 따릅니다.
   */
  saftyStatusYn?: string;
}

/**
 * 브랜드 조회·수정 결과 데이터입니다.
 */
export interface RcsBrandResult {
  rcs?: RcsBrand;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsBrandServiceResult = ServiceResult & {
  data?: RcsBrandResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsBrandResponse {
  common: CommonResult;
  data?: RcsBrandServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 브랜드 수정 요청(multipart/form-data)입니다. `regBrand`는 JSON 문자열 파트로 보냅니다.
 */
export interface RcsBrandUpdateRequest {
  /**
   * 수정할 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 브랜드 수정 정보입니다. JSON으로 직렬화해 한 파트로 보냅니다.
   *
   * 확인 필요: regBrand.brandId·name이 필수로 표시되어 있으나 문서 요청 예시에는 brandId가 없습니다. 또 registerDate·approvalDate·status·approvalReason처럼 서버가 정하는 값도 요청 필드로 나열되어 있어 실제로 반영되는지 불명확합니다.
   */
  regBrand: RcsBrand & Record<string, unknown>;
  /**
   * 브랜드 프로필 이미지 파일입니다.
   *
   * 확인 필요: 허용 형식·용량·크기가 문서화되어 있지 않습니다.
   */
  brandProfile?: UploadFile;
  /**
   * 브랜드 배경 이미지 파일입니다.
   *
   * 확인 필요: 허용 형식·용량·크기가 문서화되어 있지 않습니다.
   */
  brandBackground?: UploadFile;
  /**
   * 시즌성 증빙 파일입니다.
   */
  seasonDocFile?: UploadFile;
}

/**
 * RCS 대화방(챗봇) 정보입니다.
 *
 * 확인 필요: 일시 필드(approvalDate, registerDate, updateDate)의 형식이 문서화되어 있지 않습니다(예시는 `yyyy-MM-dd HH:mm:ss`). service·display·inputField·rcsReply·searchWeight·status·approvalResult 값 목록도 없습니다.
 */
export interface RcsChatbot {
  /**
   * 대화방 ID입니다.
   */
  chatbotId?: string;
  /**
   * 대화방이 속한 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 대화방이 속한 그룹 ID입니다.
   */
  groupId?: string;
  /**
   * 대화방에 연결된 발신번호입니다.
   */
  mdn?: string;
  /**
   * 대화방에 연결된 부가번호입니다.
   */
  subNum?: string;
  /**
   * 대표번호 여부입니다. `Y` 대표번호, `N` 부가번호입니다(영문 문서 기준).
   */
  isMainNum?: 'Y' | 'N';
  /**
   * 대화방 부제목입니다.
   */
  subTitle?: string;
  /**
   * 대화방 부가 설명입니다.
   */
  subDescr?: string;
  /**
   * 대화방의 서비스 구분 값입니다.
   */
  service?: string;
  /**
   * 대화방 노출 설정 값입니다.
   */
  display?: string;
  /**
   * 대화방 입력창 사용 설정 값입니다.
   */
  inputField?: number;
  /**
   * 대화방을 등록한 대행사 ID입니다.
   */
  botAgencyId?: string;
  /**
   * 안심마크 지정 기업 여부입니다. 필드명은 문서 표기(`safty`)를 따릅니다.
   */
  saftyStatusYn?: string;
  /**
   * 고정 메뉴 사용 여부입니다. `Y` 사용, `N` 미사용입니다(영문 문서 기준).
   */
  psMenuUse?: 'Y' | 'N';
  /**
   * 대화방 고정 메뉴 구성 정보입니다.
   *
   * 확인 필요: 하위 필드가 문서화되어 있지 않습니다.
   */
  persistentMenu?: Record<string, unknown>;
  /**
   * 대화방 응답 설정 값입니다.
   */
  rcsReply?: string;
  /**
   * 대화방 이벤트를 수신할 웹훅 URL입니다.
   */
  webhook?: string;
  /**
   * 대화방 검색 가중치입니다.
   */
  searchWeight?: string;
  /**
   * 대화방 이용약관 페이지 주소입니다.
   */
  botTcPage?: string;
  /**
   * 대화방 이미지 파일 ID와 URL 및 사용 유형 정보입니다.
   *
   * 확인 필요: 문서 타입은 Object이지만 하위 필드가 없습니다. 브랜드의 mediaUrl은 Object Array(fileId/url/typeName/fileName)라서 같은 구조의 배열일 가능성이 있습니다.
   */
  mediaUrl?: Record<string, unknown>;
  /**
   * 대화방의 상태입니다. 문서 예시 값은 `ready`입니다.
   */
  status?: string;
  /**
   * 대화방 승인 결과입니다. 문서 예시 값은 `approved`입니다.
   */
  approvalResult?: string;
  /**
   * 검수 시 반려 사유입니다.
   */
  approvalReason?: string;
  /**
   * 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 등록일시입니다.
   */
  registerDate?: string;
  /**
   * 등록자 ID입니다.
   */
  registerId?: string;
  /**
   * 수정일시입니다.
   */
  updateDate?: string;
  /**
   * 수정자 ID입니다.
   */
  updateId?: string;
}

/**
 * 대화방 조회·수정·승인 취소·삭제 결과 데이터입니다.
 */
export interface RcsChatbotResult {
  /**
   * RCS 응답 영역입니다.
   */
  rcs?: {
    /**
     * 대화방 정보 배열입니다. 상세 조회에서도 배열로 돌아옵니다.
     */
    chatbot?: RcsChatbot[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsChatbotServiceResult = ServiceResult & {
  data?: RcsChatbotResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsChatbotResponse {
  common: CommonResult;
  data?: RcsChatbotServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 대화방 수정 요청(multipart/form-data)입니다. `chatbot`은 JSON 문자열 파트로 보냅니다.
 */
export interface RcsChatbotUpdateRequest {
  /**
   * 수정할 대화방이 속한 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 수정할 대화방 정보입니다. 문서상 타입은 String(JSON 문자열)이며, JSON으로 직렬화해 한 파트로 보냅니다.
   *
   * 확인 필요: chatbot의 하위 필드가 모두 선택으로 표시되어 어떤 필드로 수정 대상을 식별하는지(chatbotId 필수 여부) 불명확합니다. status·approvalResult·registerDate처럼 서버가 정하는 값도 요청 필드로 나열되어 있습니다.
   */
  chatbot: RcsChatbot;
  /**
   * 부가번호 사용을 증명하는 서류 파일입니다.
   *
   * 확인 필요: 부가번호를 바꾸지 않는 수정에도 필수인지 불명확합니다. 허용 형식·용량도 문서화되어 있지 않습니다.
   */
  subNumCertificate: UploadFile;
}

/**
 * 전체 건수와 페이지 조건 정보입니다. 문서상 모든 값이 문자열입니다.
 *
 * 확인 필요: offset·limit·total이 문자열(String)로 표기되어 있으나 숫자일 가능성이 있습니다. 문서 응답 예시에는 pagination이 없습니다.
 */
export interface RcsMessagebasePagination {
  /**
   * 조회 기준 위치입니다.
   */
  offset?: string;
  /**
   * 페이지당 조회 건수입니다.
   */
  limit?: string;
  /**
   * 전체 건수입니다.
   */
  total?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 공통 포맷 목록 항목입니다.
 */
export interface RcsMessagebaseCommonSummary {
  /**
   * 템플릿의 원형인 템플릿 양식 ID입니다.
   */
  messagebaseformId?: string;
  /**
   * 포맷 이름입니다.
   */
  formName?: string;
  /**
   * 비즈 조건 목록입니다.
   */
  bizCondition?: string[];
  /**
   * 카드 유형입니다. 문서 예시 값은 `standalone media top`입니다.
   */
  cardType?: string;
  /**
   * 템플릿 포맷 ID입니다.
   */
  formatId?: string;
  /**
   * 템플릿 등록 시 입력된 템플릿 명칭입니다.
   */
  templateName?: string;
  /**
   * 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 템플릿의 상태입니다.
   */
  status?: string;
  /**
   * 템플릿의 승인 상태입니다.
   */
  approvalResult?: string;
  /**
   * 템플릿 수정 계정 ID입니다.
   */
  updateId?: string;
  /**
   * 템플릿 등록일시입니다. 문서 예시는 `yyyy-MM-dd'T'HH:mm:ss` 형식입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  registerDate?: string;
  /**
   * 템플릿 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 템플릿 수정일시입니다. 문서 예시는 `yyyy-MM-dd'T'HH:mm:ss` 형식입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  updateDate?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 공통 포맷 목록 조회 결과 데이터입니다.
 */
export interface RcsMessagebaseCommonListResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    pagination?: RcsMessagebasePagination;
    /**
     * 공통 포맷 목록입니다.
     */
    messageForms?: RcsMessagebaseCommonSummary[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsMessagebaseCommonListServiceResult = ServiceResult & {
  data?: RcsMessagebaseCommonListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsMessagebaseCommonListResponse {
  common: CommonResult;
  data?: RcsMessagebaseCommonListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 본문 영역의 검증 파라미터 정의입니다.
 */
export interface RcsTemplateBodyParam {
  /**
   * 검증 파라미터명입니다. 영문, 숫자, `_`만 쓸 수 있습니다(영문 문서 기준).
   *
   * 제약: pattern=^[A-Za-z0-9_]+$
   */
  param: string;
  /**
   * 필수 여부입니다.
   *
   * 확인 필요: 값 형식(Y/N, true/false 등)이 문서화되어 있지 않습니다.
   */
  isMandatory: string;
  /**
   * 기술 검증 타입입니다.
   *
   * 확인 필요: 타입 값 목록이 문서화되어 있지 않습니다.
   */
  type?: string;
  /**
   * 문자열 최대 크기입니다. 문서상 문자열입니다.
   */
  strSize?: string;
  /**
   * 이미지 최소 가로 크기입니다. 문서상 문자열입니다.
   */
  imageWidth?: string;
  /**
   * 이미지 최소 세로 크기입니다. 문서상 문자열입니다.
   */
  imageHeight?: string;
}

/**
 * 클립보드 복사 액션입니다.
 */
export interface RcsTemplateClipboardAction {
  /**
   * 클립보드 복사 객체입니다.
   */
  copyToClipboard: {
    /**
     * 클립보드에 복사할 텍스트입니다.
     */
    text: string;
  };
}

/**
 * 템플릿 버튼의 지도 액션입니다. 발송용 `RcsMapAction`과 달리 `showLocation`이 선택이고
 * `fallbackUrl`이 `mapAction` 바로 아래에 있으며, 위치 `label`이 문자열입니다.
 *
 * 확인 필요: 발송 API의 mapAction(showLocation 필수, fallbackUrl이 showLocation 아래)과 구조가 다릅니다. 어느 쪽이 맞는지, requestLocationPush의 하위 필드는 무엇인지 문서화되어 있지 않습니다.
 */
export interface RcsTemplateMapAction {
  /**
   * 지도 위치 표시 객체입니다.
   */
  showLocation?: {
    /**
     * 지도 위치 정보입니다.
     */
    location: {
      /**
       * 위도입니다.
       */
      latitude: number;
      /**
       * 경도입니다.
       */
      longitude: number;
      /**
       * 라벨입니다.
       */
      label?: string;
      /**
       * 검색 내용입니다.
       */
      query: string;
    };
  };
  /**
   * 위치 조회 실패 시 이동할 fallback URL입니다.
   */
  fallbackUrl?: string;
  /**
   * 위치 전송 요청 객체입니다.
   */
  requestLocationPush?: Record<string, unknown>;
}

/**
 * 템플릿 버튼의 문자/음성/영상 보내기 액션입니다. 발송용 `RcsComposeAction`과 달리 `composeTextMessage`가 선택입니다.
 */
export interface RcsTemplateComposeAction {
  /**
   * 문자 보내기 객체입니다.
   */
  composeTextMessage?: {
    /**
     * 전화번호입니다.
     */
    phoneNumber: string;
    /**
     * 문자(SMS/LMS/MMS) 내용입니다.
     */
    text?: string;
  };
  /**
   * 음성/영상 보내기 객체입니다.
   */
  composeRecordingMessage?: {
    /**
     * 전화번호입니다.
     */
    phoneNumber: string;
    /**
     * 영상(`VIDEO`) 또는 음성(`AUDIO`)입니다.
     */
    type: 'VIDEO' | 'AUDIO';
  };
}

/**
 * 템플릿 버튼 액션 객체입니다. 발송용 `RcsSuggestion`과 달리 `displayText`가 `action` 안에 있고,
 * 클립보드 복사 액션(`clipboardAction`)을 쓸 수 있습니다.
 *
 * 확인 필요: 한 action에 액션 유형을 하나만 넣어야 하는지 문서에 명시되어 있지 않습니다.
 */
export interface RcsTemplateAction {
  /**
   * 버튼 표시 텍스트입니다.
   */
  displayText: string;
  clipboardAction?: RcsTemplateClipboardAction;
  urlAction?: RcsUrlAction;
  dialerAction?: RcsDialerAction;
  mapAction?: RcsTemplateMapAction;
  calendarAction?: RcsCalendarAction;
  composeAction?: RcsTemplateComposeAction;
}

/**
 * 템플릿 버튼 액션 정의(버튼 1개)입니다.
 */
export interface RcsTemplateSuggestion {
  action?: RcsTemplateAction;
}

/**
 * 템플릿 버튼 정의입니다.
 *
 * 확인 필요: buttons·suggestions 개수 제한이 문서화되어 있지 않습니다(양식별 policyInfo.maxButtonCount 참고).
 */
export interface RcsTemplateButton {
  /**
   * 버튼 액션 목록입니다.
   */
  suggestions?: RcsTemplateSuggestion[];
}

/**
 * 리치카드, 오픈리치카드에 포함된 content에 대한 검증 정책입니다.
 */
export interface RcsMessagebasePolicyInfo {
  /**
   * 버튼 사용 가능 여부입니다.
   */
  buttonsAllowed?: boolean;
  /**
   * 헤더 광고 문구 사용 여부입니다.
   */
  adHeaderAllowed?: boolean;
  /**
   * 본문 광고 문구 사용 여부입니다.
   */
  adBodyAllowed?: boolean;
  /**
   * 카드 개수입니다.
   */
  cardCount?: number;
  /**
   * 최대 버튼 개수입니다.
   */
  maxButtonCount?: number;
  /**
   * description 영역 최대 글자 수입니다.
   */
  maxDescriptionSize?: number;
  /**
   * 미디어 최대 크기입니다.
   *
   * 확인 필요: 단위(byte 등)가 문서화되어 있지 않습니다.
   */
  maxMediaSize?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 공통 포맷 또는 템플릿 양식의 상세 정보입니다. 공통 포맷 상세 조회는 모든 필드를,
 * 템플릿 양식 상세 조회는 그중 일부(formatId, templateName, body, buttons, agencyId, brandId,
 * messagebaseformId, policyInfo.maxButtonCount/maxMediaSize, registerDate, updateDate, productCode, spec, cardType)를 문서화합니다.
 */
export interface RcsMessagebaseFormDetail {
  /**
   * 템플릿 포맷 ID입니다.
   */
  formatId?: string;
  /**
   * 템플릿 등록 시 입력된 템플릿 명칭입니다.
   */
  templateName?: string;
  /**
   * body 정의입니다.
   *
   * 확인 필요: 템플릿 양식 상세 조회 문서에는 body 항목의 하위 필드가 없습니다(공통 포맷 상세와 같은 구조로 가정).
   */
  body?: RcsTemplateBodyParam[];
  /**
   *
   * 확인 필요: 표에는 Object(suggestions 배열 포함)로 표기되어 있으나 템플릿 양식 상세 응답 예시는 배열(`[]`)이고, 템플릿 등록 요청의 buttons는 Object Array입니다. suggestions 항목의 하위 필드도 조회 응답에는 문서화되어 있지 않습니다.
   */
  buttons?: RcsTemplateButton;
  /**
   * 대행사 ID입니다.
   */
  agencyId?: string;
  /**
   * 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 템플릿의 원형인 템플릿 양식 ID입니다.
   */
  messagebaseformId?: string;
  policyInfo?: RcsMessagebasePolicyInfo;
  /**
   * 템플릿의 상태입니다.
   */
  status?: string;
  /**
   * 템플릿의 승인 상태입니다.
   */
  approvalResult?: string;
  /**
   * 템플릿 등록일시입니다.
   */
  registerDate?: string;
  /**
   * 템플릿 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 템플릿 수정일시입니다.
   */
  updateDate?: string;
  /**
   * 템플릿 수정 계정 ID입니다.
   */
  updateId?: string;
  /**
   * 메시지 상품 종류입니다.
   */
  productCode?: string;
  /**
   * 레이아웃 구조입니다.
   */
  spec?: string;
  /**
   * 카드 종류입니다.
   */
  cardType?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 공통 포맷·템플릿 양식 상세 조회 결과 데이터입니다.
 */
export interface RcsMessagebaseFormDetailResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    messageForm?: RcsMessagebaseFormDetail;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsMessagebaseFormDetailServiceResult = ServiceResult & {
  data?: RcsMessagebaseFormDetailResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsMessagebaseFormDetailResponse {
  common: CommonResult;
  data?: RcsMessagebaseFormDetailServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 양식 목록 항목입니다.
 */
export interface RcsMessagebaseFormSummary {
  /**
   * 템플릿 양식 ID입니다.
   */
  messagebaseformId?: string;
  /**
   * 템플릿 양식명입니다.
   */
  formName?: string;
  /**
   * 양식을 사용할 수 있는 대상 업태의 목록입니다.
   *
   * 확인 필요: 표에는 String으로 표기되어 있으나 응답 예시는 배열(`[]`)이고, 공통 포맷 목록의 같은 필드는 String Array입니다.
   */
  bizCondition?: string;
  /**
   * 카드 종류입니다.
   */
  cardType?: string;
  /**
   * Description, Cell의 유형 그룹입니다.
   */
  bizCategory?: string;
  /**
   * Description, Cell의 세부 유형입니다.
   */
  bizService?: string;
  /**
   * 등록일시입니다.
   */
  registerDate?: string;
  /**
   * 수정일시입니다.
   */
  updateDate?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 양식 목록 조회 결과 데이터입니다.
 */
export interface RcsMessagebaseFormListResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    pagination?: RcsMessagebasePagination;
    /**
     * 템플릿 양식 목록입니다.
     */
    messageForms?: RcsMessagebaseFormSummary[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsMessagebaseFormListServiceResult = ServiceResult & {
  data?: RcsMessagebaseFormListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsMessagebaseFormListResponse {
  common: CommonResult;
  data?: RcsMessagebaseFormListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 템플릿 목록 항목입니다.
 */
export interface RcsTemplateSummary {
  /**
   * 메시지베이스 ID입니다. 발송 시에는 이 값을 `formatId` 필드에 넣습니다(영문 문서 기준).
   */
  messagebaseId?: string;
  /**
   * 템플릿 양식 ID입니다.
   */
  formatId?: string;
  /**
   * 템플릿 이름입니다.
   */
  templateName?: string;
  /**
   * 브랜드 ID입니다.
   */
  brandId?: string;
  /**
   * 템플릿의 상태입니다. 알려진 값(영문 문서 기준)은 `ready`(사용 중), `pause`(중지)입니다.
   */
  status?: 'ready' | 'pause' | (string & {});
  /**
   * 템플릿의 승인 상태입니다. 문서 예시 값은 `approved`입니다.
   */
  approvalResult?: string;
  /**
   * 승인 사유입니다.
   */
  approvalReason?: string;
  /**
   * 템플릿 등록일시입니다.
   */
  registerDate?: string;
  /**
   * 템플릿 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 템플릿 수정일시입니다.
   */
  updateDate?: string;
  /**
   * 템플릿 등록 계정 ID입니다.
   */
  registerId?: string;
  /**
   * 템플릿 수정 계정 ID입니다.
   */
  updateId?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 템플릿 목록 조회 결과 데이터입니다.
 */
export interface RcsTemplateListResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    pagination?: RcsMessagebasePagination;
    /**
     * 템플릿 목록입니다.
     */
    templates?: RcsTemplateSummary[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsTemplateListServiceResult = ServiceResult & {
  data?: RcsTemplateListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsTemplateListResponse {
  common: CommonResult;
  data?: RcsTemplateListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 상세 조회의 본문 영역입니다.
 *
 * 확인 필요: 등록 요청의 body는 검증 파라미터 배열인데 상세 조회의 body는 description·mTitle·title 객체라서 구조가 다릅니다.
 */
export interface RcsTemplateDetailBody {
  /**
   * 본문 내용입니다. `#{변수}` 형태의 치환 변수를 포함할 수 있습니다.
   */
  description?: string;
  /**
   * 메인 타이틀입니다.
   */
  mTitle?: string;
  /**
   * 타이틀입니다.
   */
  title?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 템플릿 상세 정보입니다.
 *
 * 확인 필요: approvalResult 예시가 목록 조회(approved)와 상세 조회(승인)에서 다릅니다. 일시 형식이 문서화되어 있지 않습니다. 응답에 messagebaseId·templateName·brandId·buttons가 없습니다.
 */
export interface RcsTemplate {
  /**
   * 템플릿 상태입니다.
   */
  status?: string;
  /**
   * 승인 결과입니다.
   */
  approvalResult?: string;
  /**
   * 승인 사유입니다.
   */
  approvalReason?: string;
  /**
   * 등록일시입니다.
   */
  registerDate?: string;
  /**
   * 승인일시입니다.
   */
  approvalDate?: string;
  /**
   * 수정일시입니다.
   */
  updateDate?: string;
  /**
   * 등록 계정 ID입니다.
   */
  registerId?: string;
  /**
   * 수정 계정 ID입니다.
   */
  updateId?: string;
  /**
   * 상품 코드입니다. 문서 예시 값은 `lms`입니다.
   */
  productCode?: string;
  /**
   * 템플릿 스펙입니다. 문서 예시 값은 `openrichcard`입니다.
   */
  spec?: string;
  /**
   * 카드 종류입니다. 문서 예시 값은 `descriptionNew`입니다.
   */
  cardType?: string;
  body?: RcsTemplateDetailBody;
  /**
   * 브랜드 키입니다.
   */
  brandKey?: string;
  /**
   * 템플릿 양식 ID입니다. 발송 시에는 이 값을 `formatId` 필드에 넣습니다(영문 문서 기준).
   *
   * 확인 필요: 영문 문서는 messagebaseId와 formatId 모두 발송 시 formatId 필드에 넣는다고 설명해 어느 값을 써야 하는지 불명확합니다.
   */
  formatId?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * RCS 템플릿 상세 조회 결과 데이터입니다.
 */
export interface RcsTemplateResult {
  rcs?: RcsTemplate;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsTemplateServiceResult = ServiceResult & {
  data?: RcsTemplateResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsTemplateResponse {
  common: CommonResult;
  data?: RcsTemplateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 등록·수정할 RCS 템플릿 정보입니다.
 *
 * 확인 필요: 템플릿 양식(messagebaseformId/formatId)을 지정하는 필드와, 수정 시 대상 템플릿(messagebaseId)을 지정하는 필드가 문서에 없습니다.
 */
export interface RcsTemplateDefinition {
  /**
   * 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 템플릿 이름입니다.
   */
  templateName: string;
  /**
   * 본문 영역 정의입니다.
   */
  body: RcsTemplateBodyParam[];
  /**
   * 버튼 정의입니다.
   */
  buttons: RcsTemplateButton[];
}

/**
 * RCS 템플릿 등록·수정 요청입니다.
 */
export interface RcsTemplateRequest {
  rcs: RcsTemplateDefinition;
}

/**
 * 템플릿 등록·수정·승인 취소·삭제 결과 데이터입니다.
 */
export interface RcsTemplateIdResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    /**
     * 처리된 메시지베이스 ID입니다. 발송 시에는 이 값을 `formatId` 필드에 넣습니다(영문 문서 기준).
     */
    messagebaseId?: string;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsTemplateIdServiceResult = ServiceResult & {
  data?: RcsTemplateIdResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsTemplateIdResponse {
  common: CommonResult;
  data?: RcsTemplateIdServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 이미지 정보입니다.
 */
export interface RcsTemplateImage {
  /**
   * 템플릿 파일 ID입니다.
   */
  fileId?: string;
  /**
   * 파일 이름입니다.
   */
  fileName?: string;
  /**
   * 이미지 가로 크기입니다.
   */
  imageWidth?: number;
  /**
   * 이미지 세로 크기입니다.
   */
  imageHeight?: number;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 이미지 등록·상세 조회 결과 데이터입니다.
 */
export interface RcsTemplateImageResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    image?: RcsTemplateImage;
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsTemplateImageServiceResult = ServiceResult & {
  data?: RcsTemplateImageResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsTemplateImageResponse {
  common: CommonResult;
  data?: RcsTemplateImageServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 이미지 등록 요청(multipart/form-data)입니다.
 */
export interface RcsTemplateImageUploadRequest {
  /**
   * 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 템플릿 등록에 사용할 이미지 파일입니다.
   *
   * 확인 필요: 허용 형식·용량·크기가 문서화되어 있지 않습니다.
   */
  file: UploadFile;
}

/**
 * 템플릿 양식 로고 이미지 정보입니다.
 *
 * 확인 필요: 표에는 fileId·fileUrl·fileName이 있으나 응답 예시에는 fileUrl 대신 imageWidth·imageHeight가 있습니다.
 */
export interface RcsTemplateFormLogo {
  /**
   * 로고 이미지 파일 ID입니다.
   */
  fileId?: string;
  /**
   * 로고 이미지 파일 URL입니다.
   */
  fileUrl?: string;
  /**
   * 로고 이미지 파일 이름입니다(최대 256자).
   *
   * 제약: maxLength=256
   */
  fileName?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 템플릿 양식 로고 이미지 조회 결과 데이터입니다.
 */
export interface RcsTemplateFormLogoListResult {
  /**
   * RCS 응답 정보입니다.
   */
  rcs?: {
    /**
     * 템플릿 양식 로고 이미지 목록입니다.
     */
    images?: RcsTemplateFormLogo[];
    /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
    [key: string]: unknown;
  };
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type RcsTemplateFormLogoListServiceResult = ServiceResult & {
  data?: RcsTemplateFormLogoListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface RcsTemplateFormLogoListResponse {
  common: CommonResult;
  data?: RcsTemplateFormLogoListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담톡 이미지 요소입니다.
 */
export interface CounselImage {
  /**
   * 상담톡 이미지 업로드 API(`/api/comm/v1/file/cstalk/image`)로 등록한 이미지 URL입니다.
   */
  imgUrl: string;
  /**
   * 이미지 클릭 시 이동할 URL입니다. 설정하지 않으면 카카오톡 내 이미지 뷰어를 사용합니다.
   */
  imgLink?: string;
}

/**
 * 상담톡 파일 첨부 정보입니다(VIDEO·AUDIO·FILE 타입).
 */
export interface CounselFile {
  /**
   * 상담톡 파일 업로드 API(`/api/comm/v1/file/cstalk`)로 등록한 파일 URL입니다.
   */
  fileUrl: string;
  /**
   * 파일명입니다. `msgType`이 `FILE`이면 필수입니다(`CounselPlainMessageRequest`의 `x-sdk-required-if`).
   */
  fileName?: string;
  /**
   * 파일 크기입니다. `msgType`이 `FILE`이면 필수입니다(`CounselPlainMessageRequest`의 `x-sdk-required-if`). 문서상 타입은 문자열입니다.
   */
  fileSize?: string;
}

/**
 * Plain 메시지 첨부 객체입니다. IMAGE는 `image`, VIDEO·AUDIO·FILE은 `file`을 사용합니다.
 */
export interface CounselPlainAttachment {
  image?: CounselImage;
  file?: CounselFile;
}

/**
 * 상담톡 Plain 메시지 발송 요청입니다. 상담 세션이 열려 있는 사용자에게만 보낼 수 있습니다.
 * 본문(`message`)과 첨부는 최종 사용자와의 상담 내용이므로 개인정보로 취급하고 로그에 남기지 않습니다.
 */
export interface CounselPlainMessageRequest {
  /**
   * 상담톡 사용자 키입니다. 카카오톡 채널별로 다르며 대소문자를 구분합니다. 1~20자이며 비어 있거나 20자를 넘으면 `A507`이 반환됩니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 메시지 타입입니다. IMAGE는 `attachment.image`, VIDEO·AUDIO·FILE은 `attachment.file`을 사용합니다.
   */
  msgType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
  /**
   * 사용자에게 전달할 메시지입니다. 최대 1,000자입니다.
   *
   * 제약: maxLength=1000
   */
  message: string;
  attachment?: CounselPlainAttachment;
  /**
   * 참조 필드입니다. 최대 200자이며 발송 결과 웹훅(`cstalk/result`)에서 함께 반환됩니다.
   *
   * 제약: maxLength=200
   */
  ref?: string;
}

export type CounselSendServiceResult = ServiceResult & {
  /**
   * 메시지 키입니다. 발송 결과 웹훅(`cstalk/result`)의 `msgKey`와 같은 값입니다.
   */
  msgKey?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselSendResponse {
  common: CommonResult;
  data?: CounselSendServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담톡 Rich 메시지·캐러셀 버튼입니다. 버튼 타입에 따라 필요한 필드가 다릅니다.
 */
export interface CounselButton {
  /**
   * 카카오 버튼 타입 코드입니다. 문서에 나온 값은 `WL`(웹 링크, 예시)과 `BF`(비즈폼)입니다.
   *
   * 확인 필요: 버튼 타입 코드 전체 목록과 타입별 필수 필드가 문서에 없습니다.
   */
  type: 'WL' | 'BF' | (string & {});
  /**
   * 버튼명입니다.
   */
  name: string;
  /**
   * 모바일 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlMobile?: string;
  /**
   * PC 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * iOS 환경에서 버튼 클릭 시 실행할 application custom scheme입니다.
   */
  schemeIos?: string;
  /**
   * Android 환경에서 버튼 클릭 시 실행할 application custom scheme입니다.
   */
  schemeAndroid?: string;
  /**
   * WL 타입에서 외부 브라우저로 열려면 `out`을 입력합니다.
   */
  urlTarget?: 'out' | (string & {});
  /**
   * 봇/상담톡 전환 시 전달할 메타 정보입니다.
   */
  extra?: string;
  /**
   * 봇/상담톡 전환 시 연결할 이벤트명입니다.
   */
  chatEvent?: string;
  /**
   * 상담 시작 타입입니다.
   *
   * 확인 필요: startType 값 목록이 문서에 없습니다.
   */
  startType?: string;
  /**
   * 비즈폼 키입니다. BF 타입에서 사용합니다.
   */
  bizFormKey?: string;
}

/**
 * 상담톡 바로연결입니다.
 */
export interface CounselQuickReply {
  /**
   * 카카오 바로연결 타입 코드입니다.
   *
   * 확인 필요: 바로연결 타입 코드 목록이 문서에 없습니다.
   */
  type: string;
  /**
   * 바로연결 제목입니다. 최대 14자입니다.
   *
   * 제약: maxLength=14
   */
  name: string;
  /**
   * PC 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * 모바일 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlMobile?: string;
  /**
   * iOS 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
  /**
   * 외부 브라우저로 열려면 `out`을 입력합니다.
   */
  urlTarget?: 'out' | (string & {});
  /**
   * BK 버튼 발송 또는 상담톡/챗봇 전환 시 전달할 메타 정보입니다.
   */
  extra?: string;
  /**
   * 봇 전환 시 연결할 봇 이벤트명입니다.
   */
  chatEvent?: string;
}

/**
 * 메시지(또는 캐러셀 아이템) 최하단에 노출되는 쿠폰 요소입니다.
 */
export interface CounselCoupon {
  /**
   * 쿠폰 이름입니다. 문서상 정해진 5가지 형식 중 하나여야 합니다.
   *
   * 확인 필요: 문서가 5가지 형식 중 하나라고만 하고 형식 목록을 싣지 않았습니다.
   */
  title: string;
  /**
   * 쿠폰 상세 설명입니다. WIDE, WIDE_ITEM_LIST 타입은 최대 18자, 그 외 타입은 최대 12자입니다(캐러셀 쿠폰 설명에는 PREMIUM_VIDEO도 18자로 적혀 있습니다).
   *
   * 제약: maxLength=18
   */
  description: string;
  /**
   * PC 환경에서 쿠폰 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * 모바일 환경에서 쿠폰 클릭 시 이동할 URL입니다.
   */
  urlMobile?: string;
  /**
   * iOS 환경에서 쿠폰 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 환경에서 쿠폰 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
}

/**
 * ITEM_LIST 타입의 아이템 하이라이트 영역입니다.
 */
export interface CounselItemHighlight {
  /**
   * 하이라이트 제목입니다.
   */
  title?: string;
  /**
   * 하이라이트 추가 설명입니다.
   */
  description: string;
  /**
   * 하이라이트 이미지 URL입니다.
   */
  imgUrl?: string;
}

/**
 * 아이템 리스트의 아이템 1개입니다.
 */
export interface CounselItemListEntry {
  /**
   * 아이템 제목입니다.
   */
  title: string;
  /**
   * ITEM_LIST 타입의 아이템 추가 설명입니다.
   */
  description?: string;
}

/**
 * ITEM_LIST 타입의 아이템 요약 정보입니다.
 */
export interface CounselItemSummary {
  /**
   * 요약 정보 제목입니다.
   */
  title?: string;
  /**
   * 요약 정보 추가 설명입니다.
   */
  description?: string;
}

/**
 * 아이템 리스트 요소입니다. ITEM_LIST, WIDE_ITEM_LIST 타입에서 필수입니다.
 */
export interface CounselItem {
  highlight?: CounselItemHighlight;
  /**
   * 아이템 리스트입니다. ITEM_LIST는 2~10개, WIDE_ITEM_LIST는 3~4개입니다.
   *
   * 제약: minItems=2, maxItems=10
   */
  list: CounselItemListEntry[];
  summary?: CounselItemSummary;
}

/**
 * Rich 메시지 첨부 정보입니다.
 */
export interface CounselRichAttachment {
  image?: CounselImage;
  /**
   * 버튼 목록입니다. TEXT, IMAGE, ITEM_LIST는 쿠폰 적용 시 최대 4개, 그 외 최대 5개이며 WIDE, WIDE_ITEM_LIST, CAROUSEL_FEED는 최대 2개입니다.
   *
   * 제약: maxItems=5
   */
  buttons?: CounselButton[];
  /**
   * 바로연결 목록입니다. 최대 10개입니다.
   *
   * 제약: maxItems=10
   */
  quickReplies?: CounselQuickReply[];
  coupon?: CounselCoupon;
  item?: CounselItem;
}

/**
 * 캐러셀 아이템 첨부 정보입니다.
 */
export interface CounselCarouselItemAttachment {
  /**
   * 캐러셀 아이템 버튼 목록입니다. 쿠폰을 적용하면 최대 4개, 그 외 최대 5개입니다.
   *
   * 제약: maxItems=5
   */
  buttons?: CounselButton[];
  image: CounselImage;
  coupon?: CounselCoupon;
}

/**
 * 캐러셀 아이템 1개입니다.
 */
export interface CounselCarouselItem {
  /**
   * 캐러셀 아이템 제목입니다. CAROUSEL_FEED 타입에서 사용합니다.
   */
  header?: string;
  /**
   * 캐러셀 아이템 메시지입니다. CAROUSEL_FEED 타입에서 사용합니다.
   */
  message?: string;
  attachment?: CounselCarouselItemAttachment;
}

/**
 * 캐러셀 더보기 버튼 정보입니다.
 */
export interface CounselCarouselTail {
  /**
   * 모바일 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlMobile: string;
  /**
   * PC 환경에서 버튼 클릭 시 이동할 URL입니다.
   */
  urlPc?: string;
  /**
   * iOS 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeIos?: string;
  /**
   * Android 환경에서 버튼 클릭 시 실행할 커스텀 스킴입니다.
   */
  schemeAndroid?: string;
}

/**
 * 캐러셀 정보입니다. CAROUSEL_FEED 타입에서 필수입니다.
 */
export interface CounselCarousel {
  /**
   * 캐러셀 아이템 리스트입니다. 최소 2개, 최대 10개입니다.
   *
   * 제약: minItems=2, maxItems=10
   */
  list?: CounselCarouselItem[];
  tail?: CounselCarouselTail;
}

/**
 * 상담톡 Rich 메시지 발송 요청입니다. 상담 세션이 열려 있는 사용자에게만 보낼 수 있습니다.
 * 본문과 첨부는 최종 사용자와의 상담 내용이므로 개인정보로 취급하고 로그에 남기지 않습니다.
 */
export interface CounselRichMessageRequest {
  /**
   * 상담톡 사용자 키입니다. 카카오톡 채널별로 다르며 대소문자를 구분합니다. 1~20자이며 비어 있거나 20자를 넘으면 `A507`이 반환됩니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 메시지 풍선 타입입니다. 문서가 지원 타입으로 나열한 값은 TEXT, IMAGE, WIDE, ITEM_LIST, WIDE_ITEM_LIST, CAROUSEL_FEED, PERSONAL이며,
   * 본인인증 요청은 `KAKAO_CERT`입니다. `KAKAO_CERT`는 해당 채널이 본인인증 화이트리스트에 사전 등록되어 있어야 합니다
   * (이용문의 또는 영업담당자를 통해 신청하며, CI 활용 여부 증적 자료와 채널 정보를 제출합니다).
   *
   * 확인 필요: KAKAO_CERT는 한국어 페이지(Part A)의 안내 박스에만 있고 지원 타입 목록에는 없습니다. PERSONAL 타입에 필요한 요청 필드도 문서에 없습니다.
   */
  msgType: 'TEXT' | 'IMAGE' | 'WIDE' | 'ITEM_LIST' | 'WIDE_ITEM_LIST' | 'CAROUSEL_FEED' | 'PERSONAL' | 'KAKAO_CERT' | (string & {});
  /**
   * 사용자에게 전달할 메시지입니다.
   *
   * 확인 필요: Rich 메시지 본문의 최대 길이가 문서에 없습니다.
   */
  message?: string;
  /**
   * 사용자에게 전달할 부가 메시지입니다.
   */
  description?: string;
  /**
   * 헤더입니다.
   */
  header?: string;
  attachment?: CounselRichAttachment;
  carousel?: CounselCarousel;
  /**
   * 시스템 자동 응답 메시지입니다.
   */
  autoAnswer?: string;
  /**
   * 보안 메시지 여부입니다.
   */
  lock?: boolean;
  /**
   * 본인인증 유효 시간(분)입니다. `msgType`이 `KAKAO_CERT`일 때 필수입니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없습니다. 허용 범위가 문서에 없습니다.
   */
  certExpiry?: number;
  /**
   * 참조 필드입니다. 최대 200자이며 발송 결과 웹훅(`cstalk/result`)에서 함께 반환됩니다.
   *
   * 제약: maxLength=200
   */
  ref?: string;
}

/**
 * 상담 종료 요청입니다.
 */
export interface CounselEndRequest {
  /**
   * 상담톡 사용자 키입니다. 1~20자입니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/**
 * 상담 종료 처리 결과 데이터입니다.
 */
export interface CounselEndResult {
  /**
   * 메시지 키입니다. 발송 결과 웹훅(`cstalk/result`, requestType `end`/`endwithbot`)의 `msgKey`와 대조합니다.
   */
  msgKey?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselEndServiceResult = ServiceResult & {
  data?: CounselEndResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselEndResponse {
  common: CommonResult;
  data?: CounselEndServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담 종료 및 봇 전환 요청입니다.
 */
export interface CounselEndWithBotRequest {
  /**
   * 상담톡 사용자 키입니다. 1~20자입니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 상담 종료 후 실행할 봇 이벤트(말블록)명입니다.
   */
  botEvent?: string;
}

/**
 * 대상 발신프로필과 사용자입니다.
 */
export interface CounselUserTarget {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 대상 사용자 키입니다. 1~20자입니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
}

/**
 * 사용자 수신 차단·차단 해제 요청입니다.
 */
export interface CounselUserBlockRequest {
  cstalk: CounselUserTarget;
}

/**
 * 상담 세션 정보입니다.
 */
export interface CounselSession {
  /**
   * 세션 아이디입니다.
   *
   * 확인 필요: 세션 조회 응답은 Integer, 웹훅의 sessionId는 String으로 문서가 타입을 다르게 적습니다.
   */
  sessionId?: number;
  /**
   * 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 세션 시작 타입입니다. 문서 예시 값은 `UM`입니다.
   *
   * 확인 필요: startedType·expiredType 코드 목록과 의미가 문서에 없습니다.
   */
  startedType?: 'UM' | (string & {});
  /**
   * 세션 시작 시각입니다. 문서 예시는 오프셋 없는 ISO 8601 형식(`2025-09-24T11:22:08.557`)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSS
   */
  startedAt?: string;
  /**
   * 세션 종료 타입입니다. 문서 예시 값은 `AE`입니다.
   */
  expiredType?: 'AE' | (string & {});
  /**
   * 세션 종료 시각입니다. 현재 시각보다 크면 종료 예정 시각입니다(마지막 메시지 수신 시각 기준 다음 정각으로부터 30일 후).
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  expiredAt?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 세션 조회 결과 데이터입니다.
 */
export interface CounselSessionResult {
  session?: CounselSession;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselSessionServiceResult = ServiceResult & {
  data?: CounselSessionResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselSessionResponse {
  common: CommonResult;
  data?: CounselSessionServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오톡 인증(전자서명) 진행 상태입니다.
 */
export interface CounselCert {
  /**
   * 인증 트랜잭션 ID입니다.
   */
  txId?: string;
  /**
   * 세션 아이디입니다.
   */
  sessionId?: number;
  /**
   * 서명 상태입니다. 문서 예시 값은 `COMPLETED`입니다.
   *
   * 확인 필요: signStatus 값 목록이 문서에 없습니다.
   */
  signStatus?: 'COMPLETED' | (string & {});
  /**
   * 서명 요청 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  createdAt?: string;
  /**
   * 사용자가 서명 내용을 확인한 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  viewedAt?: string;
  /**
   * 서명 완료 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  completedAt?: string;
  /**
   * 서명 만료 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  expiredAt?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 카카오톡 인증 상태 조회 결과 데이터입니다.
 */
export interface CounselCertStatusResult {
  cert?: CounselCert;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselCertStatusServiceResult = ServiceResult & {
  data?: CounselCertStatusResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselCertStatusResponse {
  common: CommonResult;
  data?: CounselCertStatusServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface CounselImageUploadRequest {
  /**
   * 업로드할 상담톡 이미지 파일입니다. jpg, png, gif 형식, 최대 5MB입니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 이미지 타입입니다. Rich 메시지 이미지 업로드 시 `rich`를 입력합니다.
   */
  imageType?: 'rich' | (string & {});
}

/**
 * 상담톡 이미지 업로드 결과입니다.
 */
export interface CounselImageUploadResult {
  /**
   * 업로드된 이미지 URL입니다. 발송 요청의 `attachment.image.imgUrl`에 넣습니다.
   */
  imgUrl?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselImageUploadServiceResult = ServiceResult & {
  data?: CounselImageUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselImageUploadResponse {
  common: CommonResult;
  data?: CounselImageUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export interface CounselFileUploadRequest {
  /**
   * 업로드할 파일 바이너리입니다. 운영 환경은 최대 300MB, 샌드박스는 최대 10MB입니다.
   *
   * 확인 필요: 용량 상한(300MB/10MB)은 한국어 페이지(Part A)에만 있고, 허용 확장자와 MB 기준(10^6/2^20 byte)이 문서에 없습니다.
   */
  file: UploadFile;
  /**
   * 업로드 파일을 식별하는 키입니다. 생략하면 서버가 자동으로 생성합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  fileKey?: string;
  /**
   * 업로드 파일의 이름입니다. 생략하면 확장자를 제외한 파일명을 사용합니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없는 필드입니다.
   */
  imageName?: string;
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 파일 타입입니다. `file`은 일반 파일, `audio`는 오디오 파일, `video`는 비디오 파일입니다.
   */
  fileType?: 'file' | 'audio' | 'video';
}

/**
 * 상담톡 파일 업로드 결과입니다.
 */
export interface CounselFileUploadResult {
  /**
   * 업로드된 파일 URL입니다. 발송 요청의 `attachment.file.fileUrl`에 넣습니다.
   */
  fileUrl?: string;
  /**
   * 업로드된 파일 이름입니다.
   */
  fileName?: string;
  /**
   * 업로드된 파일 용량입니다. 문서 예시는 byte 단위 문자열(`102400`)입니다.
   */
  size?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselFileUploadServiceResult = ServiceResult & {
  data?: CounselFileUploadResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselFileUploadResponse {
  common: CommonResult;
  data?: CounselFileUploadServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담톡 이용 활성화·비활성화 대상입니다.
 */
export interface CounselSenderActivation {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 위탁사명입니다. 사전에 등록된 경우 생략할 수 있습니다.
   */
  committalCompany?: string;
}

/**
 * 상담톡 이용 활성화·비활성화 요청입니다.
 */
export interface CounselSenderActivationRequest {
  cstalk: CounselSenderActivation;
}

/**
 * 대상 발신프로필입니다.
 */
export interface CounselSenderRef {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/**
 * 발신프로필 키만 담는 상담톡 요청입니다(채팅 기능 활성화·비활성화, 시스템 메시지 검수 요청·취소).
 */
export interface CounselSenderRequest {
  cstalk: CounselSenderRef;
}

/**
 * 요일별 상담 시간입니다.
 */
export interface CounselWeekTime {
  /**
   * 요일입니다.
   */
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  /**
   * 상담 시작 시간입니다. 문서 예시는 `0900`입니다.
   *
   * 제약: 형식 HHmm
   */
  startAt: string;
  /**
   * 상담 종료 시간입니다. 문서 예시는 `1800`입니다.
   *
   * 제약: 형식 HHmm
   */
  endAt: string;
}

/**
 * 상담 운영 시간입니다.
 */
export interface CounselConsultTime {
  /**
   * 요일별 상담 시간 목록입니다.
   */
  weekTimeTable?: CounselWeekTime[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담시간 조회 결과 데이터입니다.
 */
export interface CounselConsultTimeResult {
  cstalk?: CounselConsultTime;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselConsultTimeServiceResult = ServiceResult & {
  data?: CounselConsultTimeResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselConsultTimeResponse {
  common: CommonResult;
  data?: CounselConsultTimeServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 저장할 상담시간입니다.
 */
export interface CounselConsultTimeSetting {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 요일별 상담 시간 목록입니다.
   */
  weekTimeTable: CounselWeekTime[];
}

/**
 * 상담시간 저장 요청입니다.
 */
export interface CounselConsultTimeSaveRequest {
  cstalk: CounselConsultTimeSetting;
}

/**
 * 시스템 메시지 하단 버튼입니다.
 */
export interface CounselSystemMessageButton {
  /**
   * 버튼 노출 순서입니다.
   */
  ordering: number;
  /**
   * 시스템 메시지 버튼 링크 타입입니다. 문서 예시 값은 `WL`입니다.
   *
   * 확인 필요: 시스템 메시지 버튼 타입 목록이 문서에 없습니다.
   */
  type: 'WL' | (string & {});
  /**
   * 버튼 이름입니다.
   */
  name: string;
  /**
   * 모바일 웹링크 주소입니다.
   */
  urlMobile?: string;
  /**
   * PC 웹링크 주소입니다.
   */
  urlPc?: string;
  /**
   * iOS 앱링크 주소입니다.
   */
  schemeIos?: string;
  /**
   * Android 앱링크 주소입니다.
   */
  schemeAndroid?: string;
}

/**
 * 시스템 메시지 1건의 내용입니다.
 */
export interface CounselSystemMessageContent {
  /**
   * 시스템 메시지 타입입니다. 문서 예시 값은 `ST`입니다.
   *
   * 확인 필요: messageType 코드 목록과 의미가 문서에 없습니다.
   */
  messageType: 'ST' | (string & {});
  /**
   * 메시지 내용입니다.
   */
  content: string;
  /**
   * 메시지 하단 버튼 목록입니다. 등록 요청에서는 필수로 표시되어 있습니다.
   */
  buttons: CounselSystemMessageButton[];
}

/**
 * 시스템 메시지 검수 결과 또는 문의입니다.
 */
export interface CounselSystemMessageComment {
  /**
   * 댓글 아이디입니다.
   */
  id?: string;
  /**
   * 댓글 내용입니다.
   */
  content?: string;
  /**
   * 작성자입니다.
   */
  userName?: string;
  /**
   * 등록일입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 상태입니다. `APR` 승인, `REJ` 반려, `INQ` 문의입니다.
   */
  status?: 'APR' | 'REJ' | 'INQ';
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 등록된 시스템 메시지입니다.
 */
export interface CounselSystemMessage {
  /**
   * 시스템 메시지 ID입니다.
   */
  id?: string;
  /**
   * 시스템 메시지 이름입니다.
   */
  name?: string;
  /**
   * 시스템 메시지 상태입니다. 문서 예시 값은 `A`입니다.
   *
   * 확인 필요: status·inspectStatus 코드 목록이 문서에 없습니다.
   */
  status?: 'A' | (string & {});
  /**
   * 등록일입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  createdAt?: string;
  /**
   * 수정일입니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  modifiedAt?: string;
  /**
   * 검수 상태입니다. 문서 예시 값은 `REG`입니다.
   */
  inspectStatus?: 'REG' | (string & {});
  /**
   * 검수 요청일입니다. 값이 없으면 빈 문자열일 수 있습니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  inspectRequestAt?: string;
  /**
   * 검수일입니다. 값이 없으면 빈 문자열일 수 있습니다.
   *
   * 제약: 형식 yyyy-MM-dd HH:mm:ss
   */
  inspectedAt?: string;
  /**
   * 시스템 메시지 배열입니다.
   */
  messages?: CounselSystemMessageContent[];
  /**
   * 검수 결과 및 문의 목록입니다.
   */
  comments?: CounselSystemMessageComment[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 시스템 메시지 조회 결과 데이터입니다.
 */
export interface CounselSystemMessageListResult {
  /**
   * 시스템 메시지 목록입니다.
   */
  systemMessages?: CounselSystemMessage[];
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselSystemMessageListServiceResult = ServiceResult & {
  data?: CounselSystemMessageListResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselSystemMessageListResponse {
  common: CommonResult;
  data?: CounselSystemMessageListServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 등록할 시스템 메시지입니다.
 */
export interface CounselSystemMessageDraft {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 시스템 메시지 이름입니다.
   */
  name: string;
  /**
   * 시스템 메시지 배열입니다.
   */
  messages: CounselSystemMessageContent[];
}

/**
 * 시스템 메시지 등록 요청입니다.
 */
export interface CounselSystemMessageCreateRequest {
  cstalk: CounselSystemMessageDraft;
}

/**
 * 생성된 시스템 메시지 정보입니다.
 */
export interface CounselSystemMessageRef {
  /**
   * 생성된 시스템 메시지 ID입니다.
   */
  id?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 시스템 메시지 등록 결과 데이터입니다.
 */
export interface CounselSystemMessageCreateResult {
  systemMessage?: CounselSystemMessageRef;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

export type CounselSystemMessageCreateServiceResult = ServiceResult & {
  data?: CounselSystemMessageCreateResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

export interface CounselSystemMessageCreateResponse {
  common: CommonResult;
  data?: CounselSystemMessageCreateServiceResult;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 삭제할 상담톡 메시지입니다.
 */
export interface CounselMessageDeleteTarget {
  /**
   * 발신프로필 키입니다. 호출자 소유가 아니면 `A502`로 거부됩니다.
   */
  senderKey: string;
  /**
   * 메시지를 받은 사용자 키입니다.
   *
   * 제약: minLength=1, maxLength=20
   */
  userKey: string;
  /**
   * 삭제할 메시지의 발송 시 msgKey입니다.
   */
  msgKey: string;
}

/**
 * 상담 메시지 삭제 요청입니다.
 */
export interface CounselMessageDeleteRequest {
  cstalk: CounselMessageDeleteTarget;
}

/**
 * 리포트 웹훅 본문입니다. 리포트 1건당 1회 전송됩니다.
 */
export interface ReportWebhookPayload {
  /**
   * 메시지 키입니다.
   */
  msgKey: string;
  /**
   * 서비스 타입입니다.
   */
  serviceType: string;
  /**
   * 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 전송 처리 일시입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  sendTime?: string;
  /**
   * 리포트 수신 일시입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  reportTime: string;
  /**
   * 리포트 종류입니다.
   */
  reportType: string;
  /**
   * 리포트 코드입니다.
   */
  reportCode: string;
  /**
   * 리포트 상세 내용입니다.
   */
  reportText?: string;
  /**
   * (문자메시지) 이통사 코드입니다.
   */
  carrier?: string;
  /**
   * (카카오 브랜드메시지) 메시지 발송 처리 타입입니다.
   */
  userType?: string;
  /**
   * (국제메시지) 메시지 분할 수입니다.
   */
  resCnt?: string;
  /**
   * 요청 시 입력한 참조 필드입니다.
   */
  ref?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 웹훅 수신 응답입니다. 받은 `msgKey`를 그대로 돌려줘야 성공 처리되며, 없거나 규격이 다르면 재전송됩니다.
 */
export interface WebhookAck {
  /**
   * 수신한 메시지 키입니다.
   */
  msgKey: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * MO(인증/투표) 수신 웹훅 본문입니다.
 */
export interface MoWebhookPayload {
  /**
   * 메시지 키입니다.
   */
  msgKey: string;
  /**
   * 서비스 타입입니다. MO로 고정입니다.
   */
  serviceType: 'MO';
  /**
   * 메시지 타입입니다. SM으로 고정입니다.
   */
  msgType: 'SM';
  /**
   * 수신번호(MO 번호)입니다.
   */
  to: string;
  /**
   * MO 발신자가 입력한 번호입니다(기본은 단말기 번호).
   */
  from: string;
  /**
   * 이통사 코드입니다.
   */
  carrier: string;
  /**
   * MO 발신 단말기 번호입니다.
   */
  originator: string;
  /**
   * MO 메시지 본문입니다.
   */
  content: string;
  /**
   * MO 발생 시각(ISO 8601)입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ssXXX
   */
  occurredTime: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 상담톡 웹훅 7종의 공통 필드입니다. 값이 없는 필드는 본문에서 빠지므로 이벤트마다 전달되는 키 집합이 다릅니다.
 * 시각 필드는 `yyyy-MM-dd'T'HH:mm:ss.SSS+09:00`(KST) 형식이며 원본 값이 없으면 빈 문자열입니다.
 * 상담톡 웹훅 본문은 최종 사용자의 상담 내용·식별자이므로 개인정보로 취급하고 로그·APM·에러 리포트에 남기지 않습니다.
 */
export interface CounselWebhookCommon {
  /**
   * 메시지 키입니다. 발송 결과(`result`)에서는 발송 API 응답의 msgKey와 같고, 수신 6종에서는 이벤트마다 새로 발급된 값이라 발송 건과 대응하지 않습니다.
   * 재시도로 같은 이벤트가 다시 올 수 있으므로 msgKey 기준으로 멱등 처리합니다.
   */
  msgKey?: string;
  /**
   * 상담톡 사용자 키입니다. 카카오톡 채널별로 다르며 대소문자를 구분하고, 사용자가 탈퇴 후 재가입하면 바뀝니다.
   */
  userKey?: string;
  /**
   * 메시지를 수신한 발신프로필 키입니다.
   */
  senderKey?: string;
  /**
   * 서비스 타입입니다. 문서 예시 값은 `CSTALK`입니다.
   */
  serviceType?: 'CSTALK' | (string & {});
  /**
   * 메시지 타입입니다.
   */
  msgType?: string;
  /**
   * 요청(이벤트) 타입입니다.
   */
  requestType?: string;
  /**
   * 비즈고가 이벤트를 수신한 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  sendTime?: string;
  /**
   * 비즈고가 웹훅을 전송한 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  reportTime?: string;
  /**
   * 카카오(상담톡 서버)가 전달한 시각입니다. 사용자가 메시지를 입력한 시각이 아닙니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  kakaoTime?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 사용자가 전송한 메시지 데이터 1건입니다.
 */
export interface CounselMessageContent {
  /**
   * 이미지, 파일 등 데이터 경로입니다.
   */
  url?: string;
  /**
   * 사용자가 입력한 문구입니다.
   */
  comment?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 사용자 메시지가 4,000자를 넘으면 전체 메시지를 txt 파일 URL로 추가 전달하는 영역입니다.
 *
 * 확인 필요: 한국어 페이지(Part A)는 attachment 타입을 String으로 적으면서 하위 필드 attachment.url을 둡니다. Copy Markdown(Part B)은 Object입니다.
 */
export interface CounselMessageAttachment {
  /**
   * 전체 메시지를 확인할 수 있는 txt 파일 URL입니다.
   */
  url?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 사용자 메시지 수신 웹훅(`{고객 Webhook URL}/cstalk/message`) 본문입니다. 사용자가 보낸 상담 내용이 담기므로 개인정보로 취급합니다.
 */
export type CounselMessageWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `TEXT`입니다.
   *
   * 확인 필요: 사용자 메시지의 msgType 값 목록이 문서에 없습니다.
   */
  msgType: 'TEXT' | (string & {});
  /**
   * 요청 타입입니다. 문서 예시 값은 `message`입니다. 이 웹훅에서만 필수가 아닙니다.
   */
  requestType?: 'message' | (string & {});
  /**
   * 상담 세션 ID입니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없습니다.
   */
  sessionId?: string;
  /**
   * 하위 호환을 위해 유지되는 본문 필드입니다. 2026년 1월 이후 제공되지 않으므로 `contents`를 사용합니다.
   */
  content?: string;
  /**
   * 카카오가 전달한 부가 정보입니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없습니다.
   */
  extra?: string;
  /**
   * 사용자가 전송한 메시지 데이터 배열입니다.
   */
  contents?: CounselMessageContent[];
  attachment?: CounselMessageAttachment;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 상담톡 웹훅 수신 응답입니다. 리포트·MO 웹훅(`{"msgKey": ...}`)과 달리 `code`/`result`를 돌려줍니다.
 * HTTP 200과 이 규격의 응답을 받아야 정상 처리되며, 응답이 없거나 규격이 다르면 최대 3회 재시도합니다.
 *
 * 확인 필요: code/result가 필수인지, A000 외의 code를 보내면 실패로 보고 재시도하는지 문서에 없습니다.
 */
export interface CounselWebhookAck {
  /**
   * 웹훅 처리 결과 코드입니다. 문서 예시 값은 `A000`입니다.
   */
  code?: string;
  /**
   * 웹훅 처리 결과 메시지입니다. 문서 예시 값은 `Success`입니다.
   */
  result?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 고객사에서 설정한 현재 메타 정보입니다.
 */
export interface CounselReference {
  /**
   * 상담 연결 버튼(`https://bizmessage.kakao.com/chat/open`)의 `extra`로 전달된 메타 정보입니다.
   */
  extra?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 현재 메타 정보가 없을 때 전달되는 가장 마지막 메타 정보입니다.
 */
export interface CounselLastReference {
  /**
   * 이전 상담 연결 버튼으로 전달된 메타 정보입니다.
   */
  extra?: string;
  /**
   * 상담을 어떻게 시작했는지 나타내는 값입니다. 문서 예시 값은 문자열 `false`입니다.
   */
  bot?: string;
  /**
   * 봇으로 상담을 시작했을 때 전달되는 봇 블록 이벤트 값입니다.
   */
  bot_event?: string;
  /**
   * 마지막 메타 정보 생성 시각입니다.
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   */
  created_at?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 사용자 메타 정보 수신 웹훅(`{고객 Webhook URL}/cstalk/reference`) 본문입니다. 사용자가 상담 연결을 요청한 시점의 메타 정보가 담깁니다.
 */
export type CounselReferenceWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `REFERENCE`입니다.
   */
  msgType: 'REFERENCE' | (string & {});
  /**
   * 요청 타입입니다. 문서 예시 값은 `reference`입니다.
   */
  requestType: 'reference' | (string & {});
  /**
   * 카카오톡 앱 사용자 ID입니다. 개인 식별자이므로 로그에 남기지 않습니다.
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없습니다. 문서상 타입은 Number입니다.
   */
  appUserId?: number;
  /**
   * 상담 세션 아이디입니다. 세션이 생성된 상태에서만 상담원이 메시지를 보낼 수 있습니다.
   */
  sessionId?: string;
  reference?: CounselReference;
  lastReference?: CounselLastReference;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 세션 종료 수신 웹훅(`{고객 Webhook URL}/cstalk/expired_session`) 본문입니다.
 */
export type CounselExpiredSessionWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `SESSION`입니다.
   */
  msgType: 'SESSION' | (string & {});
  /**
   * 요청 타입입니다. 문서 예시 값은 `expired_session`입니다.
   */
  requestType: 'expired_session' | (string & {});
  /**
   * 종료된 상담 세션 아이디입니다.
   */
  sessionId?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 읽음 정보 수신 웹훅(`{고객 Webhook URL}/cstalk/seen_info`) 본문입니다. 상담 세션이 연결된 상태에서만, 발송 후 최대 24시간까지 수신되며
 * 실시간이 아니라 지연될 수 있습니다. 이 웹훅을 받으려면 카카오 비즈니스 라운지에 별도 문의가 필요합니다.
 */
export type CounselSeenInfoWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `SEEN`입니다.
   */
  msgType: 'SEEN' | (string & {});
  /**
   * 요청 타입입니다. 문서 예시 값은 `seen_info`입니다.
   */
  requestType: 'seen_info' | (string & {});
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 사용자가 수집에 동의한 개인정보입니다. 저장·로그 출력에 주의하고 목적 외로 쓰지 않습니다.
 */
export interface CounselPersonalInfo {
  /**
   * 카카오 계정 전화번호입니다.
   */
  phone_number?: string;
  /**
   * 카카오 프로필 닉네임입니다.
   */
  nickname?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
}

/**
 * 개인정보 수신 웹훅(`{고객 Webhook URL}/cstalk/personal_info`) 본문입니다. 사용자가 개인정보 수집에 동의한 뒤 전달됩니다.
 */
export type CounselPersonalInfoWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `PERSONAL`입니다.
   */
  msgType: 'PERSONAL' | (string & {});
  /**
   * 요청 타입입니다. 문서 예시 값은 `personal_info`입니다.
   */
  requestType: 'personal_info' | (string & {});
  /**
   * 상담 세션 아이디입니다.
   */
  sessionId?: string;
  personalInfo?: CounselPersonalInfo;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 본인인증 결과 수신 웹훅(`{고객 Webhook URL}/cstalk/cert_result`) 본문입니다. `KAKAO_CERT` 말풍선으로 요청한 카카오톡 본인인증(전자서명)이 완료되면
 * 상담 세션 상태와 관계없이 전달됩니다.
 */
export type CounselCertResultWebhookPayload = CounselWebhookCommon & {
  /**
   * 메시지 타입입니다. 문서 예시 값은 `KAKAO_CERT`입니다.
   */
  msgType: 'KAKAO_CERT' | (string & {});
  /**
   * 요청 타입입니다. `cert_result`로 전달됩니다.
   */
  requestType: 'cert_result';
  /**
   * 상담 세션 ID입니다.
   */
  sessionId?: string;
  /**
   * 인증 트랜잭션 ID입니다. 인증 상태 조회 API(`/api/comm/v1/center/cstalk/cert/status`)의 `certTxId`와 같은 값입니다.
   */
  certTxId: string;
  /**
   * AES256/CTR/NoPadding으로 암호화한 뒤 Base64로 인코딩한 본인인증 결과입니다. 복호화하면 이름·전화번호·생년월일·성별·내외국인·CI가 들어 있습니다
   * (`ci`는 취급 검증을 마친 발신프로필에만 제공). 복호화 키는 카카오가 이메일로 별도 전달하며 Base64로 인코딩되어 있습니다.
   * 카카오 정책상 저장하지 말고 사용자를 식별한 즉시 파기해야 하며, 로그·APM·에러 리포트에 남지 않도록 마스킹합니다.
   */
  certResult: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};

/**
 * 발송 결과 수신 웹훅(`{고객 Webhook URL}/cstalk/result`) 본문입니다. Plain/Rich 발송과 상담 종료 요청의 처리 결과가 전달되며,
 * `msgKey`·`ref`로 발송 건과 대조합니다.
 */
export type CounselResultWebhookPayload = CounselWebhookCommon & {
  /**
   * 발송 API 응답으로 받은 메시지 키입니다.
   */
  msgKey: string;
  /**
   * 요청 타입입니다. `write`(메시지 발송), `end`(상담 종료), `endwithbot`(상담 종료 및 봇 전환) 중 하나입니다.
   */
  requestType: 'write' | 'end' | 'endwithbot';
  /**
   * 발송 결과 코드입니다. 카카오 응답 코드를 비즈고 코드로 변환한 값이며 `A000`이면 성공입니다.
   */
  reportCode?: string;
  /**
   * 리포트 메시지입니다.
   */
  reportText?: string;
  /**
   * 카카오 응답 생성 일시입니다(ISO 8601).
   *
   * 제약: 형식 yyyy-MM-dd'T'HH:mm:ss.SSSXXX
   *
   * 확인 필요: 한국어 페이지(Part A)에만 있고 Copy Markdown(Part B)에는 없습니다.
   */
  kakaoResCreatedAt?: string;
  /**
   * 발송 요청 시 전달한 참조 필드입니다.
   */
  ref?: string;
  /** 스펙에 없는 필드(서버가 새로 추가한 필드 등)도 그대로 담깁니다. */
  [key: string]: unknown;
};
