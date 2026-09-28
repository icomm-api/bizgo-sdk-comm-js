// Generated from spec/openapi.yaml by scripts/generate.mjs. Do not edit.
//
// Resource classes nested per x-sdk-resource. Every method validates its params and body against the spec,
// then calls the transport with the operation metadata from ./operations.ts.

import { callOperation, iterateOperation } from '../operation.js';
import type { Transport } from '../transport.js';
import { OPERATIONS } from './operations.js';
import type {
  AlimtalkTemplate,
  AlimtalkTemplateCategoryResult,
  AlimtalkTemplateImageUploadRequest,
  AlimtalkTemplateImageUploadResult,
  AlimtalkTemplateInspectionCancelRequest,
  AlimtalkTemplateInspectionFileRequest,
  AlimtalkTemplateInspectionRequest,
  AlimtalkTemplateItemHighlightImageUploadRequest,
  AlimtalkTemplatePublic,
  AlimtalkTemplateSaveRequest,
  BrandMessageAudienceEstimateResult,
  BrandMessageAudienceFriendCountResult,
  BrandMessageAudiencePossibleByPhoneNumbersRequest,
  BrandMessageAudiencePossibleResult,
  BrandMessageCarouselCommerceFileUploadRequest,
  BrandMessageCarouselFeedFileUploadRequest,
  BrandMessageCatalogFileUploadRequest,
  BrandMessageCatalogOddFirstFileUploadRequest,
  BrandMessageDefaultFileUploadRequest,
  BrandMessageFileUploadResult,
  BrandMessageFriendGroupFileUploadRequest,
  BrandMessageFriendGroupFileUploadResult,
  BrandMessageFriendGroupListResult,
  BrandMessageFriendGroupPhoneNumberRequest,
  BrandMessageFriendGroupPhoneNumberRequestListResult,
  BrandMessageFriendGroupPhoneNumberRequestResult,
  BrandMessageFriendGroupProcessingResult,
  BrandMessageFriendGroupRequest,
  BrandMessageFriendGroupResult,
  BrandMessageGroupSendControlRequest,
  BrandMessageGroupSendCreateRequest,
  BrandMessageGroupSendResult,
  BrandMessageGroupTagListResult,
  BrandMessageGroupTagRequest,
  BrandMessageMarketingAgreeResult,
  BrandMessageMarketingAgreeUploadRequest,
  BrandMessagePermissionApplyRequest,
  BrandMessageTemplateListResult,
  BrandMessageTemplateRequest,
  BrandMessageTemplateResult,
  BrandMessageTemplateSummary,
  BrandMessageUnsubscribeContentRequest,
  BrandMessageVideoInfoResult,
  BrandMessageVideoListEntry,
  BrandMessageVideoListResult,
  BrandMessageVideoRegisterRequest,
  BrandMessageVideoUploadRegisterRequest,
  BrandMessageVideoUploadRegisterResult,
  BrandMessageWideFileUploadRequest,
  BrandMessageWideItemListFileUploadRequest,
  BrandMessageWideItemListFirstFileUploadRequest,
  CounselCertStatusResult,
  CounselConsultTimeResult,
  CounselConsultTimeSaveRequest,
  CounselEndRequest,
  CounselEndResult,
  CounselEndWithBotRequest,
  CounselFileUploadRequest,
  CounselFileUploadResult,
  CounselImageUploadRequest,
  CounselImageUploadResult,
  CounselMessageDeleteRequest,
  CounselPlainMessageRequest,
  CounselRichMessageRequest,
  CounselSendServiceResult,
  CounselSenderActivationRequest,
  CounselSenderRequest,
  CounselSessionResult,
  CounselSystemMessageCreateRequest,
  CounselSystemMessageCreateResult,
  CounselSystemMessageListResult,
  CounselUserBlockRequest,
  InsightKakaoHourlyStatisticsResult,
  InsightKakaoStatisticsResult,
  InsightKakaoTemplateStatisticsResult,
  InsightRcsBrandProfileStatResult,
  InsightRcsMessageButtonStatResult,
  InsightRcsMessageStatResult,
  InsightRcsPersistentMenuStatResult,
  KakaoCategory,
  KakaoGroup,
  KakaoGroupSenderAddRequest,
  KakaoSanction,
  KakaoSenderAccountServiceResult,
  KakaoSenderChannel,
  KakaoSenderCreateRequest,
  KakaoSenderListServiceResult,
  KakaoSenderProfile,
  KakaoSenderRecoverRequest,
  KakaoSenderTokenRequest,
  RcsBrandResult,
  RcsBrandUpdateRequest,
  RcsChatbot,
  RcsChatbotResult,
  RcsChatbotUpdateRequest,
  RcsMessagebaseCommonListResult,
  RcsMessagebaseFormDetailResult,
  RcsMessagebaseFormListResult,
  RcsMessagebaseFormSummary,
  RcsTemplateFormLogoListResult,
  RcsTemplateIdResult,
  RcsTemplateImageResult,
  RcsTemplateImageUploadRequest,
  RcsTemplateListResult,
  RcsTemplateRequest,
  RcsTemplateResult,
  Reservation,
  ReservationCreateRequest,
  ReservationCreateServiceResult,
  ReservationListResult,
  ReservationRecipient,
  ReservationRecipientCreateRequest,
  ReservationRecipientListResult,
  ReservationUpdateRequest,
  SendOmniResult,
} from './types.js';

/** Parameters of `files.uploadBrandMessageDefault` (`uploadBrandMessageDefaultImage`). */
export interface UploadBrandMessageDefaultImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageDefaultFileUploadRequest;
}

/** Result of `files.uploadBrandMessageDefault` (`uploadBrandMessageDefaultImage`). */
export type UploadBrandMessageDefaultImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageWide` (`uploadBrandMessageWideImage`). */
export interface UploadBrandMessageWideImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageWideFileUploadRequest;
}

/** Result of `files.uploadBrandMessageWide` (`uploadBrandMessageWideImage`). */
export type UploadBrandMessageWideImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageWideItemListFirst` (`uploadBrandMessageWideItemListFirstImage`). */
export interface UploadBrandMessageWideItemListFirstImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageWideItemListFirstFileUploadRequest;
}

/** Result of `files.uploadBrandMessageWideItemListFirst` (`uploadBrandMessageWideItemListFirstImage`). */
export type UploadBrandMessageWideItemListFirstImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageWideItemList` (`uploadBrandMessageWideItemListImage`). */
export interface UploadBrandMessageWideItemListImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageWideItemListFileUploadRequest;
}

/** Result of `files.uploadBrandMessageWideItemList` (`uploadBrandMessageWideItemListImage`). */
export type UploadBrandMessageWideItemListImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageCarouselFeed` (`uploadBrandMessageCarouselFeedImage`). */
export interface UploadBrandMessageCarouselFeedImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageCarouselFeedFileUploadRequest;
}

/** Result of `files.uploadBrandMessageCarouselFeed` (`uploadBrandMessageCarouselFeedImage`). */
export type UploadBrandMessageCarouselFeedImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageCarouselCommerce` (`uploadBrandMessageCarouselCommerceImage`). */
export interface UploadBrandMessageCarouselCommerceImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageCarouselCommerceFileUploadRequest;
}

/** Result of `files.uploadBrandMessageCarouselCommerce` (`uploadBrandMessageCarouselCommerceImage`). */
export type UploadBrandMessageCarouselCommerceImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadAlimtalkTemplateImage` (`uploadAlimtalkTemplateImage`). */
export interface UploadAlimtalkTemplateImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: AlimtalkTemplateImageUploadRequest;
}

/** Result of `files.uploadAlimtalkTemplateImage` (`uploadAlimtalkTemplateImage`). */
export type UploadAlimtalkTemplateImageResult = AlimtalkTemplateImageUploadResult;

/** Parameters of `files.uploadAlimtalkItemHighlightImage` (`uploadAlimtalkItemHighlightImage`). */
export interface UploadAlimtalkItemHighlightImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: AlimtalkTemplateItemHighlightImageUploadRequest;
}

/** Result of `files.uploadAlimtalkItemHighlightImage` (`uploadAlimtalkItemHighlightImage`). */
export type UploadAlimtalkItemHighlightImageResult = AlimtalkTemplateImageUploadResult;

/** Parameters of `files.uploadBrandMessageCatalog` (`uploadBrandMessageCatalogImage`). */
export interface UploadBrandMessageCatalogImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageCatalogFileUploadRequest;
}

/** Result of `files.uploadBrandMessageCatalog` (`uploadBrandMessageCatalogImage`). */
export type UploadBrandMessageCatalogImageResult = BrandMessageFileUploadResult;

/** Parameters of `files.uploadBrandMessageCatalogOddFirst` (`uploadBrandMessageCatalogOddFirstImage`). */
export interface UploadBrandMessageCatalogOddFirstImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageCatalogOddFirstFileUploadRequest;
}

/** Result of `files.uploadBrandMessageCatalogOddFirst` (`uploadBrandMessageCatalogOddFirstImage`). */
export type UploadBrandMessageCatalogOddFirstImageResult = BrandMessageFileUploadResult;

/** Parameters of `reservations.create` (`createReservation`). */
export interface CreateReservationParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: ReservationCreateRequest;
}

/** Result of `reservations.create` (`createReservation`). */
export type CreateReservationResult = ReservationCreateServiceResult;

/** Parameters of `reservations.list` (`listReservations`). */
export interface ListReservationsParams {
  /**
   * 조회 기준 예약 발송 시각입니다. `yyyy-MM-dd HH:mm:ss` 형식만 쓸 수 있습니다.
   * 형식 yyyy-MM-dd HH:mm:ss
   */
  resvSendTime: string;
  /**
   * 정산 코드로 조회 대상을 거릅니다.
   */
  paymentCode?: string;
  /**
   * 다음 페이지를 조회할 때 쓰는 마지막 순번입니다. 이전 응답의 `data.data.lastSeq`를 넣습니다.
   */
  lastSeq?: number;
  /**
   * 조회 건수입니다.
   */
  limit?: number;
}

/** Result of `reservations.list` (`listReservations`). */
export type ListReservationsResult = ReservationListResult;

/** One item yielded by `reservations.iterList`. */
export type ListReservationsItem = Reservation;

/** Parameters of `reservations.get` (`getReservation`). */
export interface GetReservationParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
}

/** Result of `reservations.get` (`getReservation`). */
export type GetReservationResult = Reservation;

/** Parameters of `reservations.update` (`updateReservation`). */
export interface UpdateReservationParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: ReservationUpdateRequest;
}

/** Result of `reservations.update` (`updateReservation`). */
export type UpdateReservationResult = Reservation;

/** Parameters of `reservations.cancel` (`cancelReservation`). */
export interface CancelReservationParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
}

/** Result of `reservations.cancel` (`cancelReservation`). */
export type CancelReservationResult = Reservation;

/** Parameters of `reservations.pause` (`stopReservation`). */
export interface StopReservationParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
}

/** Result of `reservations.pause` (`stopReservation`). */
export type StopReservationResult = Reservation;

/** Parameters of `reservations.resume` (`resumeReservation`). */
export interface ResumeReservationParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
}

/** Result of `reservations.resume` (`resumeReservation`). */
export type ResumeReservationResult = Reservation;

/** Parameters of `reservations.recipients.list` (`listReservationRecipients`). */
export interface ListReservationRecipientsParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
  /**
   * 다음 페이지를 조회할 때 쓰는 마지막 순번입니다. 이전 응답의 `data.data.lastSeq`를 넣습니다.
   */
  lastSeq?: number;
  /**
   * 조회 건수입니다.
   */
  limit?: number;
}

/** Result of `reservations.recipients.list` (`listReservationRecipients`). */
export type ListReservationRecipientsResult = ReservationRecipientListResult;

/** One item yielded by `reservations.recipients.iterList`. */
export type ListReservationRecipientsItem = ReservationRecipient;

/** Parameters of `reservations.recipients.create` (`addReservationRecipients`). */
export interface AddReservationRecipientsParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: ReservationRecipientCreateRequest;
}

/** Result of `reservations.recipients.create` (`addReservationRecipients`). */
export type AddReservationRecipientsResult = SendOmniResult;

/** Parameters of `reservations.recipients.delete` (`deleteReservationRecipient`). */
export interface DeleteReservationRecipientParams {
  /**
   * 예약 발송 키입니다. 예약 발송 등록 응답의 `data.resvKey` 값입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  resvKey: string;
  /**
   * 조회할 메시지 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  msgKey: string;
}

/** Parameters of `insights.alimtalk.get` (`getAlimtalkInsight`). */
export interface GetAlimtalkInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.alimtalk.get` (`getAlimtalkInsight`). */
export type GetAlimtalkInsightResult = InsightKakaoStatisticsResult;

/** Parameters of `insights.alimtalk.getHourly` (`getAlimtalkHourlyInsight`). */
export interface GetAlimtalkHourlyInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.alimtalk.getHourly` (`getAlimtalkHourlyInsight`). */
export type GetAlimtalkHourlyInsightResult = InsightKakaoHourlyStatisticsResult;

/** Parameters of `insights.alimtalk.getByTemplate` (`getAlimtalkTemplateInsight`). */
export interface GetAlimtalkTemplateInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.alimtalk.getByTemplate` (`getAlimtalkTemplateInsight`). */
export type GetAlimtalkTemplateInsightResult = InsightKakaoTemplateStatisticsResult;

/** Parameters of `insights.brandMessage.get` (`getBrandMessageInsight`). */
export interface GetBrandMessageInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.brandMessage.get` (`getBrandMessageInsight`). */
export type GetBrandMessageInsightResult = InsightKakaoStatisticsResult;

/** Parameters of `insights.brandMessage.getHourly` (`getBrandMessageHourlyInsight`). */
export interface GetBrandMessageHourlyInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.brandMessage.getHourly` (`getBrandMessageHourlyInsight`). */
export type GetBrandMessageHourlyInsightResult = InsightKakaoHourlyStatisticsResult;

/** Parameters of `insights.brandMessage.getByTemplate` (`getBrandMessageTemplateInsight`). */
export interface GetBrandMessageTemplateInsightParams {
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 발신프로필 키입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다.
   */
  senderKey: string | readonly string[];
  /**
   * 템플릿 코드입니다. 여러 개를 조회하려면 콤마(,)로 구분해 전달합니다. 넣지 않으면 전체를 조회합니다.
   */
  templateCode?: string | readonly string[];
}

/** Result of `insights.brandMessage.getByTemplate` (`getBrandMessageTemplateInsight`). */
export type GetBrandMessageTemplateInsightResult = InsightKakaoTemplateStatisticsResult;

/** Parameters of `insights.rcs.getMessage` (`getRcsMessageInsight`). */
export interface GetRcsMessageInsightParams {
  /**
   * RCS 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 그룹 ID입니다. RCS 발송 요청에 넣은 `messageFlow[].rcs.groupId` 값이어야 합니다.
   * 발송 시 `groupId`를 넣지 않은 건은 집계되지 않습니다.
   */
  groupId: string;
  /**
   * 챗봇 ID입니다. 지정하면 해당 챗봇으로 범위를 좁힙니다.
   */
  chatbotId?: string;
}

/** Result of `insights.rcs.getMessage` (`getRcsMessageInsight`). */
export type GetRcsMessageInsightResult = InsightRcsMessageStatResult;

/** Parameters of `insights.rcs.getMessageButton` (`getRcsMessageButtonInsight`). */
export interface GetRcsMessageButtonInsightParams {
  /**
   * RCS 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 그룹 ID입니다. RCS 발송 요청에 넣은 `messageFlow[].rcs.groupId` 값이어야 합니다.
   * 발송 시 `groupId`를 넣지 않은 건은 집계되지 않습니다.
   */
  groupId: string;
  /**
   * 챗봇 ID입니다. 지정하면 해당 챗봇으로 범위를 좁힙니다.
   */
  chatbotId?: string;
}

/** Result of `insights.rcs.getMessageButton` (`getRcsMessageButtonInsight`). */
export type GetRcsMessageButtonInsightResult = InsightRcsMessageButtonStatResult;

/** Parameters of `insights.rcs.getPersistentMenu` (`getRcsPersistentMenuInsight`). */
export interface GetRcsPersistentMenuInsightParams {
  /**
   * RCS 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
  /**
   * 챗봇 ID입니다. 넣지 않으면 요청이 거절됩니다.
   */
  chatbotId: string;
}

/** Result of `insights.rcs.getPersistentMenu` (`getRcsPersistentMenuInsight`). */
export type GetRcsPersistentMenuInsightResult = InsightRcsPersistentMenuStatResult;

/** Parameters of `insights.rcs.getBrandProfile` (`getRcsBrandProfileInsight`). */
export interface GetRcsBrandProfileInsightParams {
  /**
   * RCS 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 조회 시작일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  startDate: string | Date;
  /**
   * 조회 종료일(YYYYMMDD)입니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  endDate: string | Date;
}

/** Result of `insights.rcs.getBrandProfile` (`getRcsBrandProfileInsight`). */
export type GetRcsBrandProfileInsightResult = InsightRcsBrandProfileStatResult;

/** Parameters of `kakao.senders.requestToken` (`requestKakaoSenderToken`). */
export interface RequestKakaoSenderTokenParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: KakaoSenderTokenRequest;
}

/** Result of `kakao.senders.requestToken` (`requestKakaoSenderToken`). */
export type RequestKakaoSenderTokenResult = KakaoSenderAccountServiceResult;

/** Parameters of `kakao.senders.find` (`findKakaoSender`). */
export interface FindKakaoSenderParams {
  /**
   * 조회할 카카오톡 채널의 uuid(`@`로 시작하는 채널 아이디)입니다. `senderKey`가 없으면 필수입니다.
   */
  uuid?: string;
  /**
   * 조회할 발신프로필 키입니다. `uuid`가 없으면 필수입니다.
   */
  senderKey?: string;
}

/** Result of `kakao.senders.find` (`findKakaoSender`). */
export type FindKakaoSenderResult = KakaoSenderProfile;

/** Parameters of `kakao.senders.create` (`createKakaoSender`). */
export interface CreateKakaoSenderParams {
  /**
   * 카카오 채널 인증 토큰 요청 후 카카오톡으로 받은 채널 인증 토큰 값입니다.
   * 요청 헤더로 보냅니다.
   */
  token: string;
  /**
   * 관리자 전화번호입니다. 카카오 채널 인증 토큰 요청 시 입력한 번호와 같아야 합니다.
   * 요청 헤더로 보냅니다.
   */
  phoneNumber: string;
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: KakaoSenderCreateRequest;
}

/** Result of `kakao.senders.create` (`createKakaoSender`). */
export type CreateKakaoSenderResult = KakaoSenderProfile;

/** Parameters of `kakao.senders.list` (`listKakaoSenderProfiles`). */
export interface ListKakaoSenderProfilesParams {
  /**
   * 검색 시작일입니다.
   */
  startDate?: string;
  /**
   * 검색 종료일입니다.
   */
  endDate?: string;
  /**
   * 발신프로필 키 또는 발신프로필 그룹키입니다.
   */
  senderKey?: string;
  /**
   * 페이지 번호입니다.
   */
  page?: number;
  /**
   * 페이지당 조회 건수입니다.
   */
  rows?: number;
}

/** Result of `kakao.senders.list` (`listKakaoSenderProfiles`). */
export type ListKakaoSenderProfilesResult = KakaoSenderListServiceResult;

/** One item yielded by `kakao.senders.iterList`. */
export type ListKakaoSenderProfilesItem = KakaoSenderChannel;

/** Parameters of `kakao.senders.get` (`getKakaoSender`). */
export interface GetKakaoSenderParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `kakao.senders.get` (`getKakaoSender`). */
export type GetKakaoSenderResult = KakaoSenderProfile;

/** Parameters of `kakao.senders.recover` (`recoverKakaoSender`). */
export interface RecoverKakaoSenderParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: KakaoSenderRecoverRequest;
}

/** Result of `kakao.categories.list` (`listKakaoSenderCategories`). */
export type ListKakaoSenderCategoriesResult = KakaoCategory[];

/** Parameters of `kakao.categories.get` (`getKakaoSenderCategory`). */
export interface GetKakaoSenderCategoryParams {
  /**
   * 조회할 카테고리 코드입니다.
   */
  code: string;
}

/** Result of `kakao.categories.get` (`getKakaoSenderCategory`). */
export type GetKakaoSenderCategoryResult = KakaoCategory;

/** Parameters of `kakao.groups.list` (`listKakaoGroups`). */
export interface ListKakaoGroupsParams {
  /**
   * 조회 기준 발신프로필 키입니다.
   */
  senderKey?: string;
}

/** Result of `kakao.groups.list` (`listKakaoGroups`). */
export type ListKakaoGroupsResult = KakaoGroup[];

/** Parameters of `kakao.groups.addSender` (`addKakaoGroupSender`). */
export interface AddKakaoGroupSenderParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: KakaoGroupSenderAddRequest;
}

/** Parameters of `kakao.groups.removeSender` (`removeKakaoGroupSender`). */
export interface RemoveKakaoGroupSenderParams {
  /**
   * 그룹 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  groupKey: string;
  /**
   * 삭제할 발신프로필 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
}

/** Parameters of `kakao.sanctions.getSender` (`getKakaoSenderSanction`). */
export interface GetKakaoSenderSanctionParams {
  /**
   * 조회 기준 날짜(YYYYMMDD)입니다. 예 `20260305`.
   * 형식 YYYYMMDD (Date는 KST 날짜로 변환)
   */
  date: string | Date;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `kakao.sanctions.getSender` (`getKakaoSenderSanction`). */
export type GetKakaoSenderSanctionResult = KakaoSanction;

/** Parameters of `kakao.sanctions.getGroupTemplateExclusion` (`getKakaoGroupTemplateSenderExclusion`). */
export interface GetKakaoGroupTemplateSenderExclusionParams {
  /**
   * 조회 기준 날짜(YYYYMMDD)입니다. 예 `20260305`.
   * 형식 YYYYMMDD (Date는 KST 날짜로 변환)
   */
  date: string | Date;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 그룹 발신프로필 키입니다.
   */
  groupKey: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode: string;
}

/** Result of `kakao.sanctions.getGroupTemplateExclusion` (`getKakaoGroupTemplateSenderExclusion`). */
export type GetKakaoGroupTemplateSenderExclusionResult = KakaoSanction;

/** Parameters of `kakao.sanctions.getTemplate` (`getKakaoTemplateSanction`). */
export interface GetKakaoTemplateSanctionParams {
  /**
   * 조회 기준 날짜(YYYYMMDD)입니다. 예 `20260305`.
   * 형식 YYYYMMDD (Date는 KST 날짜로 변환)
   */
  date: string | Date;
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode: string;
}

/** Result of `kakao.sanctions.getTemplate` (`getKakaoTemplateSanction`). */
export type GetKakaoTemplateSanctionResult = KakaoSanction;

/** Parameters of `alimtalk.templates.get` (`getAlimtalkTemplate`). */
export interface GetAlimtalkTemplateParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode: string;
}

/** Result of `alimtalk.templates.get` (`getAlimtalkTemplate`). */
export type GetAlimtalkTemplateResult = AlimtalkTemplate;

/** Parameters of `alimtalk.templates.create` (`createAlimtalkTemplate`). */
export interface CreateAlimtalkTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: AlimtalkTemplateSaveRequest;
}

/** Result of `alimtalk.templates.create` (`createAlimtalkTemplate`). */
export type CreateAlimtalkTemplateResult = AlimtalkTemplate;

/** Parameters of `alimtalk.templates.update` (`updateAlimtalkTemplate`). */
export interface UpdateAlimtalkTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: AlimtalkTemplateSaveRequest;
}

/** Result of `alimtalk.templates.update` (`updateAlimtalkTemplate`). */
export type UpdateAlimtalkTemplateResult = AlimtalkTemplate;

/** Parameters of `alimtalk.templates.list` (`listAlimtalkTemplates`). */
export interface ListAlimtalkTemplatesParams {
  /**
   * 발신프로필 키 또는 그룹키입니다.
   */
  senderKey: string;
  /**
   * 발신키 유형입니다(`S` 발신프로필, `G` 그룹).
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 템플릿 상태입니다.
   */
  status?: string;
  /**
   * 검수 상태입니다(`REG` 등록, `REQ` 검수 요청, `APR` 승인, `REJ` 반려).
   */
  inspectionStatus?: 'REG' | 'REQ' | 'APR' | 'REJ';
  /**
   * 템플릿 유형입니다.
   */
  templateType?: string;
  /**
   * 조회 시작 위치입니다. 문서 예시는 `0`입니다.
   */
  offset?: number;
  /**
   * 조회 건수입니다. 문서 예시는 `100`입니다.
   */
  limit?: number;
}

/** Result of `alimtalk.templates.list` (`listAlimtalkTemplates`). */
export type ListAlimtalkTemplatesResult = AlimtalkTemplate[];

/** One item yielded by `alimtalk.templates.iterList`. */
export type ListAlimtalkTemplatesItem = AlimtalkTemplate;

/** Parameters of `alimtalk.templates.listModified` (`listModifiedAlimtalkTemplates`). */
export interface ListModifiedAlimtalkTemplatesParams {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   */
  senderKey: string;
  /**
   * 발신키 유형입니다(`S` 발신프로필, `G` 그룹). 기본값은 `S`입니다.
   */
  senderKeyType?: 'G' | 'S';
  /**
   * 조회 시작 시각(yyyy-MM-dd'T'HH:mm:ss)입니다. 예 `2026-04-23T09:00:00`.
   * 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  since?: string;
  /**
   * 페이지 번호입니다. 기본값 1, 최소 1입니다.
   */
  page?: number;
  /**
   * 페이지당 조회 건수입니다. 기본값 100, 최소 1입니다.
   */
  count?: number;
}

/** Result of `alimtalk.templates.listModified` (`listModifiedAlimtalkTemplates`). */
export type ListModifiedAlimtalkTemplatesResult = AlimtalkTemplate[];

/** One item yielded by `alimtalk.templates.iterListModified`. */
export type ListModifiedAlimtalkTemplatesItem = AlimtalkTemplate;

/** Parameters of `alimtalk.templates.delete` (`deleteAlimtalkTemplate`). */
export interface DeleteAlimtalkTemplateParams {
  /**
   * 발신프로필 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
  /**
   * 삭제할 템플릿 코드입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  templateCode: string;
}

/** Parameters of `alimtalk.templates.requestInspection` (`requestAlimtalkTemplateInspection`). */
export interface RequestAlimtalkTemplateInspectionParams {
  /** 요청 본문. 파일 필드가 있으면 multipart/form-data, 없으면 JSON으로 보냅니다. */
  body: AlimtalkTemplateInspectionRequest | AlimtalkTemplateInspectionFileRequest;
}

/** Parameters of `alimtalk.templates.cancelInspection` (`cancelAlimtalkTemplateInspection`). */
export interface CancelAlimtalkTemplateInspectionParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: AlimtalkTemplateInspectionCancelRequest;
}

/** Parameters of `alimtalk.templateCategories.list` (`listAlimtalkTemplateCategories`). */
export interface ListAlimtalkTemplateCategoriesParams {
  /**
   * 조회할 템플릿 카테고리 코드입니다. 넣으면 상세 조회, 생략하면 전체 조회입니다(상세 조회 문서에서는 필수).
   */
  categoryCode?: string;
}

/** Result of `alimtalk.templateCategories.list` (`listAlimtalkTemplateCategories`). */
export type ListAlimtalkTemplateCategoriesResult = AlimtalkTemplateCategoryResult;

/** Parameters of `alimtalk.publicTemplates.list` (`listAlimtalkPublicTemplates`). */
export interface ListAlimtalkPublicTemplatesParams {
  /**
   * 조회 기준 시각(yyyyMMddHHmmss)입니다. 기본값은 `20250708000000`입니다.
   * 형식 yyyyMMddHHmmss
   */
  since?: string;
  /**
   * 조회 페이지 번호입니다. 기본값은 1입니다.
   */
  page?: number;
  /**
   * 페이지당 조회 건수입니다. 기본값 100, 최대 1,000입니다.
   */
  count?: number;
}

/** Result of `alimtalk.publicTemplates.list` (`listAlimtalkPublicTemplates`). */
export type ListAlimtalkPublicTemplatesResult = AlimtalkTemplatePublic[];

/** One item yielded by `alimtalk.publicTemplates.iterList`. */
export type ListAlimtalkPublicTemplatesItem = AlimtalkTemplatePublic;

/** Parameters of `brandMessage.groupSends.get` (`getBrandMessageGroupSend`). */
export interface GetBrandMessageGroupSendParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 동보 발송 요청 아이디입니다.
   */
  requestId: number;
}

/** Result of `brandMessage.groupSends.get` (`getBrandMessageGroupSend`). */
export type GetBrandMessageGroupSendResult = BrandMessageGroupSendResult;

/** Parameters of `brandMessage.groupSends.create` (`createBrandMessageGroupSend`). */
export interface CreateBrandMessageGroupSendParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupSendCreateRequest;
}

/** Result of `brandMessage.groupSends.create` (`createBrandMessageGroupSend`). */
export type CreateBrandMessageGroupSendResult = BrandMessageGroupSendResult;

/** Parameters of `brandMessage.groupSends.resume` (`resumeBrandMessageGroupSend`). */
export interface ResumeBrandMessageGroupSendParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupSendControlRequest;
}

/** Result of `brandMessage.groupSends.resume` (`resumeBrandMessageGroupSend`). */
export type ResumeBrandMessageGroupSendResult = BrandMessageGroupSendResult;

/** Parameters of `brandMessage.groupSends.pause` (`pauseBrandMessageGroupSend`). */
export interface PauseBrandMessageGroupSendParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupSendControlRequest;
}

/** Result of `brandMessage.groupSends.pause` (`pauseBrandMessageGroupSend`). */
export type PauseBrandMessageGroupSendResult = BrandMessageGroupSendResult;

/** Parameters of `brandMessage.groupSends.terminate` (`terminateBrandMessageGroupSend`). */
export interface TerminateBrandMessageGroupSendParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupSendControlRequest;
}

/** Result of `brandMessage.groupSends.terminate` (`terminateBrandMessageGroupSend`). */
export type TerminateBrandMessageGroupSendResult = BrandMessageGroupSendResult;

/** Parameters of `brandMessage.audience.checkPossible` (`checkBrandMessageAudiencePossible`). */
export interface CheckBrandMessageAudiencePossibleParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 브랜드메시지 타입입니다(카카오 원본 chatBubbleType으로 변환됩니다). 알려진 값: `FT`, `FI`, `FW`, `FL`, `FC`, `FM`, `FA`, `FP`, `FG`.
   */
  msgType: 'FT' | 'FI' | 'FW' | 'FL' | 'FC' | 'FM' | 'FA' | 'FP' | 'FG' | (string & {});
  /**
   * 대상 친구 그룹 키입니다. 생략하면 전체 친구를 기준으로 조회합니다.
   */
  friendGroupKey?: string;
}

/** Result of `brandMessage.audience.checkPossible` (`checkBrandMessageAudiencePossible`). */
export type CheckBrandMessageAudiencePossibleResult = BrandMessageAudiencePossibleResult;

/** Parameters of `brandMessage.audience.checkPossibleByPhoneNumbers` (`checkBrandMessageAudiencePossibleByPhoneNumbers`). */
export interface CheckBrandMessageAudiencePossibleByPhoneNumbersParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageAudiencePossibleByPhoneNumbersRequest;
}

/** Result of `brandMessage.audience.checkPossibleByPhoneNumbers` (`checkBrandMessageAudiencePossibleByPhoneNumbers`). */
export type CheckBrandMessageAudiencePossibleByPhoneNumbersResult = BrandMessageAudiencePossibleResult;

/** Parameters of `brandMessage.audience.getFriendCount` (`getBrandMessageFriendCount`). */
export interface GetBrandMessageFriendCountParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `brandMessage.audience.getFriendCount` (`getBrandMessageFriendCount`). */
export type GetBrandMessageFriendCountResult = BrandMessageAudienceFriendCountResult;

/** Parameters of `brandMessage.audience.estimate` (`estimateBrandMessageGroupSendDuration`). */
export interface EstimateBrandMessageGroupSendDurationParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 동보 발송 시작 일시(`yyyy-MM-dd'T'HH:mm:ss`, KST)입니다. 동보 발송 요청의 `sendStartAt`(`yyyy-MM-dd HH:mm:ss`)과 형식이 다릅니다.
   * 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  startTime: string;
  /**
   * 발송 모수입니다.
   */
  count: number;
  /**
   * 대상 유형입니다. 기본값은 `NONE`입니다.
   */
  target?: 'NONE' | 'FRIEND_GROUP';
}

/** Result of `brandMessage.audience.estimate` (`estimateBrandMessageGroupSendDuration`). */
export type EstimateBrandMessageGroupSendDurationResult = BrandMessageAudienceEstimateResult;

/** Parameters of `brandMessage.permissions.check` (`checkBrandMessageSendPermission`). */
export interface CheckBrandMessageSendPermissionParams {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   */
  senderKey: string;
}

/** Parameters of `brandMessage.permissions.apply` (`applyBrandMessageSendPermission`). */
export interface ApplyBrandMessageSendPermissionParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessagePermissionApplyRequest;
}

/** Parameters of `brandMessage.videos.registerUpload` (`registerBrandMessageVideoUpload`). */
export interface RegisterBrandMessageVideoUploadParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageVideoUploadRegisterRequest;
}

/** Result of `brandMessage.videos.registerUpload` (`registerBrandMessageVideoUpload`). */
export type RegisterBrandMessageVideoUploadResult = BrandMessageVideoUploadRegisterResult;

/** Parameters of `brandMessage.videos.registerExisting` (`registerBrandMessageExistingVideo`). */
export interface RegisterBrandMessageExistingVideoParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageVideoRegisterRequest;
}

/** Result of `brandMessage.videos.registerExisting` (`registerBrandMessageExistingVideo`). */
export type RegisterBrandMessageExistingVideoResult = BrandMessageVideoInfoResult;

/** Parameters of `brandMessage.videos.get` (`getBrandMessageVideo`). */
export interface GetBrandMessageVideoParams {
  /**
   * 조회할 동영상 식별자입니다.
   */
  vid: string;
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   */
  senderKey: string;
}

/** Result of `brandMessage.videos.get` (`getBrandMessageVideo`). */
export type GetBrandMessageVideoResult = BrandMessageVideoInfoResult;

/** Parameters of `brandMessage.videos.list` (`listBrandMessageVideos`). */
export interface ListBrandMessageVideosParams {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   */
  senderKey: string;
  /**
   * 조회할 등록일자(`yyyyMMdd`)입니다. 생략하면 전체를 조회합니다.
   * 형식 yyyyMMdd (Date는 KST 날짜로 변환)
   */
  date?: string | Date;
  /**
   * 조회 시작 위치입니다. 음수는 쓸 수 없습니다. 기본값은 0입니다.
   */
  offset?: number;
  /**
   * 조회 건수입니다. 기본값 100, 최대 1,000입니다.
   */
  limit?: number;
}

/** Result of `brandMessage.videos.list` (`listBrandMessageVideos`). */
export type ListBrandMessageVideosResult = BrandMessageVideoListResult;

/** One item yielded by `brandMessage.videos.iterList`. */
export type ListBrandMessageVideosItem = BrandMessageVideoListEntry;

/** Parameters of `brandMessage.templates.get` (`getBrandMessageTemplate`). */
export interface GetBrandMessageTemplateParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 템플릿 코드입니다.
   */
  templateCode: string;
  /**
   * 브랜드메시지 발송 타입입니다. `basic`(기본형) 또는 `free`(자유형)입니다.
   */
  sendType?: 'basic' | 'free';
}

/** Result of `brandMessage.templates.get` (`getBrandMessageTemplate`). */
export type GetBrandMessageTemplateResult = BrandMessageTemplateResult;

/** Parameters of `brandMessage.templates.create` (`createBrandMessageTemplate`). */
export interface CreateBrandMessageTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageTemplateRequest;
}

/** Result of `brandMessage.templates.create` (`createBrandMessageTemplate`). */
export type CreateBrandMessageTemplateResult = BrandMessageTemplateResult;

/** Parameters of `brandMessage.templates.update` (`updateBrandMessageTemplate`). */
export interface UpdateBrandMessageTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageTemplateRequest;
}

/** Result of `brandMessage.templates.update` (`updateBrandMessageTemplate`). */
export type UpdateBrandMessageTemplateResult = BrandMessageTemplateResult;

/** Parameters of `brandMessage.templates.list` (`listBrandMessageTemplates`). */
export interface ListBrandMessageTemplatesParams {
  /**
   * 발신프로필 키 또는 그룹키입니다.
   */
  senderKey: string;
  /**
   * 발신키 유형입니다. 문서 예시 값은 `S`(발신프로필)입니다. 기본값은 `S`입니다.
   */
  senderKeyType?: string;
  /**
   * 템플릿 상태입니다. 알려진 값: `A`(등록), `S`(차단).
   */
  status?: 'A' | 'S' | (string & {});
  /**
   * 템플릿 유형입니다.
   */
  templateType?: string;
  /**
   * 조회 시작 위치입니다.
   */
  offset?: number;
  /**
   * 조회 건수입니다.
   */
  limit?: number;
}

/** Result of `brandMessage.templates.list` (`listBrandMessageTemplates`). */
export type ListBrandMessageTemplatesResult = BrandMessageTemplateListResult;

/** One item yielded by `brandMessage.templates.iterList`. */
export type ListBrandMessageTemplatesItem = BrandMessageTemplateSummary;

/** Parameters of `brandMessage.templates.listLastModified` (`listBrandMessageTemplatesLastModified`). */
export interface ListBrandMessageTemplatesLastModifiedParams {
  /**
   * 발신프로필 키입니다. 최대 40자입니다.
   */
  senderKey: string;
  /**
   * 발신키 유형입니다. 문서 예시 값은 `S`(발신프로필)입니다. 기본값은 `S`입니다.
   */
  senderKeyType?: string;
  /**
   * 조회 시작 시각(`yyyy-MM-dd'T'HH:mm:ss`)입니다.
   * 형식 yyyy-MM-dd'T'HH:mm:ss
   */
  since?: string;
  /**
   * 페이지 번호입니다. 기본값 1, 최소 1입니다.
   */
  page?: number;
  /**
   * 페이지당 조회 건수입니다. 기본값 100, 최소 1입니다.
   */
  count?: number;
}

/** Result of `brandMessage.templates.listLastModified` (`listBrandMessageTemplatesLastModified`). */
export type ListBrandMessageTemplatesLastModifiedResult = BrandMessageTemplateListResult;

/** One item yielded by `brandMessage.templates.iterListLastModified`. */
export type ListBrandMessageTemplatesLastModifiedItem = BrandMessageTemplateSummary;

/** Parameters of `brandMessage.templates.delete` (`deleteBrandMessageTemplate`). */
export interface DeleteBrandMessageTemplateParams {
  /**
   * 발신프로필 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
  /**
   * 삭제할 템플릿 코드입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  templateCode: string;
}

/** Parameters of `brandMessage.groupTags.list` (`listBrandMessageGroupTags`). */
export interface ListBrandMessageGroupTagsParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `brandMessage.groupTags.list` (`listBrandMessageGroupTags`). */
export type ListBrandMessageGroupTagsResult = BrandMessageGroupTagListResult;

/** Parameters of `brandMessage.groupTags.get` (`getBrandMessageGroupTag`). */
export interface GetBrandMessageGroupTagParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 그룹태그 키입니다.
   */
  groupTagKey: string;
}

/** Result of `brandMessage.groupTags.get` (`getBrandMessageGroupTag`). */
export type GetBrandMessageGroupTagResult = BrandMessageGroupTagListResult;

/** Parameters of `brandMessage.groupTags.create` (`createBrandMessageGroupTag`). */
export interface CreateBrandMessageGroupTagParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupTagRequest;
}

/** Result of `brandMessage.groupTags.create` (`createBrandMessageGroupTag`). */
export type CreateBrandMessageGroupTagResult = BrandMessageGroupTagListResult;

/** Parameters of `brandMessage.groupTags.update` (`updateBrandMessageGroupTag`). */
export interface UpdateBrandMessageGroupTagParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageGroupTagRequest;
}

/** Result of `brandMessage.groupTags.update` (`updateBrandMessageGroupTag`). */
export type UpdateBrandMessageGroupTagResult = BrandMessageGroupTagListResult;

/** Parameters of `brandMessage.groupTags.delete` (`deleteBrandMessageGroupTag`). */
export interface DeleteBrandMessageGroupTagParams {
  /**
   * 발신프로필 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
  /**
   * 삭제할 그룹태그 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  groupTagKey: string;
}

/** Parameters of `brandMessage.friendGroups.uploadFile` (`uploadBrandMessageFriendGroupFile`). */
export interface UploadBrandMessageFriendGroupFileParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageFriendGroupFileUploadRequest;
}

/** Result of `brandMessage.friendGroups.uploadFile` (`uploadBrandMessageFriendGroupFile`). */
export type UploadBrandMessageFriendGroupFileResult = BrandMessageFriendGroupFileUploadResult;

/** Parameters of `brandMessage.friendGroups.get` (`getBrandMessageFriendGroup`). */
export interface GetBrandMessageFriendGroupParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey: string;
}

/** Result of `brandMessage.friendGroups.get` (`getBrandMessageFriendGroup`). */
export type GetBrandMessageFriendGroupResult = BrandMessageFriendGroupResult;

/** Parameters of `brandMessage.friendGroups.create` (`createBrandMessageFriendGroup`). */
export interface CreateBrandMessageFriendGroupParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageFriendGroupRequest;
}

/** Result of `brandMessage.friendGroups.create` (`createBrandMessageFriendGroup`). */
export type CreateBrandMessageFriendGroupResult = BrandMessageFriendGroupProcessingResult;

/** Parameters of `brandMessage.friendGroups.list` (`listBrandMessageFriendGroups`). */
export interface ListBrandMessageFriendGroupsParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `brandMessage.friendGroups.list` (`listBrandMessageFriendGroups`). */
export type ListBrandMessageFriendGroupsResult = BrandMessageFriendGroupListResult;

/** Parameters of `brandMessage.friendGroups.delete` (`deleteBrandMessageFriendGroup`). */
export interface DeleteBrandMessageFriendGroupParams {
  /**
   * 발신프로필 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
  /**
   * 삭제할 친구 그룹 키입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  friendGroupKey: string;
}

/** Parameters of `brandMessage.friendGroups.addPhoneNumbers` (`addBrandMessageFriendGroupPhoneNumbers`). */
export interface AddBrandMessageFriendGroupPhoneNumbersParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageFriendGroupRequest;
}

/** Result of `brandMessage.friendGroups.addPhoneNumbers` (`addBrandMessageFriendGroupPhoneNumbers`). */
export type AddBrandMessageFriendGroupPhoneNumbersResult = BrandMessageFriendGroupProcessingResult;

/** Parameters of `brandMessage.friendGroups.deletePhoneNumbers` (`deleteBrandMessageFriendGroupPhoneNumbers`). */
export interface DeleteBrandMessageFriendGroupPhoneNumbersParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageFriendGroupRequest;
}

/** Result of `brandMessage.friendGroups.deletePhoneNumbers` (`deleteBrandMessageFriendGroupPhoneNumbers`). */
export type DeleteBrandMessageFriendGroupPhoneNumbersResult = BrandMessageFriendGroupProcessingResult;

/** Parameters of `brandMessage.friendGroups.listPhoneNumberRequests` (`listBrandMessageFriendGroupPhoneNumberRequests`). */
export interface ListBrandMessageFriendGroupPhoneNumberRequestsParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey: string;
  /**
   * 이전 페이지의 마지막 요청 아이디입니다.
   */
  lastRequestId?: string;
  /**
   * 조회 건수입니다.
   */
  count?: number;
}

/** Result of `brandMessage.friendGroups.listPhoneNumberRequests` (`listBrandMessageFriendGroupPhoneNumberRequests`). */
export type ListBrandMessageFriendGroupPhoneNumberRequestsResult = BrandMessageFriendGroupPhoneNumberRequestListResult;

/** One item yielded by `brandMessage.friendGroups.iterListPhoneNumberRequests`. */
export type ListBrandMessageFriendGroupPhoneNumberRequestsItem = BrandMessageFriendGroupPhoneNumberRequest;

/** Parameters of `brandMessage.friendGroups.getPhoneNumberRequest` (`getBrandMessageFriendGroupPhoneNumberRequest`). */
export interface GetBrandMessageFriendGroupPhoneNumberRequestParams {
  /**
   * 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 친구 그룹 키입니다.
   */
  friendGroupKey: string;
  /**
   * 조회할 요청 아이디입니다.
   */
  requestId: string;
}

/** Result of `brandMessage.friendGroups.getPhoneNumberRequest` (`getBrandMessageFriendGroupPhoneNumberRequest`). */
export type GetBrandMessageFriendGroupPhoneNumberRequestResult = BrandMessageFriendGroupPhoneNumberRequestResult;

/** Parameters of `brandMessage.marketingAgreements.uploadEvidence` (`uploadBrandMessageMarketingAgreeEvidence`). */
export interface UploadBrandMessageMarketingAgreeEvidenceParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: BrandMessageMarketingAgreeUploadRequest;
}

/** Result of `brandMessage.marketingAgreements.uploadEvidence` (`uploadBrandMessageMarketingAgreeEvidence`). */
export type UploadBrandMessageMarketingAgreeEvidenceResult = BrandMessageMarketingAgreeResult;

/** Parameters of `brandMessage.unsubscribeContents.register` (`registerBrandMessageUnsubscribeContent`). */
export interface RegisterBrandMessageUnsubscribeContentParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: BrandMessageUnsubscribeContentRequest;
}

/** Parameters of `rcs.brands.get` (`getRcsBrand`). */
export interface GetRcsBrandParams {
  /**
   * 조회할 브랜드 ID입니다.
   */
  brandId: string;
}

/** Result of `rcs.brands.get` (`getRcsBrand`). */
export type GetRcsBrandResult = RcsBrandResult;

/** Parameters of `rcs.brands.update` (`updateRcsBrand`). */
export interface UpdateRcsBrandParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: RcsBrandUpdateRequest;
}

/** Result of `rcs.brands.update` (`updateRcsBrand`). */
export type UpdateRcsBrandResult = RcsBrandResult;

/** Parameters of `rcs.chatbots.list` (`listRcsChatbots`). */
export interface ListRcsChatbotsParams {
  /**
   * 조회할 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 조회 시작 위치입니다. 기본값 0(영문 문서 기준).
   */
  offset?: number;
  /**
   * 조회 최대 건수입니다. 기본값 1000(영문 문서 기준).
   */
  limit?: number;
}

/** Result of `rcs.chatbots.list` (`listRcsChatbots`). */
export type ListRcsChatbotsResult = RcsChatbotResult;

/** One item yielded by `rcs.chatbots.iterList`. */
export type ListRcsChatbotsItem = RcsChatbot;

/** Parameters of `rcs.chatbots.get` (`getRcsChatbot`). */
export interface GetRcsChatbotParams {
  /**
   * 조회할 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 조회할 대화방 ID입니다.
   */
  chatbotId: string;
}

/** Result of `rcs.chatbots.get` (`getRcsChatbot`). */
export type GetRcsChatbotResult = RcsChatbotResult;

/** Parameters of `rcs.chatbots.update` (`updateRcsChatbot`). */
export interface UpdateRcsChatbotParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: RcsChatbotUpdateRequest;
}

/** Result of `rcs.chatbots.update` (`updateRcsChatbot`). */
export type UpdateRcsChatbotResult = RcsChatbotResult;

/** Parameters of `rcs.chatbots.cancel` (`cancelRcsChatbotApproval`). */
export interface CancelRcsChatbotApprovalParams {
  /**
   * 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 대화방 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  chatbotId: string;
}

/** Result of `rcs.chatbots.cancel` (`cancelRcsChatbotApproval`). */
export type CancelRcsChatbotApprovalResult = RcsChatbotResult;

/** Parameters of `rcs.chatbots.delete` (`deleteRcsChatbot`). */
export interface DeleteRcsChatbotParams {
  /**
   * 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 대화방 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  chatbotId: string;
}

/** Result of `rcs.chatbots.delete` (`deleteRcsChatbot`). */
export type DeleteRcsChatbotResult = RcsChatbotResult;

/** Parameters of `rcs.chatbots.getUsableQueries` (`getRcsChatbotUsableQueries`). */
export interface GetRcsChatbotUsableQueriesParams {
  /**
   * 대화방 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  chatbotId: string;
}

/** Result of `rcs.chatbots.getUsableQueries` (`getRcsChatbotUsableQueries`). */
export type GetRcsChatbotUsableQueriesResult = RcsChatbotResult;

/** Result of `rcs.commonFormats.list` (`listRcsCommonFormats`). */
export type ListRcsCommonFormatsResult = RcsMessagebaseCommonListResult;

/** Parameters of `rcs.commonFormats.get` (`getRcsCommonFormat`). */
export interface GetRcsCommonFormatParams {
  /**
   * 조회할 메시지베이스 ID입니다.
   */
  messagebaseId: string;
}

/** Result of `rcs.commonFormats.get` (`getRcsCommonFormat`). */
export type GetRcsCommonFormatResult = RcsMessagebaseFormDetailResult;

/** Parameters of `rcs.templateForms.list` (`listRcsTemplateForms`). */
export interface ListRcsTemplateFormsParams {
  /**
   * 조회 시작 위치입니다. 기본값 0(영문 문서 기준).
   */
  offset?: number;
  /**
   * 조회 최대 건수입니다. 최소 100, 최대 1000, 기본값 100(영문 문서 기준).
   */
  limit?: number;
}

/** Result of `rcs.templateForms.list` (`listRcsTemplateForms`). */
export type ListRcsTemplateFormsResult = RcsMessagebaseFormListResult;

/** One item yielded by `rcs.templateForms.iterList`. */
export type ListRcsTemplateFormsItem = RcsMessagebaseFormSummary;

/** Parameters of `rcs.templateForms.get` (`getRcsTemplateForm`). */
export interface GetRcsTemplateFormParams {
  /**
   * 메시지 양식 ID입니다.
   */
  messagebaseformId: string;
}

/** Result of `rcs.templateForms.get` (`getRcsTemplateForm`). */
export type GetRcsTemplateFormResult = RcsMessagebaseFormDetailResult;

/** Result of `rcs.templates.list` (`listRcsTemplates`). */
export type ListRcsTemplatesResult = RcsTemplateListResult;

/** Parameters of `rcs.templates.get` (`getRcsTemplate`). */
export interface GetRcsTemplateParams {
  /**
   * 메시지베이스 ID입니다.
   */
  messagebaseId: string;
}

/** Result of `rcs.templates.get` (`getRcsTemplate`). */
export type GetRcsTemplateResult = RcsTemplateResult;

/** Parameters of `rcs.templates.create` (`createRcsTemplate`). */
export interface CreateRcsTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: RcsTemplateRequest;
}

/** Result of `rcs.templates.create` (`createRcsTemplate`). */
export type CreateRcsTemplateResult = RcsTemplateIdResult;

/** Parameters of `rcs.templates.update` (`updateRcsTemplate`). */
export interface UpdateRcsTemplateParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: RcsTemplateRequest;
}

/** Result of `rcs.templates.update` (`updateRcsTemplate`). */
export type UpdateRcsTemplateResult = RcsTemplateIdResult;

/** Parameters of `rcs.templates.cancel` (`cancelRcsTemplateApproval`). */
export interface CancelRcsTemplateApprovalParams {
  /**
   * 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 메시지베이스 ID입니다. 발송 시에는 `formatId` 필드 이름으로 쓰이므로 혼동하지 않도록 주의합니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  messagebaseId: string;
}

/** Result of `rcs.templates.cancel` (`cancelRcsTemplateApproval`). */
export type CancelRcsTemplateApprovalResult = RcsTemplateIdResult;

/** Parameters of `rcs.templates.delete` (`deleteRcsTemplate`). */
export interface DeleteRcsTemplateParams {
  /**
   * 브랜드 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  brandId: string;
  /**
   * 메시지베이스 ID입니다. 발송 시에는 `formatId` 필드 이름으로 쓰이므로 혼동하지 않도록 주의합니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  messagebaseId: string;
}

/** Result of `rcs.templates.delete` (`deleteRcsTemplate`). */
export type DeleteRcsTemplateResult = RcsTemplateIdResult;

/** Parameters of `rcs.templateImages.get` (`getRcsTemplateImage`). */
export interface GetRcsTemplateImageParams {
  /**
   * 브랜드 ID입니다.
   */
  brandId: string;
  /**
   * 템플릿 파일 ID입니다.
   */
  fileId: string;
}

/** Result of `rcs.templateImages.get` (`getRcsTemplateImage`). */
export type GetRcsTemplateImageResult = RcsTemplateImageResult;

/** Parameters of `rcs.templateImages.upload` (`uploadRcsTemplateImage`). */
export interface UploadRcsTemplateImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: RcsTemplateImageUploadRequest;
}

/** Result of `rcs.templateImages.upload` (`uploadRcsTemplateImage`). */
export type UploadRcsTemplateImageResult = RcsTemplateImageResult;

/** Parameters of `rcs.templateImages.listFormLogos` (`listRcsTemplateFormLogos`). */
export interface ListRcsTemplateFormLogosParams {
  /**
   * 메시지 양식 ID입니다.
   */
  messagebaseformId: string;
}

/** Result of `rcs.templateImages.listFormLogos` (`listRcsTemplateFormLogos`). */
export type ListRcsTemplateFormLogosResult = RcsTemplateFormLogoListResult;

/** Parameters of `counsel.messages.sendPlain` (`sendCounselPlain`). */
export interface SendCounselPlainParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselPlainMessageRequest;
}

/** Result of `counsel.messages.sendPlain` (`sendCounselPlain`). */
export type SendCounselPlainResult = CounselSendServiceResult;

/** Parameters of `counsel.messages.sendRich` (`sendCounselRich`). */
export interface SendCounselRichParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselRichMessageRequest;
}

/** Result of `counsel.messages.sendRich` (`sendCounselRich`). */
export type SendCounselRichResult = CounselSendServiceResult;

/** Parameters of `counsel.messages.delete` (`deleteCounselMessage`). */
export interface DeleteCounselMessageParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselMessageDeleteRequest;
}

/** Parameters of `counsel.sessions.end` (`endCounselSession`). */
export interface EndCounselSessionParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselEndRequest;
}

/** Result of `counsel.sessions.end` (`endCounselSession`). */
export type EndCounselSessionResult = CounselEndResult;

/** Parameters of `counsel.sessions.endWithBot` (`endCounselSessionWithBot`). */
export interface EndCounselSessionWithBotParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselEndWithBotRequest;
}

/** Result of `counsel.sessions.endWithBot` (`endCounselSessionWithBot`). */
export type EndCounselSessionWithBotResult = CounselEndResult;

/** Parameters of `counsel.sessions.get` (`getCounselSession`). */
export interface GetCounselSessionParams {
  /**
   * 상담톡 사용자 키입니다. 1~20자입니다.
   */
  userKey: string;
}

/** Result of `counsel.sessions.get` (`getCounselSession`). */
export type GetCounselSessionResult = CounselSessionResult;

/** Parameters of `counsel.users.block` (`blockCounselUser`). */
export interface BlockCounselUserParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselUserBlockRequest;
}

/** Parameters of `counsel.users.unblock` (`unblockCounselUser`). */
export interface UnblockCounselUserParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselUserBlockRequest;
}

/** Parameters of `counsel.certs.get` (`getCounselCertStatus`). */
export interface GetCounselCertStatusParams {
  /**
   * 인증 트랜잭션 ID입니다. 카카오가 인증 요청 시 발급하며 `counselCertResult` 웹훅의 `certTxId`와 같습니다.
   */
  certTxId: string;
}

/** Result of `counsel.certs.get` (`getCounselCertStatus`). */
export type GetCounselCertStatusResult = CounselCertStatusResult;

/** Parameters of `counsel.files.uploadImage` (`uploadCounselImage`). */
export interface UploadCounselImageParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: CounselImageUploadRequest;
}

/** Result of `counsel.files.uploadImage` (`uploadCounselImage`). */
export type UploadCounselImageResult = CounselImageUploadResult;

/** Parameters of `counsel.files.upload` (`uploadCounselFile`). */
export interface UploadCounselFileParams {
  /** 요청 본문(multipart/form-data). 파일은 경로, 바이트, Blob 또는 `{ data, filename }`으로 넣습니다. */
  body: CounselFileUploadRequest;
}

/** Result of `counsel.files.upload` (`uploadCounselFile`). */
export type UploadCounselFileResult = CounselFileUploadResult;

/** Parameters of `counsel.channels.activate` (`activateCounsel`). */
export interface ActivateCounselParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderActivationRequest;
}

/** Parameters of `counsel.channels.deactivate` (`deactivateCounsel`). */
export interface DeactivateCounselParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderActivationRequest;
}

/** Parameters of `counsel.channels.activateChat` (`activateCounselChat`). */
export interface ActivateCounselChatParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderRequest;
}

/** Parameters of `counsel.channels.deactivateChat` (`deactivateCounselChat`). */
export interface DeactivateCounselChatParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderRequest;
}

/** Parameters of `counsel.consultTime.get` (`getCounselConsultTime`). */
export interface GetCounselConsultTimeParams {
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
}

/** Result of `counsel.consultTime.get` (`getCounselConsultTime`). */
export type GetCounselConsultTimeResult = CounselConsultTimeResult;

/** Parameters of `counsel.consultTime.save` (`saveCounselConsultTime`). */
export interface SaveCounselConsultTimeParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselConsultTimeSaveRequest;
}

/** Parameters of `counsel.systemMessages.list` (`listCounselSystemMessages`). */
export interface ListCounselSystemMessagesParams {
  /**
   * 카카오 비즈메시지 발신프로필 키입니다.
   */
  senderKey: string;
  /**
   * 시스템 메시지 ID입니다. 특정 메시지만 조회할 때 입력합니다.
   */
  id?: string;
}

/** Result of `counsel.systemMessages.list` (`listCounselSystemMessages`). */
export type ListCounselSystemMessagesResult = CounselSystemMessageListResult;

/** Parameters of `counsel.systemMessages.create` (`createCounselSystemMessage`). */
export interface CreateCounselSystemMessageParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSystemMessageCreateRequest;
}

/** Result of `counsel.systemMessages.create` (`createCounselSystemMessage`). */
export type CreateCounselSystemMessageResult = CounselSystemMessageCreateResult;

/** Parameters of `counsel.systemMessages.delete` (`deleteCounselSystemMessage`). */
export interface DeleteCounselSystemMessageParams {
  /**
   * 발신프로필 키입니다. URL 인코딩해서 넣습니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  senderKey: string;
  /**
   * 삭제할 시스템 메시지 ID입니다.
   * 경로 값으로 URL 인코딩됩니다.
   */
  id: string;
}

/** Parameters of `counsel.systemMessages.requestApproval` (`requestCounselSystemMessageApproval`). */
export interface RequestCounselSystemMessageApprovalParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderRequest;
}

/** Parameters of `counsel.systemMessages.cancelApproval` (`cancelCounselSystemMessageApproval`). */
export interface CancelCounselSystemMessageApprovalParams {
  /** 요청 본문(JSON). 보내기 전에 스펙 규칙으로 검증합니다. */
  body: CounselSenderRequest;
}

/**
 * `client.send` (generated part; the hand-written class in src/resources extends it).
 */
export class SendResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }
}

/**
 * `client.files` (generated part; the hand-written class in src/resources extends it).
 */
export class FilesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 이미지 업로드
   *
   * 기본형 브랜드메시지에서 사용하는 이미지를 업로드합니다. 발송 본문에 파일을 직접 첨부하는 API가 아니라 브랜드메시지 템플릿 등록과 구성에 사용할 이미지 URL(`imgUrl`)을 발급받는 API입니다.
   *
   * `POST /api/comm/v1/file/brandmessage/default` (`uploadBrandMessageDefaultImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageDefault(params: UploadBrandMessageDefaultImageParams): Promise<UploadBrandMessageDefaultImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageDefaultImage, params)) as UploadBrandMessageDefaultImageResult;
  }

  /**
   * 브랜드메시지 와이드 이미지 업로드
   *
   * 와이드 이미지형 브랜드메시지에서 사용하는 이미지를 업로드합니다. 발급된 `imgUrl`은 브랜드메시지 템플릿 또는 발송 구성에 사용합니다.
   *
   * `POST /api/comm/v1/file/brandmessage/wide` (`uploadBrandMessageWideImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageWide(params: UploadBrandMessageWideImageParams): Promise<UploadBrandMessageWideImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageWideImage, params)) as UploadBrandMessageWideImageResult;
  }

  /**
   * 브랜드메시지 와이드 리스트 첫번째 이미지 업로드
   *
   * 와이드 리스트형 브랜드메시지의 첫 번째 리스트 이미지에 사용할 이미지를 업로드합니다.
   *
   * `POST /api/comm/v1/file/brandmessage/wideItemList/first` (`uploadBrandMessageWideItemListFirstImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageWideItemListFirst(params: UploadBrandMessageWideItemListFirstImageParams): Promise<UploadBrandMessageWideItemListFirstImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageWideItemListFirstImage, params)) as UploadBrandMessageWideItemListFirstImageResult;
  }

  /**
   * 브랜드메시지 와이드 리스트 이미지 업로드
   *
   * 와이드 리스트형 브랜드메시지의 2~4번째 리스트 이미지에 사용할 이미지를 업로드합니다.
   *
   * `POST /api/comm/v1/file/brandmessage/wideItemList` (`uploadBrandMessageWideItemListImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageWideItemList(params: UploadBrandMessageWideItemListImageParams): Promise<UploadBrandMessageWideItemListImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageWideItemListImage, params)) as UploadBrandMessageWideItemListImageResult;
  }

  /**
   * 브랜드메시지 캐러셀 피드 이미지 업로드
   *
   * 캐러셀 피드형 브랜드메시지에서 사용하는 이미지를 업로드합니다.
   *
   * `POST /api/comm/v1/file/brandmessage/carouselFeed` (`uploadBrandMessageCarouselFeedImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageCarouselFeed(params: UploadBrandMessageCarouselFeedImageParams): Promise<UploadBrandMessageCarouselFeedImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageCarouselFeedImage, params)) as UploadBrandMessageCarouselFeedImageResult;
  }

  /**
   * 브랜드메시지 캐러셀 커머스 이미지 업로드
   *
   * 캐러셀 커머스형 브랜드메시지에서 사용하는 이미지를 업로드합니다. 전체 캐러셀 이미지 비율은 동일하게 맞춰야 합니다.
   *
   * `POST /api/comm/v1/file/brandmessage/carouselCommerce` (`uploadBrandMessageCarouselCommerceImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageCarouselCommerce(params: UploadBrandMessageCarouselCommerceImageParams): Promise<UploadBrandMessageCarouselCommerceImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageCarouselCommerceImage, params)) as UploadBrandMessageCarouselCommerceImageResult;
  }

  /**
   * 알림톡 템플릿 이미지 업로드
   *
   * 알림톡 이미지형, 와이드 이미지형, 아이템리스트형 템플릿 등록에 사용할 이미지를 업로드합니다. 메시지 발송용 업로드가 아니라 템플릿 등록을 위한 사전 이미지 등록 API입니다. 응답의 `imgUrl`을 템플릿 등록의 `imgUrl`에 넣습니다.
   *
   * `POST /api/comm/v1/file/alimtalk/template` (`uploadAlimtalkTemplateImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async uploadAlimtalkTemplateImage(params: UploadAlimtalkTemplateImageParams): Promise<UploadAlimtalkTemplateImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadAlimtalkTemplateImage, params)) as UploadAlimtalkTemplateImageResult;
  }

  /**
   * 알림톡 템플릿 하이라이트 이미지 업로드
   *
   * 아이템리스트형 알림톡 템플릿의 아이템 하이라이트 영역에 사용할 이미지를 업로드합니다. 템플릿 이미지 업로드와 같은 템플릿 등록용 사전 이미지 등록 API입니다.
   *
   * `POST /api/comm/v1/file/alimtalk/itemHighlight` (`uploadAlimtalkItemHighlightImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async uploadAlimtalkItemHighlightImage(params: UploadAlimtalkItemHighlightImageParams): Promise<UploadAlimtalkItemHighlightImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadAlimtalkItemHighlightImage, params)) as UploadAlimtalkItemHighlightImageResult;
  }

  /**
   * 브랜드메시지 카탈로그 이미지 업로드
   *
   * 카탈로그형(FG) 브랜드메시지에서 쓰는 1:1 비율 이미지를 업로드하고 템플릿에 쓸 `imgUrl`을 발급받습니다. 홀수형(아이템 3·5·7개)의 첫 번째 아이템은 카탈로그 홀수형 첫번째 이미지 업로드를 씁니다.
   *
   * `POST /api/comm/v1/file/brandmessage/catalog` (`uploadBrandMessageCatalogImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageCatalog(params: UploadBrandMessageCatalogImageParams): Promise<UploadBrandMessageCatalogImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageCatalogImage, params)) as UploadBrandMessageCatalogImageResult;
  }

  /**
   * 브랜드메시지 카탈로그 홀수형 첫번째 이미지 업로드
   *
   * 카탈로그형(FG) 홀수형의 첫 번째 아이템에 쓰는 2:1 비율 이미지를 업로드합니다. 나머지 아이템과 짝수형(4·6개)은 카탈로그 이미지 업로드를 씁니다.
   *
   * `POST /api/comm/v1/file/brandmessage/catalog/oddFirst` (`uploadBrandMessageCatalogOddFirstImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadBrandMessageCatalogOddFirst(params: UploadBrandMessageCatalogOddFirstImageParams): Promise<UploadBrandMessageCatalogOddFirstImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageCatalogOddFirstImage, params)) as UploadBrandMessageCatalogOddFirstImageResult;
  }
}

/**
 * `client.reports` (generated part; the hand-written class in src/resources extends it).
 */
export class ReportsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }
}

/**
 * `client.messages` (generated part; the hand-written class in src/resources extends it).
 */
export class MessagesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }
}

/**
 * `client.reservations`.
 */
export class ReservationsResource {
  readonly #transport: Transport;
  /** `client.reservations.recipients` */
  readonly recipients: ReservationsRecipientsResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.recipients = new ReservationsRecipientsResource(transport);
  }

  /**
   * 예약 발송 등록
   *
   * 메시지를 지정한 시각에 발송하도록 예약 등록합니다. SMS/LMS/MMS, 국제, 통합 RCS, 알림톡, 브랜드메시지(기본형·자유형)를 예약할 수 있으며,
   * 채널별 메시지 필드는 통합 발송 규격과 같습니다. 채널별 안내는 문자·국제·RCS·알림톡·브랜드메시지 API 레퍼런스의 "예약 발송" 섹션에 있습니다.
   *
   * `POST /api/comm/v1/reservation` (`createReservation`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: send.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/mt
   */
  async create(params: CreateReservationParams): Promise<CreateReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.createReservation, params)) as CreateReservationResult;
  }

  /**
   * 예약 목록 조회
   *
   * 예약 발송 건 목록을 조회합니다. `resvSendTime`에 지정한 시각을 포함해 그 이후의 예약 건이 조회됩니다.
   *
   * `GET /api/comm/v1/reservation/list` (`listReservations`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async list(params: ListReservationsParams): Promise<ListReservationsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listReservations, params)) as ListReservationsResult;
  }

  /**
   * Iterate over every item of `reservations.list`, following `lastSeq` (cursor).
   * `hasNext`가 false이거나 커서가 없거나 움직이지 않으면 멈춥니다.
   */
  iterList(params: Omit<ListReservationsParams, 'lastSeq'>): AsyncGenerator<ListReservationsItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listReservations, params) as AsyncGenerator<ListReservationsItem, void, undefined>;
  }

  /**
   * 예약 상세 조회
   *
   * 예약 발송 키(resvKey)로 예약 건을 단건 조회합니다.
   *
   * `GET /api/comm/v1/reservation/resvKey/{resvKey}` (`getReservation`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async get(params: GetReservationParams): Promise<GetReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.getReservation, params)) as GetReservationResult;
  }

  /**
   * 예약 수정
   *
   * 예약 대기(PENDING) 상태인 예약 건의 발송 시각과 예약명을 수정합니다. 다른 상태이면 거절됩니다(A824).
   * 수정 응답에는 `resvData`가 빠질 수 있습니다.
   *
   * `PUT /api/comm/v1/reservation/resvKey/{resvKey}` (`updateReservation`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async update(params: UpdateReservationParams): Promise<UpdateReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateReservation, params)) as UpdateReservationResult;
  }

  /**
   * 예약 취소
   *
   * 예약 대기(PENDING) 또는 예약 중지(STOPPED) 상태인 예약 건을 취소합니다. 성공하면 `status`가 `CANCELLED`가 됩니다.
   *
   * `POST /api/comm/v1/reservation/resvKey/{resvKey}/cancel` (`cancelReservation`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async cancel(params: CancelReservationParams): Promise<CancelReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.cancelReservation, params)) as CancelReservationResult;
  }

  /**
   * 예약 중지
   *
   * 발송 처리 중(PROCESSING)인 예약 건을 중지합니다. 성공하면 `status`가 `STOPPED`가 되며, 재개(`resume`)로 다시 발송할 수 있습니다.
   *
   * `POST /api/comm/v1/reservation/resvKey/{resvKey}/stop` (`stopReservation`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async pause(params: StopReservationParams): Promise<StopReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.stopReservation, params)) as StopReservationResult;
  }

  /**
   * 예약 재개
   *
   * 예약 중지(STOPPED) 상태인 예약 건을 다시 발송 처리합니다.
   *
   * `POST /api/comm/v1/reservation/resvKey/{resvKey}/resume` (`resumeReservation`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async resume(params: ResumeReservationParams): Promise<ResumeReservationResult> {
    return (await callOperation(this.#transport, OPERATIONS.resumeReservation, params)) as ResumeReservationResult;
  }
}

/**
 * `client.reservations.recipients`.
 */
export class ReservationsRecipientsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 예약 수신자 목록 조회
   *
   * 예약 건에 등록된 수신자 목록을 조회합니다.
   *
   * `GET /api/comm/v1/reservation/resvKey/{resvKey}/destinations` (`listReservationRecipients`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async list(params: ListReservationRecipientsParams): Promise<ListReservationRecipientsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listReservationRecipients, params)) as ListReservationRecipientsResult;
  }

  /**
   * Iterate over every item of `reservations.recipients.list`, following `lastSeq` (cursor).
   * `hasNext`가 false이거나 커서가 없거나 움직이지 않으면 멈춥니다.
   */
  iterList(params: Omit<ListReservationRecipientsParams, 'lastSeq'>): AsyncGenerator<ListReservationRecipientsItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listReservationRecipients, params) as AsyncGenerator<ListReservationRecipientsItem, void, undefined>;
  }

  /**
   * 예약 수신자 추가
   *
   * 기존 예약 건에 수신자를 추가합니다. 한 번에 최대 1,000건까지 추가할 수 있습니다. 수신자별 `code`를 함께 확인합니다.
   *
   * `POST /api/comm/v1/reservation/resvKey/{resvKey}/destinations` (`addReservationRecipients`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: send.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async create(params: AddReservationRecipientsParams): Promise<AddReservationRecipientsResult> {
    return (await callOperation(this.#transport, OPERATIONS.addReservationRecipients, params)) as AddReservationRecipientsResult;
  }

  /**
   * 예약 수신자 삭제
   *
   * 예약 건에 등록된 수신자를 메시지 키(msgKey) 기준으로 삭제합니다.
   *
   * `DELETE /api/comm/v1/reservation/resvKey/{resvKey}/destinations/msgKey/{msgKey}` (`deleteReservationRecipient`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/reservation
   */
  async delete(params: DeleteReservationRecipientParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteReservationRecipient, params)) as void;
  }
}

/**
 * `client.insights`.
 */
export class InsightsResource {
  readonly #transport: Transport;
  /** `client.insights.alimtalk` */
  readonly alimtalk: InsightsAlimtalkResource;
  /** `client.insights.brandMessage` */
  readonly brandMessage: InsightsBrandMessageResource;
  /** `client.insights.rcs` */
  readonly rcs: InsightsRcsResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.alimtalk = new InsightsAlimtalkResource(transport);
    this.brandMessage = new InsightsBrandMessageResource(transport);
    this.rcs = new InsightsRcsResource(transport);
  }
}

/**
 * `client.insights.alimtalk`.
 */
export class InsightsAlimtalkResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 알림톡 주요 인사이트 조회
   *
   * 기간·발신프로필 기준으로 알림톡 발송 성공/실패·읽음·클릭 등 주요 통계를 조회합니다. 카카오가 직접 제공하는 통계입니다.
   *
   * `GET /api/comm/v1/center/statistics/alimtalk` (`getAlimtalkInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async get(params: GetAlimtalkInsightParams): Promise<GetAlimtalkInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getAlimtalkInsight, params)) as GetAlimtalkInsightResult;
  }

  /**
   * 알림톡 시간별 반응 지표
   *
   * 기간·발신프로필 기준으로 알림톡 시간대별(0~23시) 반응 통계를 조회합니다.
   *
   * `GET /api/comm/v1/center/statistics/alimtalk/reaction/hourly` (`getAlimtalkHourlyInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getHourly(params: GetAlimtalkHourlyInsightParams): Promise<GetAlimtalkHourlyInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getAlimtalkHourlyInsight, params)) as GetAlimtalkHourlyInsightResult;
  }

  /**
   * 알림톡 템플릿 상세 조회
   *
   * 기간·발신프로필 기준으로 알림톡 템플릿별 통계를 조회합니다.
   *
   * `GET /api/comm/v1/center/statistics/alimtalk/template` (`getAlimtalkTemplateInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getByTemplate(params: GetAlimtalkTemplateInsightParams): Promise<GetAlimtalkTemplateInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getAlimtalkTemplateInsight, params)) as GetAlimtalkTemplateInsightResult;
  }
}

/**
 * `client.insights.brandMessage`.
 */
export class InsightsBrandMessageResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 주요 인사이트 조회
   *
   * 기간·발신프로필 기준으로 브랜드메시지 발송 성공/실패·읽음·클릭 등 주요 통계를 조회합니다. 카카오가 직접 제공하는 통계입니다.
   *
   * `GET /api/comm/v1/center/statistics/brandmessage` (`getBrandMessageInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async get(params: GetBrandMessageInsightParams): Promise<GetBrandMessageInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageInsight, params)) as GetBrandMessageInsightResult;
  }

  /**
   * 브랜드메시지 시간별 반응 지표
   *
   * 기간·발신프로필 기준으로 브랜드메시지 시간대별(0~23시) 반응 통계를 조회합니다.
   *
   * `GET /api/comm/v1/center/statistics/brandmessage/reaction/hourly` (`getBrandMessageHourlyInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getHourly(params: GetBrandMessageHourlyInsightParams): Promise<GetBrandMessageHourlyInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageHourlyInsight, params)) as GetBrandMessageHourlyInsightResult;
  }

  /**
   * 브랜드메시지 템플릿 상세 조회
   *
   * 기간·발신프로필 기준으로 브랜드메시지 템플릿별 통계를 조회합니다.
   *
   * `GET /api/comm/v1/center/statistics/brandmessage/template` (`getBrandMessageTemplateInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getByTemplate(params: GetBrandMessageTemplateInsightParams): Promise<GetBrandMessageTemplateInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageTemplateInsight, params)) as GetBrandMessageTemplateInsightResult;
  }
}

/**
 * `client.insights.rcs`.
 */
export class InsightsRcsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 메시지 발송·노출 통계
   *
   * 브랜드·그룹 기준으로 RCS 메시지의 발송 건수와 노출(읽음) 건수를 일자별로 조회합니다.
   * 통계는 발송 요청의 `groupId` 단위로 집계되며, `groupId` 없이 보낸 건은 포함되지 않습니다.
   * 응답 데이터는 `data.data`가 아니라 `data.rcs`에 있습니다.
   *
   * `GET /api/comm/v1/center/rcs/brandId/{brandId}/stat/message` (`getRcsMessageInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getMessage(params: GetRcsMessageInsightParams): Promise<GetRcsMessageInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsMessageInsight, params)) as GetRcsMessageInsightResult;
  }

  /**
   * RCS 메시지 버튼 클릭 통계
   *
   * RCS 메시지에 포함된 버튼의 클릭 수를 카드·버튼 단위로 조회합니다.
   * 응답 데이터는 `data.data`가 아니라 `data.rcs`에 있습니다.
   *
   * `GET /api/comm/v1/center/rcs/brandId/{brandId}/stat/messageButton` (`getRcsMessageButtonInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getMessageButton(params: GetRcsMessageButtonInsightParams): Promise<GetRcsMessageButtonInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsMessageButtonInsight, params)) as GetRcsMessageButtonInsightResult;
  }

  /**
   * RCS 대화방 메뉴 클릭 통계
   *
   * 대화방 하단 고정 메뉴의 클릭 수를 메뉴 단위로 조회합니다. RCS 인사이트 중 이 API만 `chatbotId`가 필수입니다.
   * 응답 데이터는 `data.data`가 아니라 `data.rcs`에 있습니다.
   *
   * `GET /api/comm/v1/center/rcs/brandId/{brandId}/stat/persistentMenu` (`getRcsPersistentMenuInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getPersistentMenu(params: GetRcsPersistentMenuInsightParams): Promise<GetRcsPersistentMenuInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsPersistentMenuInsight, params)) as GetRcsPersistentMenuInsightResult;
  }

  /**
   * RCS 브랜드 프로필 노출 통계
   *
   * 브랜드 프로필이 노출된 건수를 일자별로 조회합니다. 그룹·챗봇 조건 없이 기간만으로 조회합니다.
   * 응답 데이터는 `data.data`가 아니라 `data.rcs`에 있습니다.
   *
   * `GET /api/comm/v1/center/rcs/brandId/{brandId}/stat/brandProfile` (`getRcsBrandProfileInsight`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/insight
   */
  async getBrandProfile(params: GetRcsBrandProfileInsightParams): Promise<GetRcsBrandProfileInsightResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsBrandProfileInsight, params)) as GetRcsBrandProfileInsightResult;
  }
}

/**
 * `client.kakao`.
 */
export class KakaoResource {
  readonly #transport: Transport;
  /** `client.kakao.categories` */
  readonly categories: KakaoCategoriesResource;
  /** `client.kakao.groups` */
  readonly groups: KakaoGroupsResource;
  /** `client.kakao.sanctions` */
  readonly sanctions: KakaoSanctionsResource;
  /** `client.kakao.senders` */
  readonly senders: KakaoSendersResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.categories = new KakaoCategoriesResource(transport);
    this.groups = new KakaoGroupsResource(transport);
    this.sanctions = new KakaoSanctionsResource(transport);
    this.senders = new KakaoSendersResource(transport);
  }
}

/**
 * `client.kakao.senders`.
 */
export class KakaoSendersResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 카카오 채널 인증 토큰 요청
   *
   * 발신프로필 등록에 필요한 카카오톡 채널 인증 토큰을 요청합니다.
   *
   * `POST /api/comm/v1/account/kakao/sender/token` (`requestKakaoSenderToken`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async requestToken(params: RequestKakaoSenderTokenParams): Promise<RequestKakaoSenderTokenResult> {
    return (await callOperation(this.#transport, OPERATIONS.requestKakaoSenderToken, params)) as RequestKakaoSenderTokenResult;
  }

  /**
   * 발신프로필 키 또는 uuid로 조회
   *
   * 발신프로필 키(`senderKey`) 또는 카카오톡 채널 uuid에 해당하는 발신프로필을 조회합니다. `senderKey`와 `uuid` 중 하나는 반드시 입력해야 합니다.
   *
   * `GET /api/comm/v1/account/kakao/sender` (`findKakaoSender`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async find(params?: FindKakaoSenderParams): Promise<FindKakaoSenderResult> {
    return (await callOperation(this.#transport, OPERATIONS.findKakaoSender, params)) as FindKakaoSenderResult;
  }

  /**
   * 인증 토큰으로 발신프로필 등록
   *
   * 카카오톡 채널을 발신프로필로 신규 등록합니다.
   * 카카오비즈니스 파트너센터에서 비즈니스 인증을 받았고, 프로필이 activated 상태이며 운영자에 의해 차단되지 않은 채널이어야 합니다.
   * 카카오 채널 인증 토큰 요청(`POST /api/comm/v1/account/kakao/sender/token`)으로 받은 토큰과 그때 쓴 전화번호를 헤더로 보냅니다.
   *
   * `POST /api/comm/v1/account/kakao/sender` (`createKakaoSender`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async create(params: CreateKakaoSenderParams): Promise<CreateKakaoSenderResult> {
    return (await callOperation(this.#transport, OPERATIONS.createKakaoSender, params)) as CreateKakaoSenderResult;
  }

  /**
   * 발신프로필 목록 조회
   *
   * API 키에 등록된 발신프로필 목록을 조회합니다. 검색 기간과 발신프로필 키로 범위를 좁힐 수 있고, 결과는 페이지 단위로 반환합니다.
   *
   * `GET /api/comm/v1/account/kakao/sender/profiles` (`listKakaoSenderProfiles`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async list(params?: ListKakaoSenderProfilesParams): Promise<ListKakaoSenderProfilesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listKakaoSenderProfiles, params)) as ListKakaoSenderProfilesResult;
  }

  /**
   * Iterate over every item of `kakao.senders.list`, following `page` (page).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params?: Omit<ListKakaoSenderProfilesParams, 'page'>): AsyncGenerator<ListKakaoSenderProfilesItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listKakaoSenderProfiles, params) as AsyncGenerator<ListKakaoSenderProfilesItem, void, undefined>;
  }

  /**
   * 발신프로필 키로 조회
   *
   * 발신프로필 키를 기준으로 카카오 발신프로필 정보를 조회합니다. 알림톡, 브랜드메시지, 상담톡에서 사용하는 senderKey의 상태(차단·휴면·스팸 등)를 확인할 때 사용합니다.
   *
   * `GET /api/comm/v1/center/kakao/sender` (`getKakaoSender`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async get(params: GetKakaoSenderParams): Promise<GetKakaoSenderResult> {
    return (await callOperation(this.#transport, OPERATIONS.getKakaoSender, params)) as GetKakaoSenderResult;
  }

  /**
   * 발신프로필 휴면 해제
   *
   * 휴면 상태의 발신프로필을 해제합니다. 카카오 비즈메시지 발송 전 발신프로필 상태 복구가 필요한 경우 사용합니다.
   *
   * `POST /api/comm/v1/center/kakao/sender/recover` (`recoverKakaoSender`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async recover(params: RecoverKakaoSenderParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.recoverKakaoSender, params)) as void;
  }
}

/**
 * `client.kakao.categories`.
 */
export class KakaoCategoriesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 발신프로필 카테고리 전체조회
   *
   * 발신프로필 등록 시 사용할 수 있는 카카오 비즈메시지 카테고리 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/kakao/sender/category/list` (`listKakaoSenderCategories`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async list(): Promise<ListKakaoSenderCategoriesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listKakaoSenderCategories, undefined)) as ListKakaoSenderCategoriesResult;
  }

  /**
   * 발신프로필 카테고리 상세조회
   *
   * 카테고리 코드를 기준으로 카카오 비즈메시지 카테고리 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/kakao/sender/category` (`getKakaoSenderCategory`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async get(params: GetKakaoSenderCategoryParams): Promise<GetKakaoSenderCategoryResult> {
    return (await callOperation(this.#transport, OPERATIONS.getKakaoSenderCategory, params)) as GetKakaoSenderCategoryResult;
  }
}

/**
 * `client.kakao.groups`.
 */
export class KakaoGroupsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 발신프로필키로 그룹 조회
   *
   * 발신프로필 키를 기준으로 연결된 발신프로필 그룹 정보를 조회합니다. `senderKey`를 생략하면 조회 가능한 그룹 정보를 기준으로 응답합니다.
   *
   * `GET /api/comm/v1/center/kakao/group` (`listKakaoGroups`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async list(params?: ListKakaoGroupsParams): Promise<ListKakaoGroupsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listKakaoGroups, params)) as ListKakaoGroupsResult;
  }

  /**
   * 그룹에 발신프로필 등록
   *
   * 발신프로필 그룹에 발신프로필을 등록합니다. 그룹 키와 등록할 발신프로필 키를 함께 전달합니다.
   *
   * `POST /api/comm/v1/center/kakao/group` (`addKakaoGroupSender`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async addSender(params: AddKakaoGroupSenderParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.addKakaoGroupSender, params)) as void;
  }

  /**
   * 그룹에서 발신프로필 삭제
   *
   * 발신프로필 그룹에서 특정 발신프로필을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/kakao/group/groupKey/{groupKey}/senderKey/{senderKey}` (`removeKakaoGroupSender`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async removeSender(params: RemoveKakaoGroupSenderParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.removeKakaoGroupSender, params)) as void;
  }
}

/**
 * `client.kakao.sanctions`.
 */
export class KakaoSanctionsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 발신프로필 제재 조회
   *
   * 특정 일자에 발신프로필에 적용된 제재 정보를 조회합니다. 발송 전 운영 상태를 확인할 때 사용합니다.
   *
   * `GET /api/comm/v1/center/kakao/abusing/block/sender` (`getKakaoSenderSanction`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async getSender(params: GetKakaoSenderSanctionParams): Promise<GetKakaoSenderSanctionResult> {
    return (await callOperation(this.#transport, OPERATIONS.getKakaoSenderSanction, params)) as GetKakaoSenderSanctionResult;
  }

  /**
   * 그룹템플릿 발신프로필 제외 조회
   *
   * 그룹템플릿에서 특정 발신프로필이 제외(제한)된 제재 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/kakao/abusing/block/senderGroup` (`getKakaoGroupTemplateSenderExclusion`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async getGroupTemplateExclusion(params: GetKakaoGroupTemplateSenderExclusionParams): Promise<GetKakaoGroupTemplateSenderExclusionResult> {
    return (await callOperation(this.#transport, OPERATIONS.getKakaoGroupTemplateSenderExclusion, params)) as GetKakaoGroupTemplateSenderExclusionResult;
  }

  /**
   * 템플릿 제재 조회
   *
   * 특정 일자에 템플릿에 적용된 제재 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/kakao/abusing/block/template` (`getKakaoTemplateSanction`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-common
   */
  async getTemplate(params: GetKakaoTemplateSanctionParams): Promise<GetKakaoTemplateSanctionResult> {
    return (await callOperation(this.#transport, OPERATIONS.getKakaoTemplateSanction, params)) as GetKakaoTemplateSanctionResult;
  }
}

/**
 * `client.alimtalk`.
 */
export class AlimtalkResource {
  readonly #transport: Transport;
  /** `client.alimtalk.publicTemplates` */
  readonly publicTemplates: AlimtalkPublicTemplatesResource;
  /** `client.alimtalk.templateCategories` */
  readonly templateCategories: AlimtalkTemplateCategoriesResource;
  /** `client.alimtalk.templates` */
  readonly templates: AlimtalkTemplatesResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.publicTemplates = new AlimtalkPublicTemplatesResource(transport);
    this.templateCategories = new AlimtalkTemplateCategoriesResource(transport);
    this.templates = new AlimtalkTemplatesResource(transport);
  }
}

/**
 * `client.alimtalk.templates`.
 */
export class AlimtalkTemplatesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 알림톡 템플릿 조회
   *
   * 발신프로필 키와 템플릿 코드를 기준으로 알림톡 템플릿 상세 정보(검수 상태, 심사 의견 포함)를 조회합니다.
   *
   * `GET /api/comm/v1/center/alimtalk/template` (`getAlimtalkTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async get(params: GetAlimtalkTemplateParams): Promise<GetAlimtalkTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.getAlimtalkTemplate, params)) as GetAlimtalkTemplateResult;
  }

  /**
   * 알림톡 템플릿 등록
   *
   * 알림톡 템플릿을 등록합니다. 등록한 템플릿은 검수 요청(`POST /api/comm/v1/center/alimtalk/template/request`) 후 카카오 승인을 받아야 발송할 수 있습니다.
   * 이미지형·아이템리스트형 템플릿은 템플릿 이미지 업로드 API로 받은 `imgUrl`을 함께 넣습니다.
   *
   * `POST /api/comm/v1/center/alimtalk/template` (`createAlimtalkTemplate`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async create(params: CreateAlimtalkTemplateParams): Promise<CreateAlimtalkTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.createAlimtalkTemplate, params)) as CreateAlimtalkTemplateResult;
  }

  /**
   * 알림톡 템플릿 수정
   *
   * 등록된 알림톡 템플릿 정보를 수정합니다. 검수 상태와 카카오 정책에 따라 수정 가능한 범위가 달라질 수 있습니다. 대상 템플릿은 본문의 `senderKey`와 `templateCode`로 지정합니다.
   *
   * `PUT /api/comm/v1/center/alimtalk/template` (`updateAlimtalkTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async update(params: UpdateAlimtalkTemplateParams): Promise<UpdateAlimtalkTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateAlimtalkTemplate, params)) as UpdateAlimtalkTemplateResult;
  }

  /**
   * 알림톡 템플릿 목록 조회
   *
   * 발신프로필에 등록된 알림톡 템플릿 목록을 페이징 조회합니다. 카카오를 호출하지 않고 비즈고에 적재된 템플릿을 읽으므로 목록 화면이나 주기적인 동기화에 사용할 수 있습니다.
   *
   * `GET /api/comm/v1/center/alimtalk/template/list` (`listAlimtalkTemplates`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async list(params: ListAlimtalkTemplatesParams): Promise<ListAlimtalkTemplatesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listAlimtalkTemplates, params)) as ListAlimtalkTemplatesResult;
  }

  /**
   * Iterate over every item of `alimtalk.templates.list`, following `offset` (offset).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params: Omit<ListAlimtalkTemplatesParams, 'offset'>): AsyncGenerator<ListAlimtalkTemplatesItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listAlimtalkTemplates, params) as AsyncGenerator<ListAlimtalkTemplatesItem, void, undefined>;
  }

  /**
   * 최근 변경 알림톡 템플릿 조회
   *
   * 지정한 시각 이후 변경된 알림톡 템플릿 목록을 조회합니다. 템플릿 최신화나 내부 동기화 배치 기준으로 사용할 수 있습니다.
   *
   * `GET /api/comm/v1/center/alimtalk/template/lastModified` (`listModifiedAlimtalkTemplates`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async listModified(params: ListModifiedAlimtalkTemplatesParams): Promise<ListModifiedAlimtalkTemplatesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listModifiedAlimtalkTemplates, params)) as ListModifiedAlimtalkTemplatesResult;
  }

  /**
   * Iterate over every item of `alimtalk.templates.listModified`, following `page` (page).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterListModified(params: Omit<ListModifiedAlimtalkTemplatesParams, 'page'>): AsyncGenerator<ListModifiedAlimtalkTemplatesItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listModifiedAlimtalkTemplates, params) as AsyncGenerator<ListModifiedAlimtalkTemplatesItem, void, undefined>;
  }

  /**
   * 알림톡 템플릿 삭제
   *
   * 발신프로필 키와 템플릿 코드를 기준으로 알림톡 템플릿을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/alimtalk/template/senderKey/{senderKey}/templateCode/{templateCode}` (`deleteAlimtalkTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async delete(params: DeleteAlimtalkTemplateParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteAlimtalkTemplate, params)) as void;
  }

  /**
   * 알림톡 템플릿 검수 요청
   *
   * 등록된 알림톡 템플릿을 카카오 검수로 요청합니다. 템플릿 상태가 대기이고 검수 상태가 등록(`REG`)인 경우 요청할 수 있습니다.
   * - `application/json`: 첨부 없이 요청합니다. 템플릿 정보는 `alimtalk` 객체에 넣습니다.
   * - `multipart/form-data`: 파일을 첨부해 요청합니다. 필드를 최상위에 두며 `comment`가 필수입니다. 파일 형식은 png, jpg, jpeg, gif, pdf, hwp, doc, docx입니다.
   *
   * `POST /api/comm/v1/center/alimtalk/template/request` (`requestAlimtalkTemplateInspection`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async requestInspection(params: RequestAlimtalkTemplateInspectionParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.requestAlimtalkTemplateInspection, params)) as void;
  }

  /**
   * 알림톡 템플릿 검수 요청 취소
   *
   * 검수 요청된 알림톡 템플릿의 검수 요청을 취소합니다.
   *
   * `POST /api/comm/v1/center/alimtalk/template/request/cancel` (`cancelAlimtalkTemplateInspection`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async cancelInspection(params: CancelAlimtalkTemplateInspectionParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.cancelAlimtalkTemplateInspection, params)) as void;
  }
}

/**
 * `client.alimtalk.templateCategories`.
 */
export class AlimtalkTemplateCategoriesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 알림톡 템플릿 카테고리 조회
   *
   * 알림톡 템플릿 카테고리를 조회합니다. 문서는 같은 경로에 두 기능을 둡니다.
   * - `categoryCode` 없이 호출: 템플릿 카테고리 전체 목록(`data.data.categories`)
   * - `categoryCode`를 넣어 호출: 해당 카테고리 상세(`data.data.category`)
   *
   * `GET /api/comm/v1/center/alimtalk/category` (`listAlimtalkTemplateCategories`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async list(params?: ListAlimtalkTemplateCategoriesParams): Promise<ListAlimtalkTemplateCategoriesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listAlimtalkTemplateCategories, params)) as ListAlimtalkTemplateCategoriesResult;
  }
}

/**
 * `client.alimtalk.publicTemplates`.
 */
export class AlimtalkPublicTemplatesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 알림톡 공용템플릿 조회
   *
   * 카카오가 제공하는 공용템플릿 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/alimtalk/public/template` (`listAlimtalkPublicTemplates`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-alimtalk
   */
  async list(params?: ListAlimtalkPublicTemplatesParams): Promise<ListAlimtalkPublicTemplatesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listAlimtalkPublicTemplates, params)) as ListAlimtalkPublicTemplatesResult;
  }

  /**
   * Iterate over every item of `alimtalk.publicTemplates.list`, following `page` (page).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params?: Omit<ListAlimtalkPublicTemplatesParams, 'page'>): AsyncGenerator<ListAlimtalkPublicTemplatesItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listAlimtalkPublicTemplates, params) as AsyncGenerator<ListAlimtalkPublicTemplatesItem, void, undefined>;
  }
}

/**
 * `client.brandMessage`.
 */
export class BrandMessageResource {
  readonly #transport: Transport;
  /** `client.brandMessage.audience` */
  readonly audience: BrandMessageAudienceResource;
  /** `client.brandMessage.friendGroups` */
  readonly friendGroups: BrandMessageFriendGroupsResource;
  /** `client.brandMessage.groupSends` */
  readonly groupSends: BrandMessageGroupSendsResource;
  /** `client.brandMessage.groupTags` */
  readonly groupTags: BrandMessageGroupTagsResource;
  /** `client.brandMessage.marketingAgreements` */
  readonly marketingAgreements: BrandMessageMarketingAgreementsResource;
  /** `client.brandMessage.permissions` */
  readonly permissions: BrandMessagePermissionsResource;
  /** `client.brandMessage.templates` */
  readonly templates: BrandMessageTemplatesResource;
  /** `client.brandMessage.unsubscribeContents` */
  readonly unsubscribeContents: BrandMessageUnsubscribeContentsResource;
  /** `client.brandMessage.videos` */
  readonly videos: BrandMessageVideosResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.audience = new BrandMessageAudienceResource(transport);
    this.friendGroups = new BrandMessageFriendGroupsResource(transport);
    this.groupSends = new BrandMessageGroupSendsResource(transport);
    this.groupTags = new BrandMessageGroupTagsResource(transport);
    this.marketingAgreements = new BrandMessageMarketingAgreementsResource(transport);
    this.permissions = new BrandMessagePermissionsResource(transport);
    this.templates = new BrandMessageTemplatesResource(transport);
    this.unsubscribeContents = new BrandMessageUnsubscribeContentsResource(transport);
    this.videos = new BrandMessageVideosResource(transport);
  }
}

/**
 * `client.brandMessage.groupSends`.
 */
export class BrandMessageGroupSendsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 동보 발송 조회
   *
   * 발신프로필 키와 요청 아이디로 특정 동보 발송 요청의 상태를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupMessage` (`getBrandMessageGroupSend`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async get(params: GetBrandMessageGroupSendParams): Promise<GetBrandMessageGroupSendResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageGroupSend, params)) as GetBrandMessageGroupSendResult;
  }

  /**
   * 브랜드메시지 동보 발송
   *
   * 기본형 템플릿을 기준으로 친구 그룹 또는 전체 친구에게 동보 발송을 예약합니다. 템플릿은 변수가 없고 상태가 등록(`A`)이어야 합니다. 발송 수는 요청 시점의 친구 관계로 정해지고, 실제 발송 시점의 친구 관계에 따라 그 수 안에서 순차 발송됩니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupMessage` (`createBrandMessageGroupSend`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: send.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async create(params: CreateBrandMessageGroupSendParams): Promise<CreateBrandMessageGroupSendResult> {
    return (await callOperation(this.#transport, OPERATIONS.createBrandMessageGroupSend, params)) as CreateBrandMessageGroupSendResult;
  }

  /**
   * 브랜드메시지 동보 발송 재개
   *
   * 중지된 기본형 템플릿 동보 발송 요청을 다시 시작합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupMessage/resume` (`resumeBrandMessageGroupSend`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async resume(params: ResumeBrandMessageGroupSendParams): Promise<ResumeBrandMessageGroupSendResult> {
    return (await callOperation(this.#transport, OPERATIONS.resumeBrandMessageGroupSend, params)) as ResumeBrandMessageGroupSendResult;
  }

  /**
   * 브랜드메시지 동보 발송 중지
   *
   * 진행 중인 기본형 템플릿 동보 발송 요청을 일시 중지합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupMessage/pause` (`pauseBrandMessageGroupSend`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async pause(params: PauseBrandMessageGroupSendParams): Promise<PauseBrandMessageGroupSendResult> {
    return (await callOperation(this.#transport, OPERATIONS.pauseBrandMessageGroupSend, params)) as PauseBrandMessageGroupSendResult;
  }

  /**
   * 브랜드메시지 동보 발송 종료
   *
   * 예약 또는 진행 중인 기본형 템플릿 동보 발송 요청을 종료합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupMessage/terminate` (`terminateBrandMessageGroupSend`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async terminate(params: TerminateBrandMessageGroupSendParams): Promise<TerminateBrandMessageGroupSendResult> {
    return (await callOperation(this.#transport, OPERATIONS.terminateBrandMessageGroupSend, params)) as TerminateBrandMessageGroupSendResult;
  }
}

/**
 * `client.brandMessage.audience`.
 */
export class BrandMessageAudienceResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 발송 예상 모수 확인 (친구 그룹 기반)
   *
   * 메시지 타입과 친구 그룹 조건으로 동보 발송 예상 발송 수를 조회합니다. 친구 그룹을 쓰면 그룹 상태가 완료이고 등록 유저 수가 10 이상이어야 발송 예약이 가능하며, 친구 관계는 실시간으로 동기화됩니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupMessage/possible` (`checkBrandMessageAudiencePossible`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async checkPossible(params: CheckBrandMessageAudiencePossibleParams): Promise<CheckBrandMessageAudiencePossibleResult> {
    return (await callOperation(this.#transport, OPERATIONS.checkBrandMessageAudiencePossible, params)) as CheckBrandMessageAudiencePossibleResult;
  }

  /**
   * 발송 예상 모수 확인 (전화번호 명단 기반)
   *
   * 전화번호 명단으로 동보 발송 가능 예상 수를 조회합니다. 국가코드는 자동 정규화되고 유효한 번호로 모수를 계산합니다. 최소 10건이며, 하나라도 형식이 잘못되면 요청 전체가 거부됩니다. 상태를 바꾸지 않는 조회이므로 재시도해도 안전합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupMessage/friend/possible` (`checkBrandMessageAudiencePossibleByPhoneNumbers`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async checkPossibleByPhoneNumbers(params: CheckBrandMessageAudiencePossibleByPhoneNumbersParams): Promise<CheckBrandMessageAudiencePossibleByPhoneNumbersResult> {
    return (await callOperation(this.#transport, OPERATIONS.checkBrandMessageAudiencePossibleByPhoneNumbers, params)) as CheckBrandMessageAudiencePossibleByPhoneNumbersResult;
  }

  /**
   * 채널 전체 친구 수 조회
   *
   * 발신프로필 기준 친구 수를 조회합니다. 동보 발송 가능 대상 수를 미리 확인할 때 씁니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupMessage/friendCount` (`getBrandMessageFriendCount`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async getFriendCount(params: GetBrandMessageFriendCountParams): Promise<GetBrandMessageFriendCountResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageFriendCount, params)) as GetBrandMessageFriendCountResult;
  }

  /**
   * 동보 발송 예상 소요시간 조회
   *
   * 동보 발송 시작 시각과 대상 수로 예상 종료 시각과 소요 시간을 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupMessage/estimate` (`estimateBrandMessageGroupSendDuration`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async estimate(params: EstimateBrandMessageGroupSendDurationParams): Promise<EstimateBrandMessageGroupSendDurationResult> {
    return (await callOperation(this.#transport, OPERATIONS.estimateBrandMessageGroupSendDuration, params)) as EstimateBrandMessageGroupSendDurationResult;
  }
}

/**
 * `client.brandMessage.permissions`.
 */
export class BrandMessagePermissionsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 발송권한 신청 가능 여부 확인
   *
   * 발신프로필이 고객사 회원 대상 발송 권한을 신청할 수 있는 상태인지 확인합니다. `data.code`가 `A000`이면 신청 가능합니다. 고객사 회원 대상 발송(targeting M·N·O)에는 카카오 발송 권한이 필요합니다. 조건: 비즈니스 인증 채널, 등록된 채널 전화번호, 채널 친구 수 5만 이상, 업로드된 광고성 정보 수신동의 증적파일, 3개월 이내 알림톡 발송 이력. 어떤 조건이 미달인지는 응답으로 구분되지 않습니다.
   *
   * `GET /api/comm/v1/center/brandmessage/sendPermission` (`checkBrandMessageSendPermission`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async check(params: CheckBrandMessageSendPermissionParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.checkBrandMessageSendPermission, params)) as void;
  }

  /**
   * 브랜드메시지 발송권한 신청
   *
   * 고객사 회원 대상 발송(targeting M·N·O) 권한을 신청합니다. 권한은 톡채널 단위로 부여되므로 같은 톡채널을 쓰는 다른 딜러사의 발신프로필에도 함께 적용됩니다. 고객사 회원 대상 발송(targeting M·N·O)에는 카카오 발송 권한이 필요합니다. 조건: 비즈니스 인증 채널, 등록된 채널 전화번호, 채널 친구 수 5만 이상, 업로드된 광고성 정보 수신동의 증적파일, 3개월 이내 알림톡 발송 이력. 어떤 조건이 미달인지는 응답으로 구분되지 않습니다.
   *
   * `POST /api/comm/v1/center/brandmessage/sendPermission` (`applyBrandMessageSendPermission`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async apply(params: ApplyBrandMessageSendPermissionParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.applyBrandMessageSendPermission, params)) as void;
  }
}

/**
 * `client.brandMessage.videos`.
 */
export class BrandMessageVideosResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 동영상 업로드 등록
   *
   * 브랜드메시지에 쓸 동영상의 업로드를 등록하고 카카오 업로드 채널(`vid`, `uploadUrl`, `token`)을 발급받습니다. 파일은 이 API로 보내지 않고 `uploadUrl`로 직접 전송합니다(5분 안에). 전송 후 동영상 조회로 `status`가 `PUBLIC`인지 확인합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/video/upload/register` (`registerBrandMessageVideoUpload`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async registerUpload(params: RegisterBrandMessageVideoUploadParams): Promise<RegisterBrandMessageVideoUploadResult> {
    return (await callOperation(this.#transport, OPERATIONS.registerBrandMessageVideoUpload, params)) as RegisterBrandMessageVideoUploadResult;
  }

  /**
   * 브랜드메시지 기존 동영상 등록
   *
   * 카카오톡 채널에 이미 올라가 있는 동영상을 재업로드 없이 브랜드메시지 발송용으로 등록합니다. `vid` 또는 `videoUrl` 중 하나만 지정합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/video/register` (`registerBrandMessageExistingVideo`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async registerExisting(params: RegisterBrandMessageExistingVideoParams): Promise<RegisterBrandMessageExistingVideoResult> {
    return (await callOperation(this.#transport, OPERATIONS.registerBrandMessageExistingVideo, params)) as RegisterBrandMessageExistingVideoResult;
  }

  /**
   * 브랜드메시지 동영상 조회
   *
   * 동영상 식별자로 업로드된 동영상 한 건의 처리 상태와 메타 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/video` (`getBrandMessageVideo`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async get(params: GetBrandMessageVideoParams): Promise<GetBrandMessageVideoResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageVideo, params)) as GetBrandMessageVideoResult;
  }

  /**
   * 브랜드메시지 동영상 목록 조회
   *
   * 발신프로필 기준으로 업로드한 동영상 이력을 조회합니다. 등록일자로 거르고 `offset`·`limit`으로 페이징합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/video/list` (`listBrandMessageVideos`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async list(params: ListBrandMessageVideosParams): Promise<ListBrandMessageVideosResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageVideos, params)) as ListBrandMessageVideosResult;
  }

  /**
   * Iterate over every item of `brandMessage.videos.list`, following `offset` (offset).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params: Omit<ListBrandMessageVideosParams, 'offset'>): AsyncGenerator<ListBrandMessageVideosItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listBrandMessageVideos, params) as AsyncGenerator<ListBrandMessageVideosItem, void, undefined>;
  }
}

/**
 * `client.brandMessage.templates`.
 */
export class BrandMessageTemplatesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 템플릿 조회
   *
   * 발신프로필 키와 템플릿 코드로 브랜드메시지 템플릿 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/template` (`getBrandMessageTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async get(params: GetBrandMessageTemplateParams): Promise<GetBrandMessageTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageTemplate, params)) as GetBrandMessageTemplateResult;
  }

  /**
   * 브랜드메시지 템플릿 등록
   *
   * 브랜드메시지 템플릿을 등록합니다. 이미지가 필요한 유형은 이미지 업로드 API로 발급받은 `imgUrl`을 함께 씁니다.
   *
   * `POST /api/comm/v1/center/brandmessage/template` (`createBrandMessageTemplate`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async create(params: CreateBrandMessageTemplateParams): Promise<CreateBrandMessageTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.createBrandMessageTemplate, params)) as CreateBrandMessageTemplateResult;
  }

  /**
   * 브랜드메시지 템플릿 수정
   *
   * 등록된 브랜드메시지 템플릿을 수정합니다. 검수 상태와 카카오 정책에 따라 수정 가능한 범위가 달라질 수 있습니다.
   *
   * `PUT /api/comm/v1/center/brandmessage/template` (`updateBrandMessageTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async update(params: UpdateBrandMessageTemplateParams): Promise<UpdateBrandMessageTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateBrandMessageTemplate, params)) as UpdateBrandMessageTemplateResult;
  }

  /**
   * 브랜드메시지 템플릿 목록 조회
   *
   * 발신프로필(또는 그룹키)에 등록된 브랜드메시지 템플릿 목록을 페이징 조회합니다. 카카오를 호출하지 않고 비즈고에 적재된 템플릿을 읽으므로 목록 화면이나 주기적인 동기화에 쓸 수 있습니다.
   *
   * `GET /api/comm/v1/center/brandmessage/template/list` (`listBrandMessageTemplates`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async list(params: ListBrandMessageTemplatesParams): Promise<ListBrandMessageTemplatesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageTemplates, params)) as ListBrandMessageTemplatesResult;
  }

  /**
   * Iterate over every item of `brandMessage.templates.list`, following `offset` (offset).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params: Omit<ListBrandMessageTemplatesParams, 'offset'>): AsyncGenerator<ListBrandMessageTemplatesItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listBrandMessageTemplates, params) as AsyncGenerator<ListBrandMessageTemplatesItem, void, undefined>;
  }

  /**
   * 최근 변경 브랜드메시지 템플릿 조회
   *
   * 지정한 시각 이후 변경된 브랜드메시지 템플릿 목록을 조회합니다. 템플릿 최신화나 내부 동기화 배치에 씁니다.
   *
   * `GET /api/comm/v1/center/brandmessage/template/lastModified` (`listBrandMessageTemplatesLastModified`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async listLastModified(params: ListBrandMessageTemplatesLastModifiedParams): Promise<ListBrandMessageTemplatesLastModifiedResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageTemplatesLastModified, params)) as ListBrandMessageTemplatesLastModifiedResult;
  }

  /**
   * Iterate over every item of `brandMessage.templates.listLastModified`, following `page` (page).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterListLastModified(params: Omit<ListBrandMessageTemplatesLastModifiedParams, 'page'>): AsyncGenerator<ListBrandMessageTemplatesLastModifiedItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listBrandMessageTemplatesLastModified, params) as AsyncGenerator<ListBrandMessageTemplatesLastModifiedItem, void, undefined>;
  }

  /**
   * 브랜드메시지 템플릿 삭제
   *
   * 발신프로필 키와 템플릿 코드로 브랜드메시지 템플릿을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/brandmessage/template/senderKey/{senderKey}/templateCode/{templateCode}` (`deleteBrandMessageTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async delete(params: DeleteBrandMessageTemplateParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteBrandMessageTemplate, params)) as void;
  }
}

/**
 * `client.brandMessage.groupTags`.
 */
export class BrandMessageGroupTagsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 브랜드메시지 전체 그룹태그 조회
   *
   * 발신프로필 키로 브랜드메시지 전체 그룹태그 목록을 조회합니다. 그룹태그 키는 자유형 발송의 `groupTagKey`에 씁니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupTag/list` (`listBrandMessageGroupTags`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async list(params: ListBrandMessageGroupTagsParams): Promise<ListBrandMessageGroupTagsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageGroupTags, params)) as ListBrandMessageGroupTagsResult;
  }

  /**
   * 브랜드메시지 그룹태그 조회
   *
   * 발신프로필 키와 그룹태그 키로 그룹태그 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/groupTag` (`getBrandMessageGroupTag`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async get(params: GetBrandMessageGroupTagParams): Promise<GetBrandMessageGroupTagResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageGroupTag, params)) as GetBrandMessageGroupTagResult;
  }

  /**
   * 브랜드메시지 그룹태그 등록
   *
   * 브랜드메시지 그룹태그를 등록합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/groupTag` (`createBrandMessageGroupTag`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async create(params: CreateBrandMessageGroupTagParams): Promise<CreateBrandMessageGroupTagResult> {
    return (await callOperation(this.#transport, OPERATIONS.createBrandMessageGroupTag, params)) as CreateBrandMessageGroupTagResult;
  }

  /**
   * 브랜드메시지 그룹태그 수정
   *
   * 등록된 브랜드메시지 그룹태그 정보를 수정합니다.
   *
   * `PUT /api/comm/v1/center/brandmessage/groupTag` (`updateBrandMessageGroupTag`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async update(params: UpdateBrandMessageGroupTagParams): Promise<UpdateBrandMessageGroupTagResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateBrandMessageGroupTag, params)) as UpdateBrandMessageGroupTagResult;
  }

  /**
   * 브랜드메시지 그룹태그 삭제
   *
   * 발신프로필 키와 그룹태그 키로 그룹태그를 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/brandmessage/groupTag/senderKey/{senderKey}/groupTagKey/{groupTagKey}` (`deleteBrandMessageGroupTag`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async delete(params: DeleteBrandMessageGroupTagParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteBrandMessageGroupTag, params)) as void;
  }
}

/**
 * `client.brandMessage.friendGroups`.
 */
export class BrandMessageFriendGroupsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 친구 그룹 파일 업로드
   *
   * 전화번호 목록 파일(txt, csv)을 업로드해 친구 그룹 등록 또는 전화번호 추가·삭제에 쓸 임시 파일 키를 발급받습니다.
   *
   * `POST /api/comm/v1/center/brandmessage/friendGroup/file` (`uploadBrandMessageFriendGroupFile`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadFile(params: UploadBrandMessageFriendGroupFileParams): Promise<UploadBrandMessageFriendGroupFileResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageFriendGroupFile, params)) as UploadBrandMessageFriendGroupFileResult;
  }

  /**
   * 친구 그룹 조회
   *
   * 발신프로필 키와 친구 그룹 키로 친구 그룹 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/friendGroup` (`getBrandMessageFriendGroup`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async get(params: GetBrandMessageFriendGroupParams): Promise<GetBrandMessageFriendGroupResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageFriendGroup, params)) as GetBrandMessageFriendGroupResult;
  }

  /**
   * 친구 그룹 등록
   *
   * 친구 그룹을 생성합니다. `fileKey` 또는 `phoneNumbers`로 그룹에 넣을 전화번호를 함께 등록할 수 있습니다. 처리는 비동기이며 응답의 `status`는 `IN_PROGRESS`일 수 있습니다.
   *
   * `POST /api/comm/v1/center/brandmessage/friendGroup` (`createBrandMessageFriendGroup`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async create(params: CreateBrandMessageFriendGroupParams): Promise<CreateBrandMessageFriendGroupResult> {
    return (await callOperation(this.#transport, OPERATIONS.createBrandMessageFriendGroup, params)) as CreateBrandMessageFriendGroupResult;
  }

  /**
   * 친구 그룹 목록 조회
   *
   * 발신프로필 기준으로 등록된 친구 그룹 목록을 조회합니다. 문서에 페이징 파라미터가 없습니다.
   *
   * `GET /api/comm/v1/center/brandmessage/friendGroup/list` (`listBrandMessageFriendGroups`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async list(params: ListBrandMessageFriendGroupsParams): Promise<ListBrandMessageFriendGroupsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageFriendGroups, params)) as ListBrandMessageFriendGroupsResult;
  }

  /**
   * 친구 그룹 삭제
   *
   * 발신프로필 키와 친구 그룹 키로 친구 그룹을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/brandmessage/friendGroup/senderKey/{senderKey}/friendGroupKey/{friendGroupKey}` (`deleteBrandMessageFriendGroup`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async delete(params: DeleteBrandMessageFriendGroupParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteBrandMessageFriendGroup, params)) as void;
  }

  /**
   * 친구 그룹 내 전화번호 추가
   *
   * 기존 친구 그룹에 전화번호를 추가합니다. `fileKey` 또는 `phoneNumbers`로 입력합니다. 처리는 비동기이며 진행 상황은 전화번호 요청 조회로 확인합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/friendGroup/phoneNumber/update` (`addBrandMessageFriendGroupPhoneNumbers`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async addPhoneNumbers(params: AddBrandMessageFriendGroupPhoneNumbersParams): Promise<AddBrandMessageFriendGroupPhoneNumbersResult> {
    return (await callOperation(this.#transport, OPERATIONS.addBrandMessageFriendGroupPhoneNumbers, params)) as AddBrandMessageFriendGroupPhoneNumbersResult;
  }

  /**
   * 친구 그룹 내 전화번호 삭제
   *
   * 기존 친구 그룹에서 전화번호를 삭제합니다. `fileKey` 또는 `phoneNumbers`로 입력합니다. 처리는 비동기이며 진행 상황은 전화번호 요청 조회로 확인합니다.
   *
   * `POST /api/comm/v1/center/brandmessage/friendGroup/phoneNumber/delete` (`deleteBrandMessageFriendGroupPhoneNumbers`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async deletePhoneNumbers(params: DeleteBrandMessageFriendGroupPhoneNumbersParams): Promise<DeleteBrandMessageFriendGroupPhoneNumbersResult> {
    return (await callOperation(this.#transport, OPERATIONS.deleteBrandMessageFriendGroupPhoneNumbers, params)) as DeleteBrandMessageFriendGroupPhoneNumbersResult;
  }

  /**
   * 친구 그룹 전화번호 요청 목록 조회
   *
   * 친구 그룹 전화번호 추가·삭제 요청의 처리 상태를 목록으로 조회합니다. 다음 페이지는 이전 응답의 마지막 항목 `requestId`를 `lastRequestId`로 넘겨 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/friendGroup/phoneNumber/requests` (`listBrandMessageFriendGroupPhoneNumberRequests`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async listPhoneNumberRequests(params: ListBrandMessageFriendGroupPhoneNumberRequestsParams): Promise<ListBrandMessageFriendGroupPhoneNumberRequestsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listBrandMessageFriendGroupPhoneNumberRequests, params)) as ListBrandMessageFriendGroupPhoneNumberRequestsResult;
  }

  /**
   * Iterate over every item of `brandMessage.friendGroups.listPhoneNumberRequests`, following `lastRequestId` (cursor).
   * `hasNext`가 false이거나 커서가 없거나 움직이지 않으면 멈춥니다.
   */
  iterListPhoneNumberRequests(params: Omit<ListBrandMessageFriendGroupPhoneNumberRequestsParams, 'lastRequestId'>): AsyncGenerator<ListBrandMessageFriendGroupPhoneNumberRequestsItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listBrandMessageFriendGroupPhoneNumberRequests, params) as AsyncGenerator<ListBrandMessageFriendGroupPhoneNumberRequestsItem, void, undefined>;
  }

  /**
   * 친구 그룹 전화번호 요청 단건 조회
   *
   * 전화번호 추가·삭제 응답으로 받은 `requestId`로 해당 요청의 처리 상태를 조회합니다.
   *
   * `GET /api/comm/v1/center/brandmessage/friendGroup/phoneNumber/request` (`getBrandMessageFriendGroupPhoneNumberRequest`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async getPhoneNumberRequest(params: GetBrandMessageFriendGroupPhoneNumberRequestParams): Promise<GetBrandMessageFriendGroupPhoneNumberRequestResult> {
    return (await callOperation(this.#transport, OPERATIONS.getBrandMessageFriendGroupPhoneNumberRequest, params)) as GetBrandMessageFriendGroupPhoneNumberRequestResult;
  }
}

/**
 * `client.brandMessage.marketingAgreements`.
 */
export class BrandMessageMarketingAgreementsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 광고성 정보 수신동의 증적자료 파일 업로드
   *
   * 광고성 정보 수신동의를 입증하는 증적자료 파일을 업로드합니다. 파일은 발신프로필 기준으로 관리되며, 발송권한 신청 조건 중 하나입니다.
   *
   * `POST /api/comm/v1/center/brandmessage/marketingAgree` (`uploadBrandMessageMarketingAgreeEvidence`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async uploadEvidence(params: UploadBrandMessageMarketingAgreeEvidenceParams): Promise<UploadBrandMessageMarketingAgreeEvidenceResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadBrandMessageMarketingAgreeEvidence, params)) as UploadBrandMessageMarketingAgreeEvidenceResult;
  }
}

/**
 * `client.brandMessage.unsubscribeContents`.
 */
export class BrandMessageUnsubscribeContentsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 발신프로필 무료수신거부 정보 입력
   *
   * 발신프로필의 무료수신거부 전화번호와 인증번호를 등록합니다. 광고성 메시지 하단의 무료수신거부 안내에 씁니다.
   *
   * `POST /api/comm/v1/center/brandmessage/unSubscribeContent` (`registerBrandMessageUnsubscribeContent`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-brand
   */
  async register(params: RegisterBrandMessageUnsubscribeContentParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.registerBrandMessageUnsubscribeContent, params)) as void;
  }
}

/**
 * `client.rcs`.
 */
export class RcsResource {
  readonly #transport: Transport;
  /** `client.rcs.brands` */
  readonly brands: RcsBrandsResource;
  /** `client.rcs.chatbots` */
  readonly chatbots: RcsChatbotsResource;
  /** `client.rcs.commonFormats` */
  readonly commonFormats: RcsCommonFormatsResource;
  /** `client.rcs.templateForms` */
  readonly templateForms: RcsTemplateFormsResource;
  /** `client.rcs.templateImages` */
  readonly templateImages: RcsTemplateImagesResource;
  /** `client.rcs.templates` */
  readonly templates: RcsTemplatesResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.brands = new RcsBrandsResource(transport);
    this.chatbots = new RcsChatbotsResource(transport);
    this.commonFormats = new RcsCommonFormatsResource(transport);
    this.templateForms = new RcsTemplateFormsResource(transport);
    this.templateImages = new RcsTemplateImagesResource(transport);
    this.templates = new RcsTemplatesResource(transport);
  }
}

/**
 * `client.rcs.brands`.
 */
export class RcsBrandsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 브랜드 상세 조회
   *
   * brandId 기준으로 RCS 브랜드 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/brand` (`getRcsBrand`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsBrandParams): Promise<GetRcsBrandResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsBrand, params)) as GetRcsBrandResult;
  }

  /**
   * RCS 브랜드 수정
   *
   * 브랜드 기본 정보와 브랜드 이미지를 수정합니다. `multipart/form-data`로 보내며,
   * `regBrand`는 JSON 문자열 파트, 이미지·증빙 파일은 바이너리 파트입니다.
   * 파일 스트림을 다시 보내야 하고 검수 요청이 다시 걸릴 수 있으므로 SDK는 429만 재시도합니다.
   *
   * `PUT /api/comm/v1/center/rcs/brand` (`updateRcsBrand`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async update(params: UpdateRcsBrandParams): Promise<UpdateRcsBrandResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateRcsBrand, params)) as UpdateRcsBrandResult;
  }
}

/**
 * `client.rcs.chatbots`.
 */
export class RcsChatbotsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 대화방 목록 조회
   *
   * 브랜드 ID를 기준으로 등록된 RCS 대화방 목록을 조회합니다. 대화방(챗봇)은 브랜드에 속해 실제로 메시지를 주고받는 단위입니다.
   *
   * `GET /api/comm/v1/center/rcs/chatbot/list` (`listRcsChatbots`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async list(params: ListRcsChatbotsParams): Promise<ListRcsChatbotsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listRcsChatbots, params)) as ListRcsChatbotsResult;
  }

  /**
   * Iterate over every item of `rcs.chatbots.list`, following `offset` (offset).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params: Omit<ListRcsChatbotsParams, 'offset'>): AsyncGenerator<ListRcsChatbotsItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listRcsChatbots, params) as AsyncGenerator<ListRcsChatbotsItem, void, undefined>;
  }

  /**
   * RCS 대화방 상세 조회
   *
   * 브랜드 ID와 대화방 ID를 기준으로 RCS 대화방 상세 정보를 조회합니다. 결과는 `data.data.rcs.chatbot` 배열로 돌아옵니다.
   *
   * `GET /api/comm/v1/center/rcs/chatbot` (`getRcsChatbot`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsChatbotParams): Promise<GetRcsChatbotResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsChatbot, params)) as GetRcsChatbotResult;
  }

  /**
   * RCS 대화방 수정
   *
   * 등록된 RCS 대화방 정보를 수정합니다. `multipart/form-data`로 보내며, 대화방 정보(`chatbot`)는 JSON 문자열,
   * 부가번호 증명 서류(`subNumCertificate`)는 파일로 함께 보냅니다.
   * 파일 스트림을 다시 보내야 하고 검수 요청이 다시 걸릴 수 있으므로 SDK는 429만 재시도합니다.
   *
   * `PUT /api/comm/v1/center/rcs/chatbot` (`updateRcsChatbot`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async update(params: UpdateRcsChatbotParams): Promise<UpdateRcsChatbotResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateRcsChatbot, params)) as UpdateRcsChatbotResult;
  }

  /**
   * RCS 대화방 승인 취소
   *
   * 승인 진행 중인 RCS 대화방의 승인 요청을 취소합니다.
   *
   * `PUT /api/comm/v1/center/rcs/brandId/{brandId}/chatbotId/{chatbotId}/cancel` (`cancelRcsChatbotApproval`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async cancel(params: CancelRcsChatbotApprovalParams): Promise<CancelRcsChatbotApprovalResult> {
    return (await callOperation(this.#transport, OPERATIONS.cancelRcsChatbotApproval, params)) as CancelRcsChatbotApprovalResult;
  }

  /**
   * RCS 대화방 삭제
   *
   * 등록된 RCS 대화방을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/rcs/brandId/{brandId}/chatbotId/{chatbotId}` (`deleteRcsChatbot`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async delete(params: DeleteRcsChatbotParams): Promise<DeleteRcsChatbotResult> {
    return (await callOperation(this.#transport, OPERATIONS.deleteRcsChatbot, params)) as DeleteRcsChatbotResult;
  }

  /**
   * RCS 대화방 사용 가능 쿼리 조회
   *
   * 대화방 ID를 기준으로 해당 대화방에서 사용할 수 있는 쿼리 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/usableQuery/chatbotId/{chatbotId}` (`getRcsChatbotUsableQueries`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async getUsableQueries(params: GetRcsChatbotUsableQueriesParams): Promise<GetRcsChatbotUsableQueriesResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsChatbotUsableQueries, params)) as GetRcsChatbotUsableQueriesResult;
  }
}

/**
 * `client.rcs.commonFormats`.
 */
export class RcsCommonFormatsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 공통 포맷 목록 조회
   *
   * RCS에서 사용할 수 있는 공통 포맷 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/common/list` (`listRcsCommonFormats`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async list(): Promise<ListRcsCommonFormatsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listRcsCommonFormats, undefined)) as ListRcsCommonFormatsResult;
  }

  /**
   * RCS 공통 포맷 상세 조회
   *
   * 메시지베이스 ID를 기준으로 RCS 공통 포맷 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/common` (`getRcsCommonFormat`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsCommonFormatParams): Promise<GetRcsCommonFormatResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsCommonFormat, params)) as GetRcsCommonFormatResult;
  }
}

/**
 * `client.rcs.templateForms`.
 */
export class RcsTemplateFormsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 템플릿 양식 목록 조회
   *
   * RCS 템플릿 등록에 사용할 수 있는 템플릿 양식 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/messagebaseform/list` (`listRcsTemplateForms`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async list(params?: ListRcsTemplateFormsParams): Promise<ListRcsTemplateFormsResult> {
    return (await callOperation(this.#transport, OPERATIONS.listRcsTemplateForms, params)) as ListRcsTemplateFormsResult;
  }

  /**
   * Iterate over every item of `rcs.templateForms.list`, following `offset` (offset).
   * 받은 항목이 0개이거나 요청한(또는 첫 페이지) 크기보다 적거나, `total`에 도달하거나 `hasNext`가 false이면 멈춥니다.
   */
  iterList(params?: Omit<ListRcsTemplateFormsParams, 'offset'>): AsyncGenerator<ListRcsTemplateFormsItem, void, undefined> {
    return iterateOperation(this.#transport, OPERATIONS.listRcsTemplateForms, params) as AsyncGenerator<ListRcsTemplateFormsItem, void, undefined>;
  }

  /**
   * RCS 템플릿 양식 상세 조회
   *
   * 템플릿 양식 ID를 기준으로 템플릿 양식 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/messagebaseform` (`getRcsTemplateForm`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsTemplateFormParams): Promise<GetRcsTemplateFormResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsTemplateForm, params)) as GetRcsTemplateFormResult;
  }
}

/**
 * `client.rcs.templates`.
 */
export class RcsTemplatesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 템플릿 목록 조회
   *
   * 브랜드 ID를 기준으로 등록된 RCS 템플릿 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/list` (`listRcsTemplates`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async list(): Promise<ListRcsTemplatesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listRcsTemplates, undefined)) as ListRcsTemplatesResult;
  }

  /**
   * RCS 템플릿 상세 조회
   *
   * 메시지베이스 ID를 기준으로 등록된 RCS 템플릿 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase` (`getRcsTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsTemplateParams): Promise<GetRcsTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsTemplate, params)) as GetRcsTemplateResult;
  }

  /**
   * RCS 템플릿 등록
   *
   * 브랜드에 RCS 템플릿을 등록합니다. 응답의 `messagebaseId`를 발송 시 `formatId` 필드에 넣습니다(영문 문서 기준).
   *
   * `POST /api/comm/v1/center/rcs/messagebase` (`createRcsTemplate`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async create(params: CreateRcsTemplateParams): Promise<CreateRcsTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.createRcsTemplate, params)) as CreateRcsTemplateResult;
  }

  /**
   * RCS 템플릿 수정
   *
   * 등록된 RCS 템플릿 정보를 수정합니다.
   *
   * `PUT /api/comm/v1/center/rcs/messagebase` (`updateRcsTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async update(params: UpdateRcsTemplateParams): Promise<UpdateRcsTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.updateRcsTemplate, params)) as UpdateRcsTemplateResult;
  }

  /**
   * RCS 템플릿 승인 취소
   *
   * 승인 진행 중인 RCS 템플릿의 승인 요청을 취소합니다.
   *
   * `PUT /api/comm/v1/center/rcs/brandId/{brandId}/messagebaseId/{messagebaseId}/cancel` (`cancelRcsTemplateApproval`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async cancel(params: CancelRcsTemplateApprovalParams): Promise<CancelRcsTemplateApprovalResult> {
    return (await callOperation(this.#transport, OPERATIONS.cancelRcsTemplateApproval, params)) as CancelRcsTemplateApprovalResult;
  }

  /**
   * RCS 템플릿 삭제
   *
   * 등록된 RCS 템플릿을 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/rcs/brandId/{brandId}/messagebaseId/{messagebaseId}` (`deleteRcsTemplate`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async delete(params: DeleteRcsTemplateParams): Promise<DeleteRcsTemplateResult> {
    return (await callOperation(this.#transport, OPERATIONS.deleteRcsTemplate, params)) as DeleteRcsTemplateResult;
  }
}

/**
 * `client.rcs.templateImages`.
 */
export class RcsTemplateImagesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * RCS 템플릿 이미지 상세 조회
   *
   * 브랜드 ID와 템플릿 파일 ID를 기준으로 템플릿 이미지 상세 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/file` (`getRcsTemplateImage`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async get(params: GetRcsTemplateImageParams): Promise<GetRcsTemplateImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.getRcsTemplateImage, params)) as GetRcsTemplateImageResult;
  }

  /**
   * RCS 템플릿 이미지 등록
   *
   * RCS 템플릿 등록에 사용할 이미지를 업로드하고 템플릿 파일 ID를 발급받습니다.
   * 발송용 이미지 업로드(`/api/comm/v1/file/rcs`)와는 다른 API입니다.
   *
   * `POST /api/comm/v1/center/rcs/messagebase/file` (`uploadRcsTemplateImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async upload(params: UploadRcsTemplateImageParams): Promise<UploadRcsTemplateImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadRcsTemplateImage, params)) as UploadRcsTemplateImageResult;
  }

  /**
   * RCS 템플릿 양식 로고 이미지 조회
   *
   * 템플릿 양식 ID를 기준으로 템플릿 양식에서 사용할 수 있는 로고 이미지 목록을 조회합니다.
   *
   * `GET /api/comm/v1/center/rcs/messagebase/messagebaseform/logo` (`listRcsTemplateFormLogos`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/rcs
   */
  async listFormLogos(params: ListRcsTemplateFormLogosParams): Promise<ListRcsTemplateFormLogosResult> {
    return (await callOperation(this.#transport, OPERATIONS.listRcsTemplateFormLogos, params)) as ListRcsTemplateFormLogosResult;
  }
}

/**
 * `client.counsel`.
 */
export class CounselResource {
  readonly #transport: Transport;
  /** `client.counsel.certs` */
  readonly certs: CounselCertsResource;
  /** `client.counsel.channels` */
  readonly channels: CounselChannelsResource;
  /** `client.counsel.consultTime` */
  readonly consultTime: CounselConsultTimeResource;
  /** `client.counsel.files` */
  readonly files: CounselFilesResource;
  /** `client.counsel.messages` */
  readonly messages: CounselMessagesResource;
  /** `client.counsel.sessions` */
  readonly sessions: CounselSessionsResource;
  /** `client.counsel.systemMessages` */
  readonly systemMessages: CounselSystemMessagesResource;
  /** `client.counsel.users` */
  readonly users: CounselUsersResource;

  constructor(transport: Transport) {
    this.#transport = transport;
    this.certs = new CounselCertsResource(transport);
    this.channels = new CounselChannelsResource(transport);
    this.consultTime = new CounselConsultTimeResource(transport);
    this.files = new CounselFilesResource(transport);
    this.messages = new CounselMessagesResource(transport);
    this.sessions = new CounselSessionsResource(transport);
    this.systemMessages = new CounselSystemMessagesResource(transport);
    this.users = new CounselUsersResource(transport);
  }
}

/**
 * `client.counsel.messages`.
 */
export class CounselMessagesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 상담톡 Plain 메시지 발송
   *
   * 상담톡 Plain 메시지(TEXT, IMAGE, VIDEO, AUDIO, FILE)를 발송합니다.
   *
   * `POST /api/comm/v1/cstalk/plain` (`sendCounselPlain`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: send.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async sendPlain(params: SendCounselPlainParams): Promise<SendCounselPlainResult> {
    return (await callOperation(this.#transport, OPERATIONS.sendCounselPlain, params)) as SendCounselPlainResult;
  }

  /**
   * 상담톡 Rich 메시지 발송
   *
   * 상담톡 Rich 메시지(TEXT, IMAGE, WIDE, ITEM_LIST, WIDE_ITEM_LIST, CAROUSEL_FEED, PERSONAL)를 발송합니다.
   * `KAKAO_CERT`(본인인증) 발송은 채널이 본인인증 화이트리스트에 사전 등록되어 있어야 하며, 결과는 `counselCertResult` 웹훅으로 옵니다.
   *
   * `POST /api/comm/v1/cstalk/rich` (`sendCounselRich`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: send.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async sendRich(params: SendCounselRichParams): Promise<SendCounselRichResult> {
    return (await callOperation(this.#transport, OPERATIONS.sendCounselRich, params)) as SendCounselRichResult;
  }

  /**
   * 상담 메시지 삭제
   *
   * 이미 발송된 상담톡 메시지를 삭제합니다. 삭제한 메시지는 복구할 수 없습니다.
   * 응답 코드: `A000` 삭제 성공, `A502` 발신프로필 미등록·`senderKey`/`msgKey` 오류·소유자 불일치, `A507` `userKey` 오류, `A822` 삭제 불가 상태, `A213` 그 외 처리 실패.
   *
   * `POST /api/comm/v1/center/cstalk/chat/delete` (`deleteCounselMessage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async delete(params: DeleteCounselMessageParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteCounselMessage, params)) as void;
  }
}

/**
 * `client.counsel.sessions`.
 */
export class CounselSessionsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 상담 종료
   *
   * 현재 열려 있는 상담 세션을 종료합니다. 처리 결과는 발송 결과 웹훅(`counselResult`, requestType `end`)으로도 전달됩니다.
   *
   * `POST /api/comm/v1/cstalk/end` (`endCounselSession`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async end(params: EndCounselSessionParams): Promise<EndCounselSessionResult> {
    return (await callOperation(this.#transport, OPERATIONS.endCounselSession, params)) as EndCounselSessionResult;
  }

  /**
   * 상담 종료 및 봇 전환
   *
   * 상담 세션을 종료한 뒤 봇 이벤트 말블록을 실행합니다. 처리 결과는 발송 결과 웹훅(`counselResult`, requestType `endwithbot`)으로도 전달됩니다.
   *
   * `POST /api/comm/v1/cstalk/endWithBot` (`endCounselSessionWithBot`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async endWithBot(params: EndCounselSessionWithBotParams): Promise<EndCounselSessionWithBotResult> {
    return (await callOperation(this.#transport, OPERATIONS.endCounselSessionWithBot, params)) as EndCounselSessionWithBotResult;
  }

  /**
   * 세션 조회
   *
   * 사용자 키 기준으로 현재 상담 세션 정보를 조회합니다.
   *
   * `GET /api/comm/v1/center/cstalk/session` (`getCounselSession`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async get(params: GetCounselSessionParams): Promise<GetCounselSessionResult> {
    return (await callOperation(this.#transport, OPERATIONS.getCounselSession, params)) as GetCounselSessionResult;
  }
}

/**
 * `client.counsel.users`.
 */
export class CounselUsersResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 사용자 수신 차단
   *
   * 특정 사용자의 상담톡 수신을 차단합니다. 차단하면 해당 사용자의 상담 세션도 종료됩니다.
   *
   * `POST /api/comm/v1/center/cstalk/profile/user/block` (`blockCounselUser`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async block(params: BlockCounselUserParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.blockCounselUser, params)) as void;
  }

  /**
   * 사용자 수신 차단 해제
   *
   * 차단된 사용자의 상담톡 수신 차단을 해제합니다.
   *
   * `POST /api/comm/v1/center/cstalk/profile/user/unblock` (`unblockCounselUser`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async unblock(params: UnblockCounselUserParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.unblockCounselUser, params)) as void;
  }
}

/**
 * `client.counsel.certs`.
 */
export class CounselCertsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 카카오톡 인증 상태 조회
   *
   * 인증 트랜잭션 ID로 사용자의 카카오톡 인증(전자서명) 진행 상태를 조회합니다. 최종 결과(암호화된 인증정보)는 `counselCertResult` 웹훅으로 받습니다.
   *
   * `GET /api/comm/v1/center/cstalk/cert/status` (`getCounselCertStatus`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async get(params: GetCounselCertStatusParams): Promise<GetCounselCertStatusResult> {
    return (await callOperation(this.#transport, OPERATIONS.getCounselCertStatus, params)) as GetCounselCertStatusResult;
  }
}

/**
 * `client.counsel.files`.
 */
export class CounselFilesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 상담톡 이미지 업로드
   *
   * 상담톡 이미지(jpg, png, gif, 최대 5MB)를 올리고 `imgUrl`을 받습니다. Rich 메시지용은 `imageType=rich`로 올립니다.
   *
   * `POST /api/comm/v1/file/cstalk/image` (`uploadCounselImage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async uploadImage(params: UploadCounselImageParams): Promise<UploadCounselImageResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadCounselImage, params)) as UploadCounselImageResult;
  }

  /**
   * 상담톡 파일 업로드
   *
   * 상담톡 FILE·AUDIO·VIDEO 타입 첨부 파일을 올리고 `fileUrl`을 받습니다. 운영은 최대 300MB, 샌드박스는 최대 10MB입니다.
   *
   * `POST /api/comm/v1/file/cstalk` (`uploadCounselFile`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async upload(params: UploadCounselFileParams): Promise<UploadCounselFileResult> {
    return (await callOperation(this.#transport, OPERATIONS.uploadCounselFile, params)) as UploadCounselFileResult;
  }
}

/**
 * `client.counsel.channels`.
 */
export class CounselChannelsResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 상담톡 이용 활성화
   *
   * 발신프로필의 상담톡 이용을 활성화합니다.
   *
   * `POST /api/comm/v1/center/cstalk/sender/activate` (`activateCounsel`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async activate(params: ActivateCounselParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.activateCounsel, params)) as void;
  }

  /**
   * 상담톡 이용 비활성화
   *
   * 발신프로필의 상담톡 이용을 비활성화합니다. 해지하면 저장된 상담시간이 삭제됩니다.
   *
   * `POST /api/comm/v1/center/cstalk/sender/deactivate` (`deactivateCounsel`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async deactivate(params: DeactivateCounselParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deactivateCounsel, params)) as void;
  }

  /**
   * 채팅 기능 활성화
   *
   * 카카오톡 채널의 채팅 기능을 활성화합니다.
   *
   * `POST /api/comm/v1/center/cstalk/sender/chat/activate` (`activateCounselChat`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async activateChat(params: ActivateCounselChatParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.activateCounselChat, params)) as void;
  }

  /**
   * 채팅 기능 비활성화
   *
   * 카카오톡 채널의 채팅 기능을 비활성화합니다.
   *
   * `POST /api/comm/v1/center/cstalk/sender/chat/deactivate` (`deactivateCounselChat`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async deactivateChat(params: DeactivateCounselChatParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deactivateCounselChat, params)) as void;
  }
}

/**
 * `client.counsel.consultTime`.
 */
export class CounselConsultTimeResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 상담시간 조회
   *
   * 상담 운영 시간(요일별)을 조회합니다.
   *
   * `GET /api/comm/v1/center/cstalk/consult/time` (`getCounselConsultTime`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async get(params: GetCounselConsultTimeParams): Promise<GetCounselConsultTimeResult> {
    return (await callOperation(this.#transport, OPERATIONS.getCounselConsultTime, params)) as GetCounselConsultTimeResult;
  }

  /**
   * 상담시간 저장
   *
   * 카카오톡 채널의 상담시간을 저장합니다. 한 번 등록하면 수정만 가능하며, 상담톡 이용을 해지하면 삭제됩니다.
   * 상담시간은 카카오톡 채널 홈에 노출되며, 확인하려면 채팅 기능이 활성화되어 있어야 합니다.
   *
   * `POST /api/comm/v1/center/cstalk/consult/time` (`saveCounselConsultTime`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async save(params: SaveCounselConsultTimeParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.saveCounselConsultTime, params)) as void;
  }
}

/**
 * `client.counsel.systemMessages`.
 */
export class CounselSystemMessagesResource {
  readonly #transport: Transport;

  constructor(transport: Transport) {
    this.#transport = transport;
  }

  /**
   * 시스템 메시지 조회
   *
   * 시스템 메시지 목록을 조회합니다. `id`를 주면 해당 메시지만 조회합니다. 페이지네이션은 문서에 없습니다.
   *
   * `GET /api/comm/v1/center/cstalk/system/message` (`listCounselSystemMessages`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async list(params: ListCounselSystemMessagesParams): Promise<ListCounselSystemMessagesResult> {
    return (await callOperation(this.#transport, OPERATIONS.listCounselSystemMessages, params)) as ListCounselSystemMessagesResult;
  }

  /**
   * 시스템 메시지 등록
   *
   * 시스템 메시지를 등록합니다.
   *
   * `POST /api/comm/v1/center/cstalk/system/message` (`createCounselSystemMessage`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async create(params: CreateCounselSystemMessageParams): Promise<CreateCounselSystemMessageResult> {
    return (await callOperation(this.#transport, OPERATIONS.createCounselSystemMessage, params)) as CreateCounselSystemMessageResult;
  }

  /**
   * 시스템 메시지 삭제
   *
   * 시스템 메시지를 삭제합니다.
   *
   * `DELETE /api/comm/v1/center/cstalk/system/message/senderKey/{senderKey}/id/{id}` (`deleteCounselSystemMessage`). 재시도: safe (429·5xx·네트워크 오류). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async delete(params: DeleteCounselSystemMessageParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.deleteCounselSystemMessage, params)) as void;
  }

  /**
   * 시스템 메시지 검수 요청
   *
   * 시스템 메시지 검수를 요청합니다.
   *
   * `POST /api/comm/v1/center/cstalk/system/message/approval/request` (`requestCounselSystemMessageApproval`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async requestApproval(params: RequestCounselSystemMessageApprovalParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.requestCounselSystemMessageApproval, params)) as void;
  }

  /**
   * 시스템 메시지 검수 취소
   *
   * 시스템 메시지 검수 요청을 취소합니다.
   *
   * `POST /api/comm/v1/center/cstalk/system/message/approval/cancel` (`cancelCounselSystemMessageApproval`). 재시도: rateLimitOnly (429만). 속도 제한 버킷: other.
   * @see https://developers.bizgo.io/api-sdk/api-reference/comm/kakao-counsel
   */
  async cancelApproval(params: CancelCounselSystemMessageApprovalParams): Promise<void> {
    return (await callOperation(this.#transport, OPERATIONS.cancelCounselSystemMessageApproval, params)) as void;
  }
}

/** Resources generated from the spec. {@link Bizgo} extends this and adds the hand-written ones (send, files, reports, messages). */
export class GeneratedClient {
  /** `client.alimtalk` */
  readonly alimtalk: AlimtalkResource;
  /** `client.brandMessage` */
  readonly brandMessage: BrandMessageResource;
  /** `client.counsel` */
  readonly counsel: CounselResource;
  /** `client.insights` */
  readonly insights: InsightsResource;
  /** `client.kakao` */
  readonly kakao: KakaoResource;
  /** `client.rcs` */
  readonly rcs: RcsResource;
  /** `client.reservations` */
  readonly reservations: ReservationsResource;

  constructor(transport: Transport) {
    this.alimtalk = new AlimtalkResource(transport);
    this.brandMessage = new BrandMessageResource(transport);
    this.counsel = new CounselResource(transport);
    this.insights = new InsightsResource(transport);
    this.kakao = new KakaoResource(transport);
    this.rcs = new RcsResource(transport);
    this.reservations = new ReservationsResource(transport);
  }
}
