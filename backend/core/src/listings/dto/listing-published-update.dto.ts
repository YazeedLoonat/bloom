import { AddressUpdateDto } from "../../shared/dto/address.dto"
import { Expose, Type } from "class-transformer"
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsDefined,
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  ValidateNested,
  IsBoolean,
  IsPhoneNumber,
} from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { UnitUpdateDto } from "../../units/dto/unit.dto"
import { ListingUpdateDto } from "./listing-update.dto"
import { ListingReviewOrder } from "../types/listing-review-order-enum"
import { OmitType } from "@nestjs/swagger"
import { AssetUpdateDto } from "../../assets/dto/asset.dto"

export class ListingPublishedUpdateDto extends OmitType(ListingUpdateDto, [
  "assets",
  "buildingAddress",
  "depositMax",
  "depositMin",
  "developer",
  "digitalApplication",
  "image",
  "isWaitlistOpen",
  "leasingAgentEmail",
  "leasingAgentName",
  "leasingAgentPhone",
  "name",
  "paperApplication",
  "referralOpportunity",
  "rentalAssistance",
  "reviewOrderType",
  "units",
] as const) {
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => AssetUpdateDto)
  assets: AssetUpdateDto[]

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AddressUpdateDto)
  buildingAddress: AddressUpdateDto

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  depositMin: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  depositMax: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  developer: string

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  digitalApplication: boolean

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => AssetUpdateDto)
  image: AssetUpdateDto

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  isWaitlistOpen: boolean

  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  leasingAgentEmail: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  leasingAgentName: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @IsPhoneNumber("US", { groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  leasingAgentPhone: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  name: string

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  paperApplication: boolean

  @Expose()
  @IsBoolean({ groups: [ValidationsGroupsEnum.default] })
  referralOpportunity: boolean

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(4096, { groups: [ValidationsGroupsEnum.default] })
  rentalAssistance: string

  @Expose()
  @IsEnum(ListingReviewOrder, { groups: [ValidationsGroupsEnum.default] })
  reviewOrderType: ListingReviewOrder

  @Expose()
  @IsDefined({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @ArrayMinSize(1, { groups: [ValidationsGroupsEnum.default] })
  @ArrayMaxSize(256, { groups: [ValidationsGroupsEnum.default] })
  @Type(() => UnitUpdateDto)
  units: UnitUpdateDto[]
}
