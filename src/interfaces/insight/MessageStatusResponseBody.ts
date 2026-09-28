/**
 * Interface: MessageStatusData
 * Description: 메시지 상태 데이터
 */
export interface MessageStatusData {
  /**
   * 메시지 키
   */
  msgKey: string;

  /**
   * 서비스 타입 (SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE)
   */
  serviceType: string;

  /**
   * 메시지 타입
   */
  msgType: string;

  /**
   * 수신번호
   */
  to: string;

  /**
   * 대체발송 여부 (Y/N)
   */
  fallback: string;

  /**
   * 접수 코드
   */
  responseCode: string;

  /**
   * 접수 실패 사유
   */
  responseText: string;

  /**
   * 접수 시간 (ISO 8601, yyyy-MM-dd'T'HH:mm:ssXXX)
   */
  requestTime: string;

  /**
   * 발송 시간 (ISO 8601, yyyy-MM-dd'T'HH:mm:ssXXX)
   */
  sendTime: string;

  /**
   * 리포트 시간 (ISO 8601, yyyy-MM-dd'T'HH:mm:ssXXX)
   */
  reportTime: string;

  /**
   * 리포트 종류
   */
  reportType: string;

  /**
   * 리포트 코드
   */
  reportCode: string;

  /**
   * 리포트 실패 사유
   */
  reportText: string;

  /**
   * 통신사 코드 - 선택사항
   */
  carrier?: string;

  /**
   * 참조 필드 - 선택사항
   */
  ref?: string;

  /**
   * 사용자 타입 - 선택사항
   */
  userType?: string;
}

/**
 * Interface: MessageStatusResponseData
 * Description: 메시지 상태 조회 응답 데이터
 */
export interface MessageStatusResponseData {
  /**
   * 메시지 상태 데이터 배열
   */
  messages: MessageStatusData[];
}

/**
 * Interface: MessageStatusResponseBody
 * Description: 메시지 상태 조회 응답 바디
 */
export interface MessageStatusResponseBody {
  /**
   * 공통부
   */
  common: {
    /**
     * 인증 결과 코드
     */
    authCode: string;

    /**
     * 인증 결과 메시지
     */
    authResult: string;

    /**
     * 인포뱅크 트랜젝션 아이디
     */
    infobankTrId: string;
  };

  /**
   * 데이터부
   */
  data: {
    /**
     * 호출 결과 코드
     */
    code: string;

    /**
     * 호출 결과 설명
     */
    result: string;

    /**
     * 호출 결과 데이터
     */
    data: MessageStatusResponseData;
  };
}
