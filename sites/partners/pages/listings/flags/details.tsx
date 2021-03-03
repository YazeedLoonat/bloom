import {
  AppearanceStyleType,
  Button,
  PageHeader,
  StatusBar,
  t,
} from "@bloom-housing/ui-components"
import { ColumnApi, GridOptions } from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import moment from "moment"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import Layout from "../../../layouts/application"
import { useUnresolvedAFSData } from "../../../lib/hooks"

const ApplicationFlaggedSetDetails = () => {
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null)
  const router = useRouter()
  const { register, watch } = useForm()
  const pageSize = watch("page-size", 8)
  const [pageIndex, setPageIndex] = useState(1)
  const COLUMN_STATE_KEY = "column-state"
  const [disableBtn, setdisableBtn] = useState(true)
  const [rowCount, setRowCount] = useState(0)

  const afsId = router.query.id as string

  const { appsDataUnresolved } = useUnresolvedAFSData(afsId)
  const applications = appsDataUnresolved?.applications || []
  const appsMeta = appsDataUnresolved?.meta
  const rule = appsDataUnresolved?.rule.replace("and", "+")

  // action buttons
  const onBtNext = () => {
    setPageIndex(pageIndex + 1)
  }

  const onBtPrevious = () => {
    setPageIndex(pageIndex - 1)
  }

  const pageSizeOptions = ["8", "100", "500", "1000"]
  const pageJumpOptions = Array.from(Array(appsMeta?.totalPages).keys())?.map((item) => item + 1)

  function saveColumnState(api: ColumnApi) {
    const columnState = api.getColumnState()
    const columnStateJSON = JSON.stringify(columnState)
    sessionStorage.setItem(COLUMN_STATE_KEY, columnStateJSON)
  }

  const gridOptions: GridOptions = {
    onSortChanged: (params) => saveColumnState(params.columnApi),
    onColumnMoved: (params) => saveColumnState(params.columnApi),
    onSelectionChanged: onSelectionChanged,
  }

  function onGridReady(params) {
    setGridColumnApi(params.columnApi)
    this.api.sizeColumnsToFit()
  }
  const defaultColDef = {
    resizable: true,
    maxWidth: 400,
  }

  function onSelectionChanged() {
    const selectedRows = this.api.getSelectedRows()
    if (selectedRows.length > 0) {
      setdisableBtn(false)
      setRowCount(selectedRows.length)
    } else {
      setdisableBtn(true)
      setRowCount(0)
    }
  }

  const columnDefs = useMemo(
    () => [
      {
        headerName: t("application.details.number"),
        field: "id",
        sortable: false,
        filter: false,
        resizable: true,
        checkboxSelection: true,
      },
      {
        headerName: t("application.name.firstName"),
        field: "applicant.firstName",
        sortable: false,
        filter: false,
        resizable: true,
      },
      {
        headerName: t("application.name.lastName"),
        field: "applicant.lastName",
        sortable: false,
        filter: false,
        resizable: true,
      },
      {
        headerName: t("applications.table.primaryDob"),
        field: "applicant",
        sortable: false,
        filter: false,
        resizable: true,
        valueFormatter: ({ value }) => {
          if (!value) return ""

          const isValidDOB = !!value?.birthMonth && !!value?.birthDay && value?.birthYear

          return isValidDOB ? `${value.birthMonth}/${value.birthDay}/${value.birthYear}` : ""
        },
      },
      {
        headerName: t("t.email"),
        field: "applicant.emailAddress",
        sortable: false,
        filter: false,
        resizable: true,
        flex: 1,
      },
      {
        headerName: t("t.phone"),
        field: "applicant.phoneNumber",
        sortable: false,
        filter: false,
        resizable: true,
        flex: 1,
      },
      {
        headerName: t("applications.table.applicationSubmissionDate"),
        field: "submissionDate",
        sortable: false,
        filter: false,
        resizable: true,
        flex: 1,
        sort: "asc",
        valueFormatter: ({ value }) => {
          if (!value) return ""

          const date = moment(value)

          const dateFormatted = date.utc().format("MM/DD/YYYY")
          const timeFormatted = date.utc().format("hh:mm:ss A")

          return `${dateFormatted} ${t("t.at")} ${timeFormatted}`
        },
      },
    ],
    []
  )
  if (!appsDataUnresolved) return false

  return (
    <Layout>
      <section>
        <Head>
          <title>{t("flaggedSet.siteTitle")}</title>
        </Head>
        <PageHeader
          title={
            <>
              <p className="font-sans font-semibold uppercase text-3xl">
                {applications[0].applicant.firstName} {applications[0].applicant.lastName}: {rule}
              </p>

              <p className="font-sans text-base mt-1">{applications.id}</p>
            </>
          }
        ></PageHeader>
        <StatusBar
          backButton={
            <Button inlineIcon="left" icon="arrow-back" onClick={() => router.back()}>
              {t("t.back")}
            </Button>
          }
          tagStyle={AppearanceStyleType.flagged}
          tagLabel="FLAGGED"
        />
        <article className="flex-row flex-wrap relative max-w-screen-xl mx-auto py-8 px-4">
          <div className="ag-theme-alpine ag-theme-bloom">
            <div className="applications-table mt-5">
              <AgGridReact
                onGridReady={onGridReady}
                gridOptions={gridOptions}
                defaultColDef={defaultColDef}
                columnDefs={columnDefs}
                rowData={applications}
                domLayout={"autoHeight"}
                headerHeight={83}
                rowHeight={58}
                suppressPaginationPanel={true}
                paginationPageSize={8}
                suppressScrollOnNewData={true}
                rowSelection={"multiple"}
                rowMultiSelectWithClick={true}
                groupSelectsChildren={false}
                // onSelectionChanged={onSelectionChanged}
              ></AgGridReact>
              <div className="data-pager">
                <Button
                  className="data-pager__previous data-pager__control"
                  onClick={onBtPrevious}
                  disabled={pageIndex === 1}
                >
                  {t("t.previous")}
                </Button>

                <div className="data-pager__control-group">
                  <span className="data-pager__control">
                    <span className="field-label" id="lbTotalPages">
                      {appsMeta?.totalItems}
                    </span>
                    <span className="field-label">{t("applications.totalApplications")}</span>
                  </span>

                  <span className="field data-pager__control">
                    <label className="field-label font-sans" htmlFor="page-size">
                      {t("t.show")}
                    </label>
                    <select name="page-size" id="page-size" ref={register} defaultValue={8}>
                      {pageSizeOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </span>

                  <span className="field data-pager__control">
                    <label className="field-label font-sans" htmlFor="page-jump">
                      {t("t.jumpTo")}
                    </label>
                    <select
                      name="page-jump"
                      id="page-jump"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setPageIndex(parseInt(e.target.value))
                      }
                      value={pageIndex}
                    >
                      {pageJumpOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>

                <Button
                  className="data-pager__next data-pager__control"
                  onClick={onBtNext}
                  disabled={appsMeta?.totalPages === pageIndex}
                >
                  {t("t.next")}
                </Button>
              </div>
            </div>
          </div>
          <div className="data-pager__control-group">
            <span className="data-pager__control">
              <span className="field-label" id="lbTotalPages">
                {rowCount}
              </span>
              <span className="field-label">{t("flaggedSet.markedDuplicate")}</span>
            </span>
            <Button
              className="data-pager"
              normalCase={false}
              styleType={AppearanceStyleType.success}
              onClick={() => false}
              disabled={disableBtn}
            >
              {t("flaggedSet.resolveFlag")}
            </Button>
          </div>
        </article>
      </section>
    </Layout>
  )
}

export default ApplicationFlaggedSetDetails