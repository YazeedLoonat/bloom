import * as fs from "fs"
import CsvReadableStream from "csv-reader"
import { Connection, DeepPartial } from "typeorm"
import { Listing } from "../src/listings/entities/listing.entity"
import { UnitGroup } from "../src/units-summary/entities/unit-group.entity"
import { UnitGroupAmiLevel } from "../src/units-summary/entities/unit-group-ami-level.entity"
import { UnitType } from "../src/unit-types/entities/unit-type.entity"
import { AmiChart } from "../src/ami-charts/entities/ami-chart.entity"
import { HUD2021 } from "../src/seeder/seeds/ami-charts/HUD2021"
import { MSHDA2021 } from "../src/seeder/seeds/ami-charts/MSHDA2021"
import { MonthlyRentDeterminationType } from "../src/units-summary/types/monthly-rent-determination.enum"
import dbOptions = require("../ormconfig")

type AmiChartNameType = "MSHDA" | "HUD"

const args = process.argv.slice(2)

const filePath = args[0]
if (typeof filePath !== "string" && !fs.existsSync(filePath)) {
  throw new Error(`usage: ts-node import-unit-groups.ts csv-file-path`)
}

export class HeaderConstants {
  public static readonly TemporaryListingId: string = "ID"
  public static readonly UnitTypeName: string = "Unit Types"
  public static readonly MinOccupancy: string = "Min Occupancy"
  public static readonly MaxOccupancy: string = "Max Occupancy"
  public static readonly TotalCount: string = "Unit Type Quantity (Affordable)"
  public static readonly TotalAvailable: string = "Vacant Units"
  public static readonly WaitlistClosed: string = "Waitlist Closed"
  public static readonly WaitlistOpen: string = "Waitlist Open"
  public static readonly AMIChart: string = "AMI Chart"
  public static readonly AmiChartPercentage: string = "Percent AMIs"
  public static readonly Value20: string = "20% (Value)"
  public static readonly Value25: string = "25% (Value)"
  public static readonly Value30: string = "30% (Value)"
  public static readonly Value35: string = "35% (Value)"
  public static readonly Value40: string = "40% (Value)"
  public static readonly Value45: string = "45% (Value)"
  public static readonly Value50: string = "50% (Value)"
  public static readonly Value55: string = "55% (Value)"
  public static readonly Value60: string = "60% (Value)"
  public static readonly Value70: string = "70% (Value)"
  public static readonly Value80: string = "80% (Value)"
  public static readonly Value100: string = "100% (Value)"
  public static readonly Value120: string = "120% (Value)"
  public static readonly Value125: string = "125% (Value)"
  public static readonly Value140: string = "140% (Value)"
  public static readonly Value150: string = "150% (Value)"
}

function findAmiChartByName(
  amiCharts: Array<AmiChart>,
  spreadSheetAmiChartName: AmiChartNameType
): AmiChart {
  const SpreadSheetAmiChartNameToDbChartNameMapping: Record<AmiChartNameType, string> = {
    MSHDA: MSHDA2021.name,
    HUD: HUD2021.name,
  }
  return amiCharts.find(
    (amiChart) =>
      amiChart.name === SpreadSheetAmiChartNameToDbChartNameMapping[spreadSheetAmiChartName]
  )
}

function parseAmiStringValue(value: string | number) {
  if (typeof value === "number") {
    return value
  } else if (typeof value === "string") {
    const retval = Number.parseInt(value.replace(/\$/, "").replace(/,/, ""))
    if (!retval) {
      console.log("dollar value")
      console.log(value)
      throw new Error("Failed to parse $ (dolar) value")
    }
    return retval
  } else {
    throw new Error("Unknown ami value type")
  }
}

function getAmiValueFromColumn(row, amiPercentage: number, type: "percentage" | "flat") {
  const mapAmiPercentageToColumnName = {
    20: HeaderConstants.Value20,
    25: HeaderConstants.Value25,
    30: HeaderConstants.Value30,
    35: HeaderConstants.Value35,
    40: HeaderConstants.Value40,
    45: HeaderConstants.Value45,
    50: HeaderConstants.Value50,
    55: HeaderConstants.Value55,
    60: HeaderConstants.Value60,
    70: HeaderConstants.Value70,
    80: HeaderConstants.Value80,
    100: HeaderConstants.Value100,
    120: HeaderConstants.Value120,
    125: HeaderConstants.Value125,
    140: HeaderConstants.Value140,
    150: HeaderConstants.Value150,
  }
  const value = row[mapAmiPercentageToColumnName[amiPercentage]]

  if (value) {
    const splitValues = value.split("/")

    if (splitValues.length === 1) {
      return parseAmiStringValue(value)
    } else if (splitValues.length === 2) {
      return type === "flat"
        ? parseAmiStringValue(splitValues[0])
        : parseAmiStringValue(splitValues[1])
    }

    throw new Error("This part should not be reached")
  }
}

function generateUnitsSummaryAmiLevels(
  row,
  amiChartEntities: Array<AmiChart>,
  amiChartString: string,
  amiChartPercentagesString: string
) {
  const amiCharts = amiChartString.split("/")

  let amiPercentages: Array<number> = []
  if (amiChartPercentagesString && typeof amiChartPercentagesString === "string") {
    amiPercentages = amiChartPercentagesString
      .split(",")
      .map((s) => s.trim())
      .map((s) => Number.parseInt(s))
  } else if (amiChartPercentagesString && typeof amiChartPercentagesString === "number") {
    amiPercentages = [amiChartPercentagesString]
  }

  const amiChartLevels: Array<DeepPartial<UnitGroupAmiLevel>> = []

  for (const amiChartName of amiCharts) {
    const amiChartEntity = findAmiChartByName(amiChartEntities, amiChartName as AmiChartNameType)
    const monthlyRentDeterminationType =
      amiChartName === "MSHDA"
        ? MonthlyRentDeterminationType.flatRent
        : MonthlyRentDeterminationType.percentageOfIncome

    for (const amiPercentage of amiPercentages) {
      amiChartLevels.push({
        amiChart: amiChartEntity,
        amiPercentage:
          monthlyRentDeterminationType === MonthlyRentDeterminationType.percentageOfIncome
            ? getAmiValueFromColumn(row, amiPercentage, "percentage")
            : null,
        monthlyRentDeterminationType,
        flatRentValue:
          monthlyRentDeterminationType === MonthlyRentDeterminationType.flatRent
            ? getAmiValueFromColumn(row, amiPercentage, "flat")
            : null,
      })
    }
  }

  return amiChartLevels
}

function getOpenWaitlistValue(row): boolean {
  const waitlistClosedColumn = row[HeaderConstants.WaitlistClosed]
  if (waitlistClosedColumn === "Closed") {
    return false
  }

  const waitlistOpenColumn = row[HeaderConstants.WaitlistOpen]
  if (waitlistOpenColumn === "Open") {
    return true
  }

  return true
}

async function main() {
  const connection = new Connection(dbOptions)
  await connection.connect()

  const listingsRepository = connection.getRepository(Listing)
  const unitTypesRepository = connection.getRepository(UnitType)
  const amiChartsRepository = connection.getRepository(AmiChart)

  const amiCharts = await amiChartsRepository.find()

  const inputStream = fs.createReadStream(filePath, "utf8")
  inputStream
    .pipe(
      new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, asObject: true })
    )
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .on("data", async (row) => {
      try {
        const listing: DeepPartial<Listing> = await listingsRepository.findOne({
          where: {
            temporaryListingId: row[HeaderConstants.TemporaryListingId],
          },
        })
        if (!listing) {
          throw new Error(`Listing with ID: ${row[HeaderConstants.TemporaryListingId]} not found.`)
        }

        const unitTypes = []
        if (row[HeaderConstants.UnitTypeName]) {
          const spreadsheetUnitTypeNameToDbUnitTypeName = {
            "1BR": "oneBdrm",
            "2BR": "twoBdrm",
            "3BR": "threeBdrm",
            "4+BR": "fourBdrm",
            "4BR": "fourBdrm",
            Studio: "studio",
          }

          const unitType = await unitTypesRepository.findOneOrFail({
            where: {
              name: spreadsheetUnitTypeNameToDbUnitTypeName[row[HeaderConstants.UnitTypeName]],
            },
          })
          unitTypes.push(unitType)
        }

        const newUnitsSummary: DeepPartial<UnitGroup> = {
          minOccupancy: row[HeaderConstants.MinOccupancy]
            ? row[HeaderConstants.MinOccupancy]
            : null,
          maxOccupancy: row[HeaderConstants.MaxOccupancy]
            ? row[HeaderConstants.MaxOccupancy]
            : null,
          totalCount: row[HeaderConstants.TotalCount] ? row[HeaderConstants.TotalCount] : null,
          totalAvailable: row[HeaderConstants.TotalAvailable]
            ? row[HeaderConstants.TotalAvailable]
            : null,
          openWaitlist: getOpenWaitlistValue(row),
          unitType: unitTypes,
          amiLevels: generateUnitsSummaryAmiLevels(
            row,
            amiCharts,
            row[HeaderConstants.AMIChart],
            row[HeaderConstants.AmiChartPercentage]
          ),
        }
        listing.unitGroups.push(newUnitsSummary)

        await listingsRepository.save(listing)
      } catch (e) {
        console.error(row)
        console.error(e)
      }
    })
}

void main()