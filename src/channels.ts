/**
 * Channel helpers. Each wraps a channel message into its `messageFlow` item so the channel key is explicit:
 *
 * ```ts
 * await client.send.omni({
 *   to: '01000000000',
 *   messages: [alimtalk({ senderKey, templateCode, msgType: 'AT', text }), sms({ from, text })],
 * });
 * ```
 *
 * `sms({...})` is exactly `{ sms: {...} }`; you can also write the items by hand.
 *
 * @module
 */
import type {
  AlimtalkFlowItem,
  AlimtalkMessage,
  BrandMessage,
  BrandMessageFlowItem,
  InternationalFlowItem,
  InternationalMessage,
  MmsFlowItem,
  MmsMessage,
  NaverTalkFlowItem,
  NaverTalkMessage,
  RcsFlowItem,
  RcsMessage,
  SmsFlowItem,
  SmsMessage,
} from './generated/types.js';

/** SMS: `text` up to 90 bytes in EUC-KR (about 45 Korean characters). → `{ sms: message }` */
export function sms(message: SmsMessage): SmsFlowItem {
  return { sms: message };
}

/** LMS (no `fileKey`) or MMS (`fileKey` from `client.files.uploadMms`, max 3). Text up to 2,000 bytes. → `{ mms }` */
export function mms(message: MmsMessage): MmsFlowItem {
  return { mms: message };
}

/** International SMS. → `{ international: message }` */
export function international(message: InternationalMessage): InternationalFlowItem {
  return { international: message };
}

/** RCS. → `{ rcs: message }` */
export function rcs(message: RcsMessage): RcsFlowItem {
  return { rcs: message };
}

/** Kakao AlimTalk. → `{ alimtalk: message }` */
export function alimtalk(message: AlimtalkMessage): AlimtalkFlowItem {
  return { alimtalk: message };
}

/** Kakao BrandMessage. → `{ brandmessage: message }` */
export function brandMessage(message: BrandMessage): BrandMessageFlowItem {
  return { brandmessage: message };
}

/** Naver TalkTalk. → `{ navertalk: message }` */
export function naverTalk(message: NaverTalkMessage): NaverTalkFlowItem {
  return { navertalk: message };
}
