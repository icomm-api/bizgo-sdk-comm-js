// Generated from spec/openapi.yaml by scripts/generate.mjs. Do not edit.
//
// One parser per x-sdk-webhook. `signature: required` webhooks (report, MO) list X-IB-Timestamp/X-IB-Signature
// in the spec and are always verified; `signature: none` webhooks (counsel) have no signature and are only parsed.

import type { WebhookBody, WebhookHeaders } from '../webhooks.js';
import type {
  CounselCertResultWebhookPayload,
  CounselExpiredSessionWebhookPayload,
  CounselMessageWebhookPayload,
  CounselPersonalInfoWebhookPayload,
  CounselReferenceWebhookPayload,
  CounselResultWebhookPayload,
  CounselSeenInfoWebhookPayload,
  MoWebhookPayload,
  ReportWebhookPayload,
} from './types.js';

export interface WebhookSpec {
  readonly schema: string;
  readonly signature: 'required' | 'none';
  readonly ack: 'msgKey' | 'codeResult';
}

export const WEBHOOKS = {
  report: {"schema":"webhook:ReportWebhookPayload","signature":"required","ack":"msgKey"},
  mo: {"schema":"webhook:MoWebhookPayload","signature":"required","ack":"msgKey"},
  counselMessage: {"schema":"webhook:CounselMessageWebhookPayload","signature":"none","ack":"codeResult"},
  counselReference: {"schema":"webhook:CounselReferenceWebhookPayload","signature":"none","ack":"codeResult"},
  counselExpiredSession: {"schema":"webhook:CounselExpiredSessionWebhookPayload","signature":"none","ack":"codeResult"},
  counselSeenInfo: {"schema":"webhook:CounselSeenInfoWebhookPayload","signature":"none","ack":"codeResult"},
  counselPersonalInfo: {"schema":"webhook:CounselPersonalInfoWebhookPayload","signature":"none","ack":"codeResult"},
  counselCertResult: {"schema":"webhook:CounselCertResultWebhookPayload","signature":"none","ack":"codeResult"},
  counselResult: {"schema":"webhook:CounselResultWebhookPayload","signature":"none","ack":"codeResult"},
} as const satisfies Readonly<Record<string, WebhookSpec>>;

/** Every x-sdk-webhook name. */
export type WebhookName = keyof typeof WEBHOOKS;

/** Payload type per x-sdk-webhook name (the return type of `parseWebhook(name, body)`). */
export interface WebhookPayloads {
  report: ReportWebhookPayload;
  mo: MoWebhookPayload;
  counselMessage: CounselMessageWebhookPayload;
  counselReference: CounselReferenceWebhookPayload;
  counselExpiredSession: CounselExpiredSessionWebhookPayload;
  counselSeenInfo: CounselSeenInfoWebhookPayload;
  counselPersonalInfo: CounselPersonalInfoWebhookPayload;
  counselCertResult: CounselCertResultWebhookPayload;
  counselResult: CounselResultWebhookPayload;
}

/** Generated webhook parsers. Use {@link WebhookReceiver}, which implements `receive`. */
export abstract class GeneratedWebhookReceiver {
  /** Verify the signature (signed webhooks only) and parse one webhook request. */
  protected abstract receive(name: WebhookName, headers: WebhookHeaders, body: WebhookBody): unknown;

  /**
   * 리포트 수신(Webhook)
   *
   * 콘솔에 등록한 웹훅 URL로 리포트가 1건씩 전송됩니다. 5초 안에 `{"msgKey": "<받은 msgKey>"}`로 응답해야 하며,
   * 응답이 없거나 규격이 다르면 최대 3회 재전송됩니다. 같은 리포트가 두 번 올 수 있으므로 msgKey 기준으로 중복 처리합니다.
   * 요청에는 `X-IB-Timestamp`와 `X-IB-Signature`(`HmacSHA256(secret, X-IB-Timestamp)`) 헤더가 붙습니다. secret은 비즈고에 요청해 받습니다.
   *
   * 서명 헤더(`X-IB-Timestamp`, `X-IB-Signature`)가 반드시 있어야 하며 엄격하게 검증합니다.
   * 응답 본문: `receiver.ack(msgKey)`.
   * @throws {@link WebhookVerificationError} 서명·시각·본문 검증에 실패했습니다(HTTP 401로 응답).
   */
  report(headers: WebhookHeaders, body: WebhookBody): ReportWebhookPayload {
    return this.receive('report', headers, body) as ReportWebhookPayload;
  }

  /**
   * MO 수신(Webhook)
   *
   * 사용자가 회신한 MO(인증/투표) 메시지가 등록한 웹훅 URL로 전송됩니다.
   * 요청에는 `X-IB-Timestamp`와 `X-IB-Signature`(`HmacSHA256(secret, X-IB-Timestamp)`) 헤더가 붙습니다. secret은 비즈고에 요청해 받습니다.
   *
   * 서명 헤더(`X-IB-Timestamp`, `X-IB-Signature`)가 반드시 있어야 하며 엄격하게 검증합니다.
   * 응답 본문: `receiver.ack(msgKey)`.
   * @throws {@link WebhookVerificationError} 서명·시각·본문 검증에 실패했습니다(HTTP 401로 응답).
   */
  mo(headers: WebhookHeaders, body: WebhookBody): MoWebhookPayload {
    return this.receive('mo', headers, body) as MoWebhookPayload;
  }

  /**
   * 상담톡 사용자 메시지 수신(Webhook)
   *
   * 사용자가 상담톡으로 보낸 메시지가 전달됩니다. `content`는 2026년 1월 이후 제공되지 않으므로 `contents[]`를 사용하며,
   * 4,000자를 넘는 메시지는 `attachment.url`(txt 파일)로 전체 내용이 추가 전달됩니다.
   * `msgKey`는 이벤트마다 새로 발급되며 발송 건과 대응하지 않습니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselMessage(headers: WebhookHeaders, body: WebhookBody): CounselMessageWebhookPayload {
    return this.receive('counselMessage', headers, body) as CounselMessageWebhookPayload;
  }

  /**
   * 상담톡 사용자 메타 정보 수신(Webhook)
   *
   * 사용자가 상담 연결을 요청한 시점의 메타 정보가 전달됩니다. 현재 메타 정보가 없으면 `lastReference`에 마지막 메타 정보가 옵니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselReference(headers: WebhookHeaders, body: WebhookBody): CounselReferenceWebhookPayload {
    return this.receive('counselReference', headers, body) as CounselReferenceWebhookPayload;
  }

  /**
   * 상담톡 세션 종료 수신(Webhook)
   *
   * 상담 세션이 종료되면 전달됩니다. 세션은 상담원의 상담 종료·사용자 차단, 사용자의 `!종료` 입력·채팅방 나가기·채널 차단,
   * 마지막 메시지 수신 후 30일 경과 시 종료됩니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselExpiredSession(headers: WebhookHeaders, body: WebhookBody): CounselExpiredSessionWebhookPayload {
    return this.receive('counselExpiredSession', headers, body) as CounselExpiredSessionWebhookPayload;
  }

  /**
   * 상담톡 읽음 정보 수신(Webhook)
   *
   * 사용자 읽음 정보가 전달됩니다. 상담 세션이 연결된 상태에서만, 발송 후 최대 24시간까지 수신되며 지연될 수 있습니다.
   * 이 웹훅을 받으려면 카카오 비즈니스 라운지에 별도 문의가 필요합니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselSeenInfo(headers: WebhookHeaders, body: WebhookBody): CounselSeenInfoWebhookPayload {
    return this.receive('counselSeenInfo', headers, body) as CounselSeenInfoWebhookPayload;
  }

  /**
   * 상담톡 개인정보 수신(Webhook)
   *
   * 사용자가 개인정보 수집에 동의한 뒤 카카오 계정 전화번호·닉네임이 전달됩니다. 수집 목적 범위에서만 쓰고 로그에 남기지 않습니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselPersonalInfo(headers: WebhookHeaders, body: WebhookBody): CounselPersonalInfoWebhookPayload {
    return this.receive('counselPersonalInfo', headers, body) as CounselPersonalInfoWebhookPayload;
  }

  /**
   * 상담톡 본인인증 결과 수신(Webhook)
   *
   * `KAKAO_CERT` 말풍선으로 요청한 카카오톡 본인인증(전자서명)이 완료되면 결과가 전달됩니다. 상담 세션 상태와 관계없이 전달됩니다.
   * `certResult`는 AES256/CTR/NoPadding + Base64로 암호화된 인증정보(이름·전화번호·생년월일·성별·내외국인·CI)입니다.
   * 카카오 정책상 인증정보는 저장하지 말고 사용자를 식별한 즉시 파기해야 하며, 로그·APM·에러 리포트에 남지 않도록 마스킹합니다.
   * 복호화 키는 카카오가 이메일로 별도 전달하므로 코드·저장소에 넣지 말고 비밀 저장소에서 읽습니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselCertResult(headers: WebhookHeaders, body: WebhookBody): CounselCertResultWebhookPayload {
    return this.receive('counselCertResult', headers, body) as CounselCertResultWebhookPayload;
  }

  /**
   * 상담톡 발송 결과 수신(Webhook)
   *
   * Plain/Rich 발송(`write`)과 상담 종료(`end`, `endwithbot`) 요청의 처리 결과가 전달됩니다.
   * `msgKey`는 발송 API 응답의 msgKey와 같으므로 `msgKey`·`ref`로 발송 건과 대조하고, `reportCode`가 `A000`이면 성공입니다.
   *
   * 상담톡 웹훅에는 서명이 없습니다(서명은 리포트·MO 웹훅에만 적용). 서명 헤더를 요구하거나 검사하지 않고, 본문 크기·JSON 깊이·형식만 검증합니다. secret 없이 파싱하려면 `parseWebhook(name, body)`를 씁니다.
   * 응답 본문: `receiver.counselAck()` (`{"code": "A000", "result": "Success"}`).
   * @throws {@link WebhookVerificationError} 본문 검증에 실패했습니다(HTTP 400으로 응답).
   */
  counselResult(headers: WebhookHeaders, body: WebhookBody): CounselResultWebhookPayload {
    return this.receive('counselResult', headers, body) as CounselResultWebhookPayload;
  }
}
