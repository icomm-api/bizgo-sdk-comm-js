/**
 * Interface: SendHistoryRequestBody
 * Description: 메시지 발송 이력 조회 요청 바디
 */
export interface SendHistoryRequestBody {
  /**
   * 시작날짜(YYYYMMDD)
   */
  startDate: string;

  /**
   * 종료날짜(YYYYMMDD) - 선택사항
   */
  endDate?: string;

  /**
   * 페이지 번호 - 선택사항 (기본값: 1)
   */
  pageNo?: number;

  /**
   * 페이지 크기 - 선택사항 (기본값: 10, 최대: 100)
   */
  pageSize?: number;

  /**
   * 메시지 ID - 선택사항
   */
  msgId?: string;

  /**
   * 서비스 타입(SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE) - 선택사항
   */
  serviceType?: string;

  /**
   * 그룹 키 - 선택사항
   */
  groupKey?: string;
}
