
/**
   * const: API 버전
   */
export const CONFIG = {
    API_VERSION: "v1"
  };
  
  /**
   * Interface: AuthOptions
   * Description: 인증 토큰 받을 시 필요한 옵션을 나타냅니다.
   */
  export interface AuthOptions {
    /** 요청 baseURL */
    baseURL: string;
    /** OMNI API ID */
    id?: string;
    /** OMNI API Password */
    password?: string;
  }
  
  /**
   * Interface: BizgoOptions
   * Description: 인증 토큰 발급 후, API 사용 시 필요한 옵션을 나타냅니다.
   */
  export interface BizgoOptions {
    /** 요청 baseURL */
    password?: string;
    /** OMNI API ID */
    id?: string;
    /** OMNI API Password */
    baseURL: string;
    /** 발급받은 token */
    token?: string;
    /** 발급받은 apiKey */
    apiKey?: string;
  }
  