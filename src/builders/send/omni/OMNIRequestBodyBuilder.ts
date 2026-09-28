import { Destination } from "../../../interfaces/send/omni/Destination";
import { MessageFlow } from "../../../interfaces/send/omni/MessageFlow";
import { OMNIRequestBody } from "../../../interfaces/send/omni/OMNIRequestBody";

export class OMNIRequestBodyBuilder {
    private omniRequestBody: Partial<OMNIRequestBody> = {};

    /** 수신 정보 리스트 설정 (최대 200개) */
    setDestinations(destinations: Array<Destination>): this {
        this.omniRequestBody.destinations = destinations;
        return this;
    }

    /** 메시지 정보 리스트 설정 */
    setMessageFlow(messageFlow?: MessageFlow[]): this {
        this.omniRequestBody.messageFlow = messageFlow;
        return this;
    }

    /** 정산용 부서코드 설정 (최대 20자) */
    setPaymentCode(paymentCode?: string): this {
        this.omniRequestBody.paymentCode = paymentCode;
        return this;
    }

    /* 멱등성 키 요청이 중복되었음을 판단할 요청의 식별자(중복 방지 키) ex 1) 클라이언트 메시지 키 ex 2) 수신번호:발신번호 */
    setIdempotencyKey(idempotencyKey?: string): this {
        this.omniRequestBody.idempotencyKey = idempotencyKey;
        return this;
    }

    /*  멱등성 키 만료시간 (1 ~ 86400초) */
    setIdempotencyTtl(idempotencyTtl?: number): this {
        this.omniRequestBody.idempotencyTtl = idempotencyTtl;
        return this;
    }


    /** 참조 필드 설정 (선택 사항) */
    setRef(ref?: string): this {
        this.omniRequestBody.ref = ref;
        return this;
    }

    /** OMNIRequestBody 객체 생성 */
    build(): OMNIRequestBody {
        return this.omniRequestBody as OMNIRequestBody;
    }
}
