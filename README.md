# Bizgo SDK Communication JS v1.0.3
---
[![SDK Documentation](https://img.shields.io/badge/SDK-Documentation-blue)]() [![Test Coverage](https://img.shields.io/badge/tests-66%20passed-brightgreen)]() [![API Reference](https://img.shields.io/badge/api-reference-blue.svg)]() [![Apache V2 License](https://img.shields.io/badge/license-Apache%20V2-blue.svg)]()


Bizgo Communication API SDK for JavaScript/TypeScript

## ✨ 주요 특징

- 🎯 **빌더 패턴**: 직관적인 메시지 구성
- 📦 **타입 안전성**: TypeScript 완벽 지원
- 🔄 **Fallback 지원**: 메시지 타입 자동 전환 (알림톡 → SMS)
- 🧪 **테스트 완비**: 66개 테스트 모두 통과
- 🌐 **다양한 환경**: Node.js, Next.js 지원 (React는 서버 프록시 필요)
- 📨 **다양한 메시지**: SMS, MMS, RCS, 알림톡, 브랜드메세지, 국제 SMS

## 📑 목차

- [빠른 시작](#-빠른-시작)
- [설치](#-설치)
- [인증](#-인증)
- [메시지 발송](#-메시지-발송)
  - [SMS 발송](#sms-발송)
  - [MMS 발송](#mms-발송)
  - [알림톡 발송](#알림톡-발송)
  - [RCS 발송](#rcs-발송)
  - [통합 메시지 (OMNI)](#통합-메시지-omni)
- [파일 업로드](#-파일-업로드)
- [리포트 조회](#-리포트-조회)
- [테스트](#-테스트)
- [문의](#-문의)

---

## 🚀 빠른 시작

```javascript
import { Bizgo, BizgoOptionsBuilder, SMSBuilder, DestinationBuilder, OMNIRequestBodyBuilder } from '@bizgo/bizgo-sdk-comm-js';

// 1. SDK 초기화
const bizgo = new Bizgo(
  new BizgoOptionsBuilder()
    .setBaseURL('https://mars.ibapi.kr/api/comm')
    .setApiKey('your-api-key')
    .build()
);

// 2. SMS 발송
const sms = new SMSBuilder()
  .setFrom('0310000000')
  .setText('안녕하세요! 테스트 메시지입니다.')
  .build();

const destination = new DestinationBuilder()
  .setTo('01012345678')
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ sms }])
  .build();

const result = await bizgo.send?.OMNI(request);
console.log('발송 결과:', result);
```

---

## 📦 설치

### NPM 설치 (권장)
```bash
npm install @bizgo/bizgo-sdk-comm-js
```

### 로컬 설치
```bash
# 1. SDK 다운로드 및 빌드
cd /path/to/bizgo-sdk-comm-js
npm install
npm run build

# 2. 프로젝트에 링크
npm install /path/to/bizgo-sdk-comm-js
```

---


## 🔐 인증

### API Key 방식 (권장)
```javascript
const { Bizgo, BizgoOptionsBuilder } = require('@bizgo/bizgo-sdk-comm-js');

const bizgo = new Bizgo(
  new BizgoOptionsBuilder()
    .setBaseURL('https://mars.ibapi.kr/api/comm')
    .setApiKey('mars_ak_your-api-key')
    .build()
);
```

### Token 방식
```javascript
// 1. 토큰 발급
const authBizgo = new Bizgo(
  new AuthOptionsBuilder()
    .setBaseURL('https://mars.ibapi.kr/api/comm')
    .setId('user-id')
    .setPassword('password')
    .build()
);

const tokenResponse = await authBizgo.auth?.getToken();

// 2. 토큰으로 SDK 초기화
const bizgo = new Bizgo(
  new BizgoOptionsBuilder()
    .setBaseURL('https://mars.ibapi.kr/api/comm')
    .setToken(tokenResponse.data.accessToken)
    .build()
);
```

---

## 📨 메시지 발송

### SMS 발송

**빌더 패턴**
```javascript
const { SMSBuilder, DestinationBuilder, OMNIRequestBodyBuilder } = require('@bizgo/bizgo-sdk-comm-js');

const sms = new SMSBuilder()
  .setFrom('0310000000')
  .setText('테스트 SMS 메시지입니다.')
  .build();

const destination = new DestinationBuilder()
  .setTo('01012345678')
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ sms }])
  .build();

const result = await bizgo.send?.OMNI(request);
```

**JSON 방식**
```javascript
const request = {
  destinations: [{ to: '01012345678' }],
  messageFlow: [{
    sms: {
      from: '0310000000',
      text: '테스트 SMS 메시지입니다.'
    }
  }]
};

const result = await bizgo.send?.OMNI(request);
```

### MMS 발송

```javascript
const { MMSBuilder } = require('@bizgo/bizgo-sdk-comm-js');

const mms = new MMSBuilder()
  .setFrom('0310000000')
  .setText('MMS 본문입니다.\n이미지를 포함할 수 있습니다.')
  .setTitle('MMS 제목')
  .setFileKey(['uploaded-file-key-1', 'uploaded-file-key-2'])
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ mms }])
  .build();

const result = await bizgo.send?.OMNI(request);
```

### 알림톡 발송

```javascript
const { AlimtalkBuilder } = require('@bizgo/bizgo-sdk-comm-js');

const alimtalk = new AlimtalkBuilder()
  .setSenderKey('your-sender-key')
  .setMsgType('AT')
  .setTemplateCode('your-template-code')
  .setText('[알림]\n주문이 완료되었습니다.')
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ alimtalk }])
  .build();

const result = await bizgo.send?.OMNI(request);
```

### RCS 발송

```javascript
const { RCSBuilder } = require('@bizgo/bizgo-sdk-comm-js');

const rcs = new RCSBuilder()
  .setFrom('0310000000')
  .setContent({
    standalone: {
      text: 'RCS 메시지 내용',
      title: 'RCS 제목'
    }
  })
  .setFormatId('format-id')
  .setBrandKey('brand-key')
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ rcs }])
  .build();

const result = await bizgo.send?.OMNI(request);
```

### 통합 메시지 (OMNI)

**Fallback 체인**: 알림톡 실패 시 자동으로 SMS 발송

```javascript
const alimtalk = new AlimtalkBuilder()
  .setSenderKey('your-sender-key')
  .setMsgType('AT')
  .setTemplateCode('template-code')
  .setText('[알림] 주문 완료')
  .build();

const sms = new SMSBuilder()
  .setFrom('0310000000')
  .setText('[알림] 주문 완료')
  .build();

// 1차: 알림톡 시도 → 2차: SMS Fallback
const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ alimtalk }, { sms }])
  .build();

const result = await bizgo.send?.OMNI(request);
```

**대량 발송** (최대 200명)
```javascript
const destinations = [
  new DestinationBuilder().setTo('01011111111').build(),
  new DestinationBuilder().setTo('01022222222').build(),
  new DestinationBuilder().setTo('01033333333').build(),
];

const request = new OMNIRequestBodyBuilder()
  .setDestinations(destinations)
  .setMessageFlow([{ sms }])
  .build();
```

**개인화 메시지** (치환 문구)
```javascript
const sms = new SMSBuilder()
  .setFrom('0310000000')
  .setText('#{고객명}님, 주문번호 #{주문번호}가 배송되었습니다.')
  .build();

const destination = new DestinationBuilder()
  .setTo('01012345678')
  .setReplaceWords({
    '#{고객명}': '홍길동',
    '#{주문번호}': 'ORD-12345'
  })
  .build();

const request = new OMNIRequestBodyBuilder()
  .setDestinations([destination])
  .setMessageFlow([{ sms }])
  .build();
```

---

## 📤 파일 업로드

MMS, RCS, 카카오 메시지에 사용할 이미지를 업로드합니다.

### Node.js
```javascript
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file', fs.createReadStream('./image.jpg'));

const result = await bizgo.file?.uploadFile(
  { serviceType: 'MMS' },
  formData
);

console.log('파일 키:', result.data.fileKey);
```

### Next.js (API Route)
```javascript
// app/api/upload/route.js
import { Bizgo, BizgoOptionsBuilder } from '@bizgo/bizgo-sdk-comm-js';

export async function POST(request) {
  const formData = await request.formData();
  
  const bizgo = new Bizgo(
    new BizgoOptionsBuilder()
      .setBaseURL(process.env.BIZGO_BASE_URL)
      .setApiKey(process.env.BIZGO_API_KEY)
      .build()
  );
  
  const result = await bizgo.file?.uploadFile(
    { serviceType: 'MMS' },
    formData
  );
  
  return Response.json(result);
}
```

---


## 📊 리포트 조회

### Polling 방식
```javascript
// 리포트 조회
const reports = await bizgo.polling?.getReport();
console.log('리포트:', reports);

// 리포트 확인 (삭제)
await bizgo.polling?.deleteReport('report-id');
```

### Webhook 방식
```javascript
// Webhook 수신 처리 (Express 예시)
app.post('/webhook', (req, res) => {
  const report = req.body;
  console.log('발송 결과:', report);
  
  // 처리 로직...
  
  res.status(200).send('OK');
});
```


## 📊 통계 조회 (Statistics)

메시지 발송 통계를 조회하는 API입니다.

### Node.js

```javascript
const { Bizgo, BizgoOptionsBuilder } = require('bizgo-sdk-comm-js');

async function getStatistics() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key') // API Key 또는 Bearer token
            .build();

        const bizgo = new Bizgo(option);

        // 통계 조회
        const result = await bizgo.statistics.getStatistics({
            startDate: '20251101',
            endDate: '20251110',
            serviceType: 'SMS', // 선택사항: SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE
            groupKey: 'your-group-key' // 선택사항
        });

        console.log('통계 조회 결과:', result);
        console.log('통계 데이터:', result.data.data.statistics);

    } catch (error) {
        console.error('Error:', error);
    }
}

getStatistics();
```

### Next.js

```javascript
import { NextResponse } from 'next/server';
import { Bizgo, BizgoOptionsBuilder } from 'bizgo-sdk-comm-js';

export async function GET() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key') // API Key 또는 Bearer token
            .build();

        const bizgo = new Bizgo(option);

        const result = await bizgo.statistics?.getStatistics({
            startDate: '20251101',
            endDate: '20251110',
            serviceType: 'SMS'
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
    }
}
```

### 응답 예제

```json
{
   "common": {
      "authCode": "A000",
      "authResult": "Success",
      "infobankTrId": "tr-id-12345"
   },
   "data": {
      "code": "A000",
      "result": "Success",
      "data": {
         "statistics": [
            {
                "statDate": "20251101",
                "recvTotalCnt": 131,
                "recvSuccCnt": 124,
                "recvFailCnt": 7,
                "reportTotalCnt": 124,
                "reportSuccCnt": 71,
                "reportFailCnt": 53
            },
            {
                "statDate": "20251102",
                "recvTotalCnt": 120,
                "recvSuccCnt": 115,
                "recvFailCnt": 5,
                "reportTotalCnt": 115,
                "reportSuccCnt": 70,
                "reportFailCnt": 45
            }
         ]
      }
   }
}
```

### 요청 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| startDate | String | ✅ | 시작날짜 (YYYYMMDD) |
| endDate | String | - | 종료날짜 (YYYYMMDD) |
| serviceType | String | - | 서비스 타입 (SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE) |
| groupKey | String | - | 그룹 키 |

### 응답 데이터

| 이름 | 타입 | 설명 |
|------|------|------|
| statDate | String | 집계 날짜 (YYYYMMDD) |
| recvTotalCnt | Integer | 접수 전체건수 |
| recvSuccCnt | Integer | 접수 성공 건수 |
| recvFailCnt | Integer | 접수 실패 건수 |
| reportTotalCnt | Integer | 리포트 전체 건수 |
| reportSuccCnt | Integer | 리포트 성공 건수 |
| reportFailCnt | Integer | 리포트 실패 건수 |

---

## 📜 발송 이력 조회 (Send History)

메시지 발송 이력을 조회하는 API입니다. 발송된 메시지의 상세 정보를 확인할 수 있습니다.

### Node.js

```javascript
const { Bizgo, BizgoOptionsBuilder } = require('bizgo-sdk-comm-js');

async function getSendHistory() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key') // API Key 또는 Bearer token
            .build();

        const bizgo = new Bizgo(option);

        // 발송 이력 조회
        const result = await bizgo.sendHistory.getSendHistory({
            startDate: '20251101',
            endDate: '20251110',
            pageNo: 1,           // 선택사항: 페이지 번호 (기본값: 1)
            pageSize: 10,        // 선택사항: 페이지 크기 (기본값: 10, 최대: 100)
            serviceType: 'SMS',  // 선택사항: SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE
            groupKey: 'your-group-key' // 선택사항
        });

        console.log('발송 이력 조회 결과:', result);
        console.log('발송 이력 데이터:', result.data.data.sendHistory);
        console.log('전체 건수:', result.data.data.totalCount);
        console.log('전체 페이지:', result.data.data.totalPages);

    } catch (error) {
        console.error('Error:', error);
    }
}

getSendHistory();
```

### Next.js

```javascript
import { NextResponse } from 'next/server';
import { Bizgo, BizgoOptionsBuilder } from 'bizgo-sdk-comm-js';

export async function GET() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key') // API Key 또는 Bearer token
            .build();

        const bizgo = new Bizgo(option);

        const result = await bizgo.sendHistory?.getSendHistory({
            startDate: '20251101',
            endDate: '20251110',
            pageNo: 1,
            pageSize: 20,
            serviceType: 'SMS'
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
    }
}
```

### 응답 예제

```json
{
   "common": {
      "authCode": "A000",
      "authResult": "Success",
      "infobankTrId": "tr-id-12345"
   },
   "data": {
      "code": "A000",
      "result": "Success",
      "data": {
         "sendHistory": [
            {
                "msgId": "msg-2024110101001",
                "sendDate": "20251101",
                "sendTime": "10:30:45",
                "receiver": "01012345678",
                "sender": "0310000000",
                "serviceType": "SMS",
                "content": "테스트 메시지입니다.",
                "status": "SUCCESS",
                "reportStatus": "DELIVERED",
                "groupKey": "group-001"
            },
            {
                "msgId": "msg-2024110101002",
                "sendDate": "20251101",
                "sendTime": "10:31:20",
                "receiver": "01087654321",
                "sender": "0310000000",
                "serviceType": "SMS",
                "title": "알림",
                "content": "중요한 알림입니다.",
                "status": "FAILED",
                "reportStatus": "FAILED",
                "errorCode": "E001",
                "errorMsg": "Invalid phone number",
                "groupKey": "group-001"
            }
         ],
         "pageNo": 1,
         "pageSize": 10,
         "totalCount": 245,
         "totalPages": 25
      }
   }
}
```

### 요청 파라미터

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| startDate | String | ✅ | 시작날짜 (YYYYMMDD) |
| endDate | String | - | 종료날짜 (YYYYMMDD) |
| pageNo | Number | - | 페이지 번호 (기본값: 1) |
| pageSize | Number | - | 페이지 크기 (기본값: 10, 최대: 100) |
| msgId | String | - | 메시지 ID |
| serviceType | String | - | 서비스 타입 (SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE) |
| groupKey | String | - | 그룹 키 |

### 응답 데이터

#### 발송 이력 데이터 (sendHistory)

| 이름 | 타입 | 설명 |
|------|------|------|
| msgId | String | 메시지 ID |
| sendDate | String | 발송 날짜 (YYYYMMDD) |
| sendTime | String | 발송 시간 (HH:mm:ss) |
| receiver | String | 수신자 번호 |
| sender | String | 발신자 번호 |
| serviceType | String | 서비스 타입 |
| title | String | 메시지 제목 (선택) |
| content | String | 메시지 내용 |
| status | String | 발송 상태 (PENDING, SUCCESS, FAILED, CANCELLED) |
| reportStatus | String | 리포트 상태 (DELIVERED, FAILED, PENDING 등) |
| errorCode | String | 에러 코드 (발송 실패 시) |
| errorMsg | String | 에러 메시지 |
| groupKey | String | 그룹 키 |
| requestId | String | 요청 ID |

#### 페이징 정보

| 이름 | 타입 | 설명 |
|------|------|------|
| pageNo | Number | 현재 페이지 번호 |
| pageSize | Number | 페이지 크기 |
| totalCount | Number | 전체 건수 |
| totalPages | Number | 전체 페이지 수 |

---

## 🔍 메시지 상태 조회 (Message Status Inquiry)

메시지의 전송 상태(접수 성공/실패, 전송 중, 전송 완료, 결과 처리 완료 등)를 포함한 트래킹 정보를 조회하는 API입니다.

### 단건 조회 (메시지 키로 조회)

#### Node.js

```javascript
const { Bizgo, BizgoOptionsBuilder } = require('bizgo-sdk-comm-js');

async function getMessageStatusByMsgKey() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key') // API Key 또는 Bearer token
            .build();

        const bizgo = new Bizgo(option);

        // 단건 메시지 상태 조회
        const result = await bizgo.messageStatus.getMessageStatusByMsgKey('msgKey123');

        console.log('메시지 상태 조회 결과:', result);
        console.log('메시지 정보:', result.data.data.messages[0]);

    } catch (error) {
        console.error('Error:', error);
    }
}

getMessageStatusByMsgKey();
```

#### Next.js

```javascript
import { NextResponse } from 'next/server';
import { Bizgo, BizgoOptionsBuilder } from 'bizgo-sdk-comm-js';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const msgKey = searchParams.get('msgKey');

        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key')
            .build();

        const bizgo = new Bizgo(option);

        const result = await bizgo.messageStatus?.getMessageStatusByMsgKey(msgKey);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
    }
}
```

### 여러 건 조회 (요청 ID로 동보 전체 조회)

#### Node.js

```javascript
const { Bizgo, BizgoOptionsBuilder } = require('bizgo-sdk-comm-js');

async function getMessageStatusByRequestId() {
    try {
        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key')
            .build();

        const bizgo = new Bizgo(option);

        // 여러 건 메시지 상태 조회 (요청 ID로 동보 전체 조회)
        // requestId는 msgKey의 마지막 3자리를 제외한 문자열
        const result = await bizgo.messageStatus.getMessageStatusByRequestId('requestId123');

        console.log('메시지 상태 조회 결과:', result);
        console.log('메시지 목록:', result.data.data.messages);
        console.log('조회된 메시지 건수:', result.data.data.messages.length);

    } catch (error) {
        console.error('Error:', error);
    }
}

getMessageStatusByRequestId();
```

#### Next.js

```javascript
import { NextResponse } from 'next/server';
import { Bizgo, BizgoOptionsBuilder } from 'bizgo-sdk-comm-js';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const requestId = searchParams.get('requestId');

        const option = new BizgoOptionsBuilder()
            .setBaseURL('https://mars.ibapi.kr/api/comm')
            .setToken('your-api-key')
            .build();

        const bizgo = new Bizgo(option);

        const result = await bizgo.messageStatus?.getMessageStatusByRequestId(requestId);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'API 호출 실패' }, { status: 500 });
    }
}
```

### 응답 예제 (단건 조회)

```json
{
   "common": {
      "authCode": "A000",
      "authResult": "Success",
      "infobankTrId": "tr-id-12345"
   },
   "data": {
      "code": "A000",
      "result": "Success",
      "data": {
         "messages": [
            {
                "msgKey": "msgKey123",
                "serviceType": "RCS",
                "msgType": "RS",
                "to": "01000000000",
                "fallback": "Y",
                "responseCode": "A000",
                "responseText": "요청 성공",
                "requestTime": "2025-11-13T14:18:18+09:00",
                "sendTime": "2025-11-13T14:18:18+09:00",
                "reportTime": "2025-11-13T14:18:18+09:00",
                "reportType": "0",
                "reportCode": "54003",
                "reportText": "단말기기로 RCS 메시지를 전송할 수 없습니다.",
                "carrier": "20003"
            },
            {
                "msgKey": "msgKey123",
                "serviceType": "SMS",
                "msgType": "SM",
                "to": "01000000000",
                "fallback": "Y",
                "responseCode": "A000",
                "responseText": "요청 성공",
                "requestTime": "2025-11-13T14:18:18+09:00",
                "sendTime": "2025-11-13T14:18:19+09:00",
                "reportTime": "2025-11-13T14:18:20+09:00",
                "reportType": "0",
                "reportCode": "10000",
                "reportText": "성공",
                "carrier": "10003"
            }
         ]
      }
   }
}
```

### 메시지 상태 데이터 필드

| 이름 | 타입 | 설명 |
|------|------|------|
| msgKey | String | 메시지 키 |
| serviceType | String | 서비스 타입 (SMS, MMS, RCS, ALIMTALK, BRANDMESSAGE) |
| msgType | String | 메시지 타입 |
| to | String | 수신번호 |
| fallback | String | 대체발송 여부 (Y/N) |
| responseCode | String | 접수 코드 |
| responseText | String | 접수 실패 사유 |
| requestTime | String | 접수 시간 (ISO 8601) |
| sendTime | String | 발송 시간 (ISO 8601) |
| reportTime | String | 리포트 시간 (ISO 8601) |
| reportType | String | 리포트 종류 |
| reportCode | String | 리포트 코드 |
| reportText | String | 리포트 실패 사유 |
| carrier | String | 통신사 코드 (선택) |
| ref | String | 참조 필드 (선택) |
| userType | String | 사용자 타입 (선택) |

### 메서드

| 메서드 | 파라미터 | 설명 |
|--------|---------|------|
| getMessageStatusByMsgKey | msgKey: string | 메시지 키로 단건 조회 |
| getMessageStatusByRequestId | requestId: string | 요청 ID로 여러 건 조회 (동보 전체 조회) |

**요청 ID 가져오는 방법:**
- msgKey의 마지막 3자리를 제외한 문자열
- 예시: msgKey가 "requestId000"이면 requestId는 "requestId"

---
## 📞 문의

기술 지원 및 문의사항은 아래로 연락 주세요.

- **Email**: support@infobank.net
- **문서**: https://infobank-guide.gitbook.io/omni_api

---


---

## 📄 라이선스

---

**버전**: v1.0.3  









