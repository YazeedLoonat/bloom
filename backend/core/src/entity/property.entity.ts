import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Expose, Type } from "class-transformer"
import { IsDate, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator"
import { Listing } from "./listing.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Unit, UnitsSummarized } from "./unit.entity"
import { transformUnits } from "../lib/unit_transformations"
import { PropertyGroup } from "./property-group.entity"
import { AmiChart } from "./ami-chart.entity"
import { Address } from "../shared/entities/address.entity"

@Entity()
export class Property {
  @PrimaryGeneratedColumn("uuid")
  @Expose()
  @IsString()
  @IsUUID()
  id: string

  @CreateDateColumn()
  @Expose()
  @IsDate()
  createdAt: Date

  @UpdateDateColumn()
  @Expose()
  @IsDate()
  updatedAt: Date

  @OneToMany(() => Unit, (unit) => unit.property, { eager: true })
  units: Unit[]

  @OneToMany(() => Listing, (listing) => listing.property)
  listings: Listing[]

  @ManyToMany(() => PropertyGroup)
  propertyGroups: PropertyGroup[]

  @ManyToOne(() => AmiChart, (amiChart) => amiChart.properties, { eager: true, nullable: true })
  amiChart: AmiChart | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  accessibility: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  amenities: string | null

  @Column({ type: "jsonb", nullable: true })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  buildingAddress: Address | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  buildingTotalUnits: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  developer: string | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  householdSizeMax: number | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  householdSizeMin: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  neighborhood: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  petPolicy: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  smokingPolicy: string | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  unitsAvailable: number | null

  @Column({ type: "text", nullable: true })
  @Expose()
  @IsOptional()
  @IsString()
  unitAmenities: string | null

  @Column({ type: "integer", nullable: true })
  @Expose()
  @IsOptional()
  @IsNumber()
  yearBuilt: number | null

  @Expose()
  @ApiProperty()
  get unitsSummarized(): UnitsSummarized | undefined {
    if (this.amiChart && Array.isArray(this.units) && this.units.length > 0) {
      return transformUnits(this.units, this.amiChart.items)
    }
  }
}
