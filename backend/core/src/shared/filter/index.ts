import { HttpException, HttpStatus } from "@nestjs/common"
import { WhereExpression } from "typeorm"
import { Compare } from "../dto/filter.dto"
import {
  AvailabilityFilterEnum,
  ListingFilterKeys,
} from "../../listings/types/listing-filter-keys-enum"
import {
  addSeniorHousingQuery,
  addAvailabilityQuery,
  addMinAmiPercentageFilter,
} from "./custom_filters"

/**
 *
 * @param filterParams
 * @param filterTypeToFieldMap
 * @param qb The query on which filters are applied.
 */
/**
 * Add filters to provided QueryBuilder, using the provided map to find the field name.
 * The order of the params matters:
 * - A $comparison must be first.
 * - Comparisons in $comparison will be applied to each filter in order.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addFilters<FilterParams extends Array<any>, FilterFieldMap>(
  filters: FilterParams,
  filterTypeToFieldMap: FilterFieldMap,
  qb: WhereExpression
): void {
  for (const [index, filter] of filters.entries()) {
    const comparison = filter["$comparison"]
    const includeNulls = filter["$include_nulls"]
    for (const filterKey in filter) {
      if (
        filter[filterKey] === undefined ||
        filter[filterKey] === null ||
        filterKey === "$comparison" ||
        filterKey === "$include_nulls"
      ) {
        continue
      }
      // Throw if this is not a supported filter type
      if (!(filterKey in ListingFilterKeys)) {
        throw new HttpException("Filter Not Implemented", HttpStatus.NOT_IMPLEMENTED)
      }

      const filterValue = filter[filterKey]
      // Handle custom filters here, before dropping into generic filter handler
      switch (filterKey) {
        case ListingFilterKeys.seniorHousing:
          addSeniorHousingQuery(qb, filterValue)
          continue
        case ListingFilterKeys.availability:
          addAvailabilityQuery(qb, filterValue as AvailabilityFilterEnum, includeNulls)
          continue
        case ListingFilterKeys.minAmiPercentage:
          addMinAmiPercentageFilter(qb, parseInt(filterValue), includeNulls)
          continue
      }

      const whereParameterName = `${filterKey}_${index}`
      const filterField = filterTypeToFieldMap[filterKey]
      switch (comparison) {
        case Compare.IN:
          qb.andWhere(
            `(LOWER(CAST(${filterField} as text)) IN (:...${whereParameterName})${
              includeNulls ? ` OR ${filterField} IS NULL` : ""
            })`,
            {
              [whereParameterName]: filterValue
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter((s) => s.length !== 0),
            }
          )
          break
        case Compare["<>"]:
        case Compare["="]:
          qb.andWhere(
            `(LOWER(CAST(${filterField} as text)) ${comparison} LOWER(:${whereParameterName})${
              includeNulls ? ` OR ${filterField} IS NULL` : ""
            })`,
            {
              [whereParameterName]: filterValue,
            }
          )
          break
        case Compare[">="]:
        case Compare["<="]:
          qb.andWhere(
            `(${filterField} ${comparison} :${whereParameterName}${
              includeNulls ? ` OR ${filterField} IS NULL` : ""
            })`,
            {
              [whereParameterName]: filterValue,
            }
          )
          break
        case Compare.NA:
          // If we're here, it's because we expected this filter to be handled by a custom filter handler
          // that ignores the $comparison param, but it was not.
          throw new HttpException(
            `Filter "${filter}" expected to be handled by a custom filter handler, but one was not implemented.`,
            HttpStatus.NOT_IMPLEMENTED
          )
        default:
          throw new HttpException("Comparison Not Implemented", HttpStatus.NOT_IMPLEMENTED)
      }
    }
  }
}
