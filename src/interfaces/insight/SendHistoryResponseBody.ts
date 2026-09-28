/**
 * Interface: SendHistoryData
 * Description: 메시지 발송 이력 데이터
 */
export interface SendHistoryData {
  /**
   * 메시지 ID
   */
  msgId: string;

  /**
   * 발송 날짜(YYYYMMDD)
   */
  sendDate: string;

  /**
   * 발송 시간(HH:mm:ss)
   */
  sendTime: string;

  /**
   * 수신자 번호
   */
  receiver: string;

  /**
   * 발신자 번호
   */
  sender: string;

  /**
   * 서비스 타입 (SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE)
   */
  serviceType: string;

  /**
   * 메시지 제목
   */
  title?: string;

  /**
   * 메시지 내용
   */
  content: string;

  /**
   * 발송 상태 (PENDING, SUCCESS, FAILED, CANCELLED)
   */
  status: string;

  /**
   * 리포트 상태 (DELIVERED, FAILED, PENDING, etc.)
   */
  reportStatus?: string;

  /**
   * 에러 코드 - 발송 실패 시
   */
  errorCode?: string;

  /**
   * 에러 메시지
   */
  errorMsg?: string;

  /**
   * 그룹 키
   */
  groupKey?: string;

  /**
   * 요청 ID
   */
  requestId?: string;
}

/**
 * Interface: SendHistoryResponseData
 * Description: 발송 이력 조회 응답 데이터
 */
export interface SendHistoryResponseData {
  /**
   * 발송 이력 데이터 배열
   */
  sendHistory: SendHistoryData[];

  /**
   * 현재 페이지 번호
   */
  pageNo: number;

  /**
   * 페이지 크기
   */
  pageSize: number;

  /**
   * 전체 건수
   */
  totalCount: number;

  /**
   * 전체 페이지 수
   */
  totalPages: number;
}

/**
 * Interface: SendHistoryResponseBody
 * Description: 메시지 발송 이력 조회 응답 바디
 */
export interface SendHistoryResponseBody {
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
    data: SendHistoryResponseData;
  };
}
