
import axios, { AxiosInstance } from "axios";
import { BizgoOptions } from "../../interfaces/config/Config";
import { BizgoResponseBody } from '../../interfaces/send/BizgoResponseBody';
import { OMNIRequestBody } from '../../interfaces/send/omni/OMNIRequestBody';

const API_VERSION = "/v1";

/**
 * Class: Send
 * Description: 메세지 전송 API
 */
export class Send {
  private client: AxiosInstance;


  /**
   * Constructor: Send
   * Description: 인증 헤더로 Axios client 를 초기화 합니다.
   * @param options - baseURL, token
   */
  constructor(options: BizgoOptions) {
    let authorizationHeader = '';

    if (options.token) {
      authorizationHeader = `Bearer ${options.token}`;
    } else if (options.apiKey) {
      authorizationHeader = options.apiKey;
    }

    this.client = axios.create({
      baseURL: options.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authorizationHeader && { 'Authorization': authorizationHeader }),
      },
    });
  }

  /**
   * Method: OMNI
   * Description: 메시지 별로 Fallback을 순차적으로 처리해주는 통합메시지 발송 규격입니다.
   * 메시지 관련 상세 옵션필드를 모두 사용할 수 있는 전문가 방식 입니다.
   * 요청 당 최대 200개의 수신번호를 함께 전송할 수 있습니다.
   * 메시지 내용, 제목, 버튼 등에 치환문구를 활용하여 전송 할 수 있습니다.
   * 전체 메시지 정보를 입력하는 방식 또는 사전에 등록한 메시지 폼을 이용하는 방식, 총 2가지 방식 중 선택하여 전송하실 수 있습니다.
   * 
   * @param body - OMNI (통합 메세지) Request
   * @returnsparam
   */
  public async OMNI(body: OMNIRequestBody): Promise<BizgoResponseBody> {
    return this.sendRequest(`${API_VERSION}/send/omni`, body);
  }

  /**
   * Method: sendRequest
   * Description: 지정된 본문과 함께 지정된 URL로 요청을 보냅니다.
   * @param url - URL
   * @param body
   * @returnsparam
   */
  private async sendRequest(url: string, body: any): Promise<BizgoResponseBody> {
    try {
      const response = await this.client.post<BizgoResponseBody>(url, JSON.stringify(body));
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Method: handleError
   * Description: 오류 세부 정보를 기록하여 API 오류를 처리합니다.
   * @param error - AxiosError 또는 일반 오류
   */
  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`[API error]: ${error.response.status} ${error.response.statusText}`);
        console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        console.error("Response headers:", JSON.stringify(error.response.headers, null, 2));
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error('[API error]:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
