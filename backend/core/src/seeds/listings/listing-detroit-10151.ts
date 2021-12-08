import { AssetDtoSeedType, ListingSeedType, PropertySeedType } from "./listings"
import { ListingStatus } from "../../listings/types/listing-status-enum"
import { CountyCode } from "../../shared/types/county-code"
import { CSVFormattingType } from "../../csv/types/csv-formatting-type-enum"
import { ListingDefaultSeed } from "./listing-default-seed"
import { BaseEntity, DeepPartial } from "typeorm"
import { Listing } from "../../listings/entities/listing.entity"
import { UnitsSummaryCreateDto } from "../../units-summary/dto/units-summary.dto"

const propertySeed: PropertySeedType = {
  buildingAddress: {
    city: "Detroit",
    state: "MI",
    street: "2515 W Forest Ave",
    zipCode: "48208",
    latitude: 42.34547,
    longitude: -83.08877,
  },
  buildingTotalUnits: 45,
  neighborhood: "Core City",
}

const listingSeed: ListingSeedType = {
  amiPercentageMax: 60,
  amiPercentageMin: 30,
  applicationDropOffAddress: null,
  applicationMailingAddress: null,
  countyCode: CountyCode.detroit,
  CSVFormattingType: CSVFormattingType.basic,
  disableUnitsAccordion: true,
  displayWaitlistSize: false,
  hrdId: "HRD10151",
  leasingAgentName: "Natasha Gaston",
  leasingAgentPhone: "313-926-8509",
  managementCompany: "NRP Group",
  managementWebsite: "www.nrpgroup.com/Home/Communities",
  name: "MLK Homes",
  status: ListingStatus.active,
  image: undefined,
  digitalApplication: undefined,
  paperApplication: undefined,
  referralOpportunity: undefined,
  depositMin: undefined,
  depositMax: undefined,
  leasingAgentEmail: undefined,
  rentalAssistance: undefined,
  reviewOrderType: undefined,
  isWaitlistOpen: undefined,
}

export class Listing10151Seed extends ListingDefaultSeed {
  async seed() {
    const unitTypeThreeBdrm = await this.unitTypeRepository.findOneOrFail({ name: "threeBdrm" })
    const unitTypeFourBdrm = await this.unitTypeRepository.findOneOrFail({ name: "fourBdrm" })

    const property = await this.propertyRepository.save({
      ...propertySeed,
    })

    const reservedType = await this.reservedTypeRepository.findOneOrFail({ name: "specialNeeds" })

    const assets: Array<AssetDtoSeedType> = [
      {
        label: "building",
        // NOTE: this is not an actual image of the property.
        fileId:
          "https://images.unsplash.com/photo-1629371997433-d11e6161a8b3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1548&q=80",
      },
    ]

    const listingCreateDto: Omit<
      DeepPartial<Listing>,
      keyof BaseEntity | "urlSlug" | "showWaitlist"
    > = {
      ...listingSeed,
      applicationMethods: [],
      assets: assets,
      events: [],
      property: property,
      preferences: [],
      reservedCommunityType: reservedType,
      // If a reservedCommunityType is specified, a reservedCommunityDescription MUST also be specified
      reservedCommunityDescription: "",
    }

    const listing = await this.listingRepository.save(listingCreateDto)

    const unitsSummaryToBeCreated: UnitsSummaryCreateDto[] = []

    const threeBdrmUnitsSummary: UnitsSummaryCreateDto = {
      unitType: unitTypeThreeBdrm,
      totalCount: 16,
      listing: listing,
    }
    unitsSummaryToBeCreated.push(threeBdrmUnitsSummary)

    const fourBdrmUnitsSummary: UnitsSummaryCreateDto = {
      unitType: unitTypeFourBdrm,
      totalCount: 29,
      listing: listing,
    }
    unitsSummaryToBeCreated.push(fourBdrmUnitsSummary)

    await this.unitsSummaryRepository.save(unitsSummaryToBeCreated)

    return listing
  }
}
