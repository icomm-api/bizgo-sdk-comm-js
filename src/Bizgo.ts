import { Auth } from './services/auth/Auth';
import { BizgoOptions } from './interfaces/config/Config';
import { File } from './services/file/File';
import { MessageStatus } from './services/insight/MessageStatus';
import { SendHistory } from './services/insight/SendHistory';
import { Statistics } from './services/insight/Statistics';
import { Polling } from './services/report/polling/Polling';
import { Report } from './services/report/Report';
import { Webhook } from './services/report/webhook/Webhook';
import { Send } from './services/send/Send';

export class Bizgo {
  public auth?: Auth;
  public send?: Send;
  public polling?: Polling;
  public webhook?: Webhook;
  public file?: File;
  public report?: Report;
  public statistics?: Statistics;
  public sendHistory?: SendHistory;
  public messageStatus?: MessageStatus;
  

  /**
   * OMNI SDK의 인스턴스를 생성합니다.
   * 
   * @param config - 인증, 메시지 전송, 폼 제출 등 설정 옵션입니다.
   */
  constructor(config: BizgoOptions) {
    const { baseURL, token, id, password, apiKey } = config;

    if(apiKey) {
      this.send = new Send({ baseURL, apiKey });
    } else if (!token) {
      this.auth = new Auth({ baseURL, id, password });
    } else {
      const param = { baseURL, token };
      this.initializeModules(param);
    }
  }

  /**
   * Initializes the modules with the provided parameters.
   * 
   * @param param - The parameters including baseURL and token or apiKey.
   */
  private initializeModules(param: { baseURL: string; token?: string; apiKey?: string }): void {
    this.file = new File(param);
    this.send = new Send(param);
    this.report = new Report(param);
    this.polling = new Polling(param);
    this.webhook = new Webhook(param);
    this.statistics = new Statistics(param);
    this.sendHistory = new SendHistory(param);
    this.messageStatus = new MessageStatus(param);
  }
}
