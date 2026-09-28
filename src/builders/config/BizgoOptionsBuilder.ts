import { BizgoOptions } from "../../interfaces/config/Config";

/**
 * 클래스: BizgoOptionsBuilder
 * 설명: OMNI API 사용을 위한 DefaultOption 빌더 클래스입니다.
 */
export class BizgoOptionsBuilder {
    private bizgoOptions: Partial<BizgoOptions> = {};

    setBaseURL(baseURL: string): this {
        this.bizgoOptions.baseURL = baseURL;
        return this;
    }

    setToken(token?: string): this {
        this.bizgoOptions.token = token;
        return this;
    }

    setApiKey(apiKey?: string): this {
        this.bizgoOptions.apiKey = apiKey;
        return this;
    }

    build(): BizgoOptions {
        return this.bizgoOptions as BizgoOptions;
    }
}
