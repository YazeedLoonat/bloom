import { Column, Entity, ManyToOne } from "typeorm"
import { Expose, Type } from "class-transformer"
import { IsOptional, IsString, MaxLength, ValidateNested } from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { AbstractEntity } from "../../shared/entities/abstract.entity"
import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"

@Entity({ name: "reserved_community_types" })
export class ReservedCommunityType extends AbstractEntity {
  @Column({ type: "text" })
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  name: string

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(2048, { groups: [ValidationsGroupsEnum.default] })
  description?: string | null

  @ManyToOne(() => Jurisdiction, { eager: true, nullable: true })
  @Expose()
  @ValidateNested({ groups: [ValidationsGroupsEnum.default] })
  @Type(() => Jurisdiction)
  jurisdiction: Jurisdiction
}
