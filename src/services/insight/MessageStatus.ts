import axios, { AxiosInstance } from 'axios';
import { CONFIG } from '../../interfaces/config/Config';
import { MessageStatusResponseBody } from '../../interfaces/insight/MessageStatusResponseBody';

const API_VERSION = CONFIG.API_VERSION;

/**
 * Class: MessageStatus
 * Description: 메시지의 상태(접수, 발송, 리포트)를 조회합니다.
 */
export class MessageStatus {
  private client: AxiosInstance;

  /**
   * Constructor: MessageStatus
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
   * Method: getMessageStatusByMsgKey
   * Description: 단건 메시지 상태를 조회합니다. (메시지 키로 조회)
   * @param msgKey - 조회할 메시지 키
   * @returns 메시지 상태 조회 응답
   */
  public async getMessageStatusByMsgKey(msgKey: string): Promise<MessageStatusResponseBody> {
    try {
      const response = await this.client.get<MessageStatusResponseBody>(
        `/${API_VERSION}/message/inquiry/msgKey/${msgKey}`
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Method: getMessageStatusByRequestId
   * Description: 여러 건의 메시지 상태를 조회합니다. (요청 ID로 동보 전체 조회)
   * @param requestId - 조회할 요청 ID (msgKey의 마지막 3자리를 제외한 문자열)
   * @returns 메시지 상태 조회 응답
   */
  public async getMessageStatusByRequestId(requestId: string): Promise<MessageStatusResponseBody> {
    try {
      const response = await this.client.get<MessageStatusResponseBody>(
        `/${API_VERSION}/message/inquiry/requestId/${requestId}`
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
