/**
 * Interface: BizgoResponseBody<T>
 * Description: Bizgo/MARS 공통 응답 구조 (generic)
 */
export interface BizgoResponseBody<T = any> {
  common: Common;
  data: BizgoData<T>;
}

/**
 * 공통 영역 (모든 응답이 반드시 포함)
 */
export interface Common {
  authCode: string;
  authResult: string;
  infobankTrId: string;
}

/**
 * data 영역 (generic)
 */
export interface BizgoData<T = any> {
  code: string;
  result: string;
  ref?: string;
  data: T;
}