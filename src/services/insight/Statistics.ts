import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../../interfaces/config/Config';
import { StatisticsRequestBody } from '../../interfaces/insight/StatisticsRequestBody';
import { StatisticsResponseBody } from '../../interfaces/insight/StatisticsResponseBody';

const API_VERSION = CONFIG.API_VERSION;

/**
 * Class: Statistics
 * Description: 메시지 발송 통계를 조회합니다.
 */
export class Statistics {
  private client: AxiosInstance;

  /**
   * Constructor: Statistics
   * Description: API 키 또는 토큰으로 Axios client를 초기화합니다.
   * @param options - baseURL, token (API Key 또는 JWT access token)
   */
  constructor(options: any) {
    let headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // API Key 또는 Bearer Token 설정
    if (options.token) {
      if (options.token.startsWith('Bearer ')) {
        headers['Authorization'] = options.token;
      } else {
        headers['Authorization'] = `ApiKey ${options.token}`;
      }
    }

    this.client = axios.create({
      baseURL: options.baseURL,
      headers: headers
    });
  }

  /**
   * Method: getStatistics
   * Description: 메시지 발송 통계를 조회합니다.
   * @param request - 통계 조회 요청 파라미터
   * @returns 통계 조회 응답
   */
  public async getStatistics(request: StatisticsRequestBody): Promise<StatisticsResponseBody> {
    try {
      const params: any = {
        startDate: request.startDate
      };

      if (request.endDate) {
        params.endDate = request.endDate;
      }

      if (request.serviceType) {
        params.serviceType = request.serviceType;
      }

      if (request.groupKey) {
        params.groupKey = request.groupKey;
      }

      const response = await this.client.get<StatisticsResponseBody>(
        `/${API_VERSION}/message/statistics`,
        { params }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Method: handleError
   * Description: 오류 세부 정보를 기록하여 API 오류를 처리합니다.
   * @param error
   */
  private handleError(error: any): void {
    if (error.response) {
      console.error(`[API error]: ${error.response.status} ${error.response.statusText}`);
      console.error(error.response.data);
    } else {
      console.error('[API error]:', error.message);
    }
  }
}
