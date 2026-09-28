
/**
 * Interface: International
 * Description: 국제 SMS 요청의 본문을 나타냅니다.
 */
export interface International {
  /** 발신번호 */
  from: string;
  /** 메시지 내용 (최대 90자) */
  text: string;
  /** 참조필드 (선택 사항, 최대 200자) */
  ref?: string;
}
