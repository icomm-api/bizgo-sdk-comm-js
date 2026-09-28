import axios, { AxiosInstance } from 'axios';
import { BizgoOptions, CONFIG } from '../../interfaces/config/Config';
import { FileRequestBody, FileUploadPathParameter } from "../../interfaces/file/FileRequestBody";
import { BizgoResponseBody } from '../../interfaces/send/BizgoResponseBody';

const API_VERSION = CONFIG.API_VERSION;

/**
 * Class: FileUpload
 * Description: 메시지 발송에 필요한 이미지 파일을 관리 합니다.
 */
export class File {
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
   * Method: uploadFile
   * Description: 이미지 파일을 업로드 합니다.
   * @param fileUploadPathParameter - serviceType, msgType
   * @param fileUploadRequest - fileData
   * @returns
   */
  public async uploadFile(fileUploadPathParameter: FileUploadPathParameter, fileUploadRequest: FileRequestBody): Promise<BizgoResponseBody> {
    try {
      const response = await this.client.post<BizgoResponseBody>(
       `/${API_VERSION}/file/${fileUploadPathParameter.serviceType}` +
      `${fileUploadPathParameter.msgType ? `/${fileUploadPathParameter.msgType}` : ''}` +
      `${fileUploadPathParameter.subType ? `/${fileUploadPathParameter.subType}` : ''}`
      , 
        fileUploadRequest
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
