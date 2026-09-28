/**
 * Interface: StatisticsRequestBody
 * Description: 메시지 발송 통계 조회 요청 바디
 */
export interface StatisticsRequestBody {
  /**
   * 시작날짜(YYYYMMDD)
   */
  startDate: string;

  /**
   * 종료날짜(YYYYMMDD) - 선택사항
   */
  endDate?: string;

  /**
   * 서비스 타입(SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE) - 선택사항
   */
  serviceType?: string;

  /**
   * 그룹 키 - 선택사항
   */
  groupKey?: string;
}
