import { BizgoOptions } from "../../interfaces/config/Config";


/**
 * 클래스: BizgoOptionsBuilder
 * 설명: OMNI API 인증 및 사용을 위한 OMNIOption 빌더 클래스입니다.
 */
export class BizgoOptionsBuilder {
    private bizgoOptions: Partial<BizgoOptions> = {};

    setBaseURL(baseURL: string): this {
        this.bizgoOptions.baseURL = baseURL;
        return this;
    }

    setId(id?: string): this {
        this.bizgoOptions.id = id;
        return this;
    }

    setPassword(password?: string): this {
        this.bizgoOptions.password = password;
        return this;
    }

    setToken(token?: string): this {
        this.bizgoOptions.token = token;
        return this;
    }

    build(): BizgoOptions {
        return this.bizgoOptions as BizgoOptions;
    }
}
