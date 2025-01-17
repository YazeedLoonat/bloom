import React, { useContext } from "react"
import moment from "moment"
import { t, GridSection, ViewItem, GridCell } from "@bloom-housing/ui-components"
import { ListingContext } from "../../ListingContext"
import { getLotteryEvent } from "../../../../lib/helpers"
import { ListingReviewOrder } from "@bloom-housing/backend-core/types"
import { getDetailFieldNumber, getDetailFieldString } from "./helpers"

const DetailRankingsAndResults = () => {
  const listing = useContext(ListingContext)

  const lotteryEvent = getLotteryEvent(listing)
  const getReviewOrderType = () => {
    if (!listing.reviewOrderType) {
      return lotteryEvent ? ListingReviewOrder.lottery : ListingReviewOrder.firstComeFirstServe
    } else {
      return listing.reviewOrderType
    }
  }
  return (
    <GridSection
      className="bg-primary-lighter"
      title={t("listings.sections.rankingsResultsTitle")}
      grid={false}
      inset
    >
      <GridSection columns={2}>
        <ViewItem label={t("listings.reviewOrderQuestion")}>
          {getReviewOrderType() === ListingReviewOrder.firstComeFirstServe
            ? t("listings.firstComeFirstServe")
            : t("listings.lotteryTitle")}
        </ViewItem>
      </GridSection>
      {lotteryEvent && (
        <>
          <GridSection columns={3}>
            <ViewItem label={t("listings.lotteryDateQuestion")}>
              {moment(new Date(lotteryEvent?.startTime)).utc().format("MM/DD/YYYY")}
            </ViewItem>
            <ViewItem label={t("listings.lotteryStartTime")}>
              {moment(new Date(lotteryEvent?.startTime)).format("hh:mm A")}
            </ViewItem>
            <ViewItem label={t("listings.lotteryEndTime")}>
              {moment(new Date(lotteryEvent?.endTime)).format("hh:mm A")}
            </ViewItem>
          </GridSection>
          <GridSection columns={2}>
            <ViewItem label={t("listings.lotteryDateNotes")}>{lotteryEvent?.note}</ViewItem>
          </GridSection>
        </>
      )}
      {getReviewOrderType() === ListingReviewOrder.firstComeFirstServe && (
        <GridSection columns={2}>
          <ViewItem label={t("listings.dueDateQuestion")}>
            {listing.applicationDueDate ? t("t.yes") : t("t.no")}
          </ViewItem>
        </GridSection>
      )}
      <GridSection columns={2}>
        <ViewItem label={t("listings.waitlist.openQuestion")}>
          {listing.isWaitlistOpen
            ? t("t.yes")
            : listing.isWaitlistOpen === false
            ? t("t.no")
            : t("t.n/a")}
        </ViewItem>
      </GridSection>
      {listing.isWaitlistOpen && (
        <GridSection columns={2}>
          <ViewItem label={t("listings.waitlist.sizeQuestion")}>
            {listing.waitlistMaxSize ? t("t.yes") : t("t.no")}
          </ViewItem>
        </GridSection>
      )}
      {listing.waitlistMaxSize && (
        <GridSection columns={3}>
          <ViewItem label={t("listings.waitlist.maxSize")}>
            {getDetailFieldNumber(listing.waitlistMaxSize)}
          </ViewItem>
          <ViewItem label={t("listings.waitlist.currentSize")}>
            {getDetailFieldNumber(listing.waitlistCurrentSize)}
          </ViewItem>
          <ViewItem label={t("listings.waitlist.openSize")}>
            {getDetailFieldNumber(listing.waitlistOpenSpots)}
          </ViewItem>
        </GridSection>
      )}
      <GridSection columns={1}>
        <GridCell>
          <ViewItem label={t("listings.whatToExpectLabel")}>
            {getDetailFieldString(listing.whatToExpect)}
          </ViewItem>
        </GridCell>
      </GridSection>
    </GridSection>
  )
}

export default DetailRankingsAndResults
