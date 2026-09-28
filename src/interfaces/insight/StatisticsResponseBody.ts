/**
 * Interface: StatisticsData
 * Description: 발송 통계 데이터
 */
export interface StatisticsData {
  /**
   * 집계 날짜(YYYYMMDD)
   */
  statDate: string;

  /**
   * 접수 전체건수
   */
  recvTotalCnt: number;

  /**
   * 접수 성공 건수
   */
  recvSuccCnt: number;

  /**
   * 접수 실패 건수
   */
  recvFailCnt: number;

  /**
   * 리포트 전체 건수
   */
  reportTotalCnt: number;

  /**
   * 리포트 성공 건수
   */
  reportSuccCnt: number;

  /**
   * 리포트 실패 건수
   */
  reportFailCnt: number;
}

/**
 * Interface: StatisticsResponseData
 * Description: 통계 조회 응답 데이터
 */
export interface StatisticsResponseData {
  /**
   * 발송 통계 데이터 배열
   */
  statistics: StatisticsData[];
}

/**
 * Interface: StatisticsResponseBody
 * Description: 메시지 발송 통계 조회 응답 바디
 */
export interface StatisticsResponseBody {
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
    data: StatisticsResponseData;
  };
}
