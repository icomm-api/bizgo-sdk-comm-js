

/**
 * Interface: OMNIResponseBody
 * Description: 통합메세지(OMNI) 응답 본문 구조
 */
export interface OMNIResponseBody {
  /** API 호출 결과 코드 */
  code: string;

  /** API 호출 결과 설명 */
  result: string;

  /** 실제 OMNI 전송 결과 */
  data: OMNIResponseData;

  /** 요청 시 입력했던 ref 값 */
  ref?: string;
}

/**
 * data 필드 구조
 */
export interface OMNIResponseData {
  /** OMNI 전송 결과 destinations 배열 */
  destinations: DestinationData[];
}

interface DestinationData {
  /** 수신번호 */
  to: string;
  /** 메시지 키 */
  msgKey: string;
  /** 전송 결과 코드 */
  code: string;
  /** 전송 결과 설명 */
  result: string;
}