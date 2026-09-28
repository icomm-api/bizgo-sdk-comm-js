import { International } from "../../../interfaces/send/international/International";

/**
 * 클래스: InternationalBuilder
 * 설명: 국제 문자 발송을 위한 InternationalRequestBody 빌더 클래스입니다.
 */
export class InternationalBuilder {
    private International: International;
  
    constructor() {
        this.International = {
            from: '',
            text: '',
        };
    }

    /** 발신번호 설정 */
    setFrom(from: string): this {
        this.International.from = from;
        return this;
    }

    /** 메시지 내용 설정 (최대 90자) */
    setText(text: string): this {
        if (text.length > 90) {
            throw new Error('Text length exceeds the maximum limit of 90 characters.');
        }
        this.International.text = text;
        return this;
    }

    /** 참조필드 설정 (선택 사항, 최대 200자) */
    setRef(ref?: string): this {
        if (ref && ref.length > 200) {
            throw new Error('Ref length exceeds the maximum limit of 200 characters.');
        }
        this.International.ref = ref;
        return this;
    }

    /** InternationalRequestBody 객체 생성 */
    build(): International {
        return this.International;
    }
}
