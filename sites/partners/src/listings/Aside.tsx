import React, { useContext, useMemo } from "react"
import moment from "moment"
import {
  pdfUrlFromListingEvents,
  t,
  StatusAside,
  Button,
  GridCell,
  AppearanceStyleType,
  AppearanceBorderType,
  StatusMessages,
  LocalizedLink,
  LinkButton,
  Icon,
} from "@bloom-housing/ui-components"
import { ListingContext } from "./ListingContext"
import { ListingEventType, ListingStatus } from "@bloom-housing/backend-core/types"

type AsideProps = {
  type: AsideType
  setStatus?: (status: ListingStatus) => void
  showCloseListingModal?: () => void
  showLotteryResultsDrawer?: () => void
}

type AsideType = "add" | "edit" | "details"

const Aside = ({
  type,
  setStatus,
  showCloseListingModal,
  showLotteryResultsDrawer,
}: AsideProps) => {
  const listing = useContext(ListingContext)

  const listingId = listing?.id

  const recordUpdated = useMemo(() => {
    if (!listing) return null

    const momentDate = moment(listing.updatedAt)

    return momentDate.format("MMMM DD, YYYY")
  }, [listing])

  const actions = useMemo(() => {
    const elements = []

    const cancel = (
      <GridCell className="flex" key="btn-cancel">
        <LinkButton
          unstyled
          fullWidth
          className="bg-opacity-0"
          href={type === "add" ? "/" : `/listings/${listingId}`}
        >
          {t("t.cancel")}
        </LinkButton>
      </GridCell>
    )

    if (type === "details") {
      elements.push(
        <GridCell key="btn-submitNew">
          <LocalizedLink href={`/listings/${listingId}/edit`}>
            <Button styleType={AppearanceStyleType.primary} fullWidth onClick={() => false}>
              {t("t.edit")}
            </Button>
          </LocalizedLink>
        </GridCell>
      )
    }

    if (type === "add") {
      elements.push(
        <GridCell key="btn-publish">
          <Button
            styleType={AppearanceStyleType.success}
            fullWidth
            onClick={() => setStatus(ListingStatus.active)}
          >
            {t("listings.actions.publish")}
          </Button>
        </GridCell>,
        <GridCell key="btn-draft">
          <Button fullWidth onClick={() => setStatus(ListingStatus.pending)}>
            {t("listings.actions.draft")}
          </Button>
        </GridCell>
      )
    }

    if (type === "edit") {
      elements.push(
        <GridCell key="btn-save">
          <Button
            styleType={AppearanceStyleType.primary}
            fullWidth
            onClick={() => {
              setStatus(listing.status)
            }}
          >
            {t("t.saveExit")}
          </Button>
        </GridCell>
      )

      if (listing.status === ListingStatus.pending || listing.status === ListingStatus.closed) {
        elements.push(
          <GridCell key="btn-publish">
            <Button
              styleType={AppearanceStyleType.success}
              fullWidth
              onClick={() => setStatus(ListingStatus.active)}
            >
              {t("listings.actions.publish")}
            </Button>
          </GridCell>
        )
      }

      if (listing.status === ListingStatus.active) {
        elements.push(
          <div className="grid grid-cols-2 gap-2" key="btn-close-unpublish">
            <Button
              type="button"
              styleType={AppearanceStyleType.secondary}
              fullWidth
              onClick={() => showCloseListingModal && showCloseListingModal()}
            >
              {t("listings.actions.close")}
            </Button>

            <Button
              styleType={AppearanceStyleType.alert}
              fullWidth
              onClick={() => setStatus(ListingStatus.pending)}
              border={AppearanceBorderType.outlined}
            >
              {t("listings.actions.unpublish")}
            </Button>
          </div>
        )
      }

      if (listing.events.find((event) => event.type === ListingEventType.publicLottery)) {
        elements.push(
          <GridCell className="flex" key="btn-edit-lottery">
            <Button
              type="button"
              unstyled
              fullWidth
              className="bg-opacity-0"
              onClick={() => showLotteryResultsDrawer && showLotteryResultsDrawer()}
            >
              {t("listings.actions.resultsPosted")}{" "}
              {moment(
                listing.events.find((event) => event.type === ListingEventType.publicLottery)
                  ?.startTime
              ).format("MMMM DD, YYYY")}
              <Icon size="medium" symbol="edit" className="ml-2" />
            </Button>
          </GridCell>
        )
      } else if (listing.status === ListingStatus.closed) {
        elements.push(
          <GridCell key="btn-post-results">
            <Button
              type="button"
              styleType={AppearanceStyleType.success}
              fullWidth
              onClick={() => showLotteryResultsDrawer && showLotteryResultsDrawer()}
            >
              {t("listings.actions.postResults")}
            </Button>
          </GridCell>
        )
      }
    }

    if (type === "details") {
      elements.push(
        <GridCell key="btn-preview">
          <a target="_blank" href={`${process.env.publicBaseUrl}/preview/listings/${listingId}`}>
            <Button fullWidth onClick={() => false}>
              {t("listings.actions.preview")}
            </Button>
          </a>
        </GridCell>
      )

      if (listing.events.find((event) => event.type === ListingEventType.publicLottery)) {
        const eventUrl = pdfUrlFromListingEvents(listing.events, ListingEventType.publicLottery)
        elements.push(
          <GridCell className="flex" key="btn-preview-results">
            <a href={eventUrl} target="_blank" className="inline-flex w-full">
              <Button type="button" unstyled fullWidth className="bg-opacity-0">
                {t("listings.actions.previewLotteryResults")}{" "}
                <Icon size="medium" symbol="link" className="ml-2" />
              </Button>
            </a>
          </GridCell>
        )
      }
    }

    if (type === "add" || type === "edit") {
      elements.push(cancel)
    }

    return elements
  }, [listing, listingId, setStatus, showCloseListingModal, showLotteryResultsDrawer, type])

  return (
    <>
      <StatusAside columns={1} actions={actions}>
        {type === "edit" && <StatusMessages lastTimestamp={recordUpdated} />}
      </StatusAside>
    </>
  )
}

export default Aside
