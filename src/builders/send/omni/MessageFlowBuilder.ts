
import { International } from "../../../interfaces/send/international/International";
import { Alimtalk } from "../../../interfaces/send/kakao/Alimtalk/Alimtalk";
import { BrandMessage } from "../../../interfaces/send/kakao/BrandMessage/BrandMessage";
import { MMS } from "../../../interfaces/send/mms/MMS";
import { MessageFlow } from "../../../interfaces/send/omni/MessageFlow";
import { RCS } from "../../../interfaces/send/rcs/RCS";
import { SMS } from "../../../interfaces/send/sms/SMS";

export class MessageFlowBuilder {
    private messageFlow: Partial<MessageFlow>[] = [];

   /** SMS 메시지 세부 사항 설정 (선택 사항) */
setSMS(sms?: SMS): this {
    if (sms) {
        this.messageFlow.push({ sms });
    }
    return this;
}

/** MMS 메시지 세부 사항 설정 (선택 사항) */
setMMS(mms?: MMS): this {
    if (mms) {
        this.messageFlow.push({ mms });
    }
    return this;
}

/** 국제 메시지 세부 사항 설정 (선택 사항) */
setInternational(international?: International): this {
    if (international) {
        this.messageFlow.push({ international });
    }
    return this;
}

/** RCS 메시지 세부 사항 설정 (선택 사항) */
setRCS(rcs?: RCS): this {
    if (rcs) {
        this.messageFlow.push({ rcs });
    }
    return this;
}

/** 카카오 알림톡 메시지 세부 사항 설정 (선택 사항) */
setAlimtalk(alimtalk?: Alimtalk): this {
    if (alimtalk) {
        this.messageFlow.push({ alimtalk });
    }
    return this;
}

/** 카카오 브랜드 메시지 메시지 세부 사항 설정 (선택 사항) */
setBrandMessage(brandmessage?: BrandMessage): this {
    if (brandmessage) {
        this.messageFlow.push({ brandmessage });
    }
    return this;
}


/** MessageForm 배열 생성 */
build(): Partial<MessageFlow>[] {
    return this.messageFlow;
}
}
