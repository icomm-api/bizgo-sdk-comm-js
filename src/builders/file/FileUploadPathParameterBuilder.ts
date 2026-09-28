import { FileUploadPathParameter } from "../../interfaces/file/FileRequestBody";

/**
 * 클래스: FileUploadPathParameterBuilder
 * 설명: 파일 업로드 경로 파라미터를 생성하는 빌더 클래스입니다.
 */
export class FileUploadPathParameterBuilder {
    private pathParameter: Partial<FileUploadPathParameter> = {};

    /** 서비스 타입 설정 (MMS, RCS, KAKAO 등) */
    setServiceType(serviceType: string): this {
        this.pathParameter.serviceType = serviceType;
        return this;
    }

    /** 메시지 타입 설정 (선택사항) */
    setMsgType(msgType?: string): this {
        this.pathParameter.msgType = msgType;
        return this;
    }

    /** 서브 타입 설정 (선택사항) */
    setSubType(subType?: string): this {
        this.pathParameter.subType = subType;
        return this;
    }

    /** FileUploadPathParameter 객체 생성 */
    build(): FileUploadPathParameter {
        return this.pathParameter as FileUploadPathParameter;
    }
}

