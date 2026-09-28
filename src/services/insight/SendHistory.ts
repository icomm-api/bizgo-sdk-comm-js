import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../../interfaces/config/Config';
import { SendHistoryRequestBody } from '../../interfaces/insight/SendHistoryRequestBody';
import { SendHistoryResponseBody } from '../../interfaces/insight/SendHistoryResponseBody';

const API_VERSION = CONFIG.API_VERSION;

/**
 * Class: SendHistory
 * Description: 메시지 발송 이력을 조회합니다.
 */
export class SendHistory {
  private client: AxiosInstance;

  /**
   * Constructor: SendHistory
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
   * Method: getSendHistory
   * Description: 메시지 발송 이력을 조회합니다.
   * @param request - 발송 이력 조회 요청 파라미터
   * @returns 발송 이력 조회 응답
   */
  public async getSendHistory(request: SendHistoryRequestBody): Promise<SendHistoryResponseBody> {
    try {
      const params: any = {
        startDate: request.startDate
      };

      if (request.endDate) {
        params.endDate = request.endDate;
      }

      if (request.pageNo !== undefined) {
        params.pageNo = request.pageNo;
      }

      if (request.pageSize !== undefined) {
        params.pageSize = request.pageSize;
      }

      if (request.msgId) {
        params.msgId = request.msgId;
      }

      if (request.serviceType) {
        params.serviceType = request.serviceType;
      }

      if (request.groupKey) {
        params.groupKey = request.groupKey;
      }

      const response = await this.client.get<SendHistoryResponseBody>(
        `/${API_VERSION}/message/sendHistory`,
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
