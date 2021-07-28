import React from "react"
import { useFormContext } from "react-hook-form"
import {
  cloudinaryUrlFromId,
  t,
  AppearanceBorderType,
  AppearanceStyleType,
  Button,
  CloudinaryUpload,
  Drawer,
  Dropzone,
  MinimalTable,
  TableThumbnail,
} from "@bloom-housing/ui-components"
import {
  AssetsService,
  ListingEvent,
  ListingEventCreate,
  ListingEventType,
} from "@bloom-housing/backend-core/types"

interface LotteryResultsProps {
  submitCallback: (data: { events: ListingEvent[] }) => void
  drawerState: boolean
  showDrawer: (toggle: boolean) => void
}

const LotteryResults = (props: LotteryResultsProps) => {
  const formMethods = useFormContext()

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { watch } = formMethods

  const cloudName = process.env.cloudinaryCloudName
  const uploadPreset = process.env.cloudinarySignedPreset

  const { submitCallback, drawerState, showDrawer } = props
  const [progressValue, setProgressValue] = React.useState(0)
  const [cloudinaryData, setCloudinaryData] = React.useState({
    id: "",
    url: "",
  })

  const listingEvents = watch("events")

  const resetDrawerState = () => {
    showDrawer(false)
  }

  const savePDF = () => {
    const updatedEvents = [...listingEvents]

    const lotteryIndex = updatedEvents.findIndex(
      (event) => event.type === ListingEventType.publicLottery
    )
    if (lotteryIndex > -1) {
      updatedEvents.splice(lotteryIndex, 1)
    }

    const newEvent: ListingEventCreate = {
      type: ListingEventType.publicLottery,
      startTime: new Date(),
      file: {
        fileId: cloudinaryData.id,
        label: "cloudinaryPDF",
      },
    }

    updatedEvents.push(newEvent as ListingEvent)
    console.info("*** saving events", updatedEvents)
    submitCallback({ events: updatedEvents })
  }

  const resultsTableHeaders = {
    preview: "t.preview",
    fileName: "t.fileName",
    actions: "",
  }

  /*
    Show a preview of the uploaded file within the photo drawer
  */
  const previewTableRows = []
  if (cloudinaryData.url !== "") {
    previewTableRows.push({
      preview: (
        <TableThumbnail>
          <img alt="PDF preview" src={cloudinaryData.url} />
        </TableThumbnail>
      ),
      fileName: cloudinaryData.id.split("/").slice(-1).join(),
      actions: (
        <Button
          type="button"
          className="font-semibold uppercase text-red-700"
          onClick={() => {
            setCloudinaryData({
              id: "",
              url: "",
            })
            setProgressValue(0)
          }}
          unstyled
        >
          {t("t.delete")}
        </Button>
      ),
    })
  }

  /*
    Uploader callback for the dropzone
  */
  const fileUploader = async (file: File) => {
    setProgressValue(1)

    const timestamp = Math.round(new Date().getTime() / 1000)
    const tag = "browser_upload"

    const assetsService = new AssetsService()
    const params = {
      timestamp,
      tags: tag,
      upload_preset: uploadPreset,
    }

    const resp = await assetsService.createPresignedUploadMetadata({
      body: { parametersToSign: params },
    })
    const signature = resp.signature

    setProgressValue(3)

    void CloudinaryUpload({
      signature,
      apiKey: process.env.cloudinaryKey,
      timestamp,
      file: file,
      onUploadProgress: (progress) => {
        setProgressValue(progress)
      },
      cloudName,
      uploadPreset,
      tag,
    }).then((response) => {
      setProgressValue(100)
      setCloudinaryData({
        id: response.data.public_id,
        url: cloudinaryUrlFromId(response.data.public_id),
      })
    })
  }

  return (
    <Drawer
      open={drawerState}
      title="Add Results"
      onClose={() => resetDrawerState()}
      ariaDescription="Form to upload lottery results"
      actions={[
        <Button
          key={0}
          onClick={() => {
            savePDF()
            resetDrawerState()
          }}
          styleType={AppearanceStyleType.primary}
        >
          {t("t.post")}
        </Button>,
        <Button
          key={1}
          onClick={() => {
            resetDrawerState()
          }}
          styleType={AppearanceStyleType.secondary}
          border={AppearanceBorderType.borderless}
        >
          {t("t.cancel")}
        </Button>,
      ]}
    >
      <section className="border rounded-md p-8 bg-white">
        <Dropzone
          id="lottery-results-upload"
          label="Upload Results"
          helptext="Select PDF file"
          uploader={fileUploader}
          accept="application/pdf"
          progress={progressValue}
        />
        {cloudinaryData.url != "" && (
          <MinimalTable headers={resultsTableHeaders} data={previewTableRows}></MinimalTable>
        )}
      </section>
    </Drawer>
  )
}

export default LotteryResults
