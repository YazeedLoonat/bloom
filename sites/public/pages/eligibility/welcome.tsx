/*
Eligibility Welcome
Explanation about the purpose of the questionnaire.
*/
import {
  AppearanceStyleType,
  Button,
  FormCard,
  t,
  Form,
  ProgressNav,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../layouts/forms"
import { useForm } from "react-hook-form"
import React, { useContext } from "react"
import { useRouter } from "next/router"
import { ELIGIBILITY_SECTIONS } from "../../lib/constants"
import { eligibilityRoute } from "../../lib/helpers"
import { EligibilityContext } from "../../lib/EligibilityContext"

const EligibilityWelcome = () => {
  const router = useRouter()
  const { eligibilityRequirements } = useContext(EligibilityContext)
  const CURRENT_PAGE = 0

  /* Form Handler */
  const { handleSubmit } = useForm()
  const onSubmit = () => {
    void router.push(eligibilityRoute(CURRENT_PAGE + 1))
  }

  if (eligibilityRequirements.completedSections <= CURRENT_PAGE) {
    eligibilityRequirements.setCompletedSections(CURRENT_PAGE + 1)
  }

  return (
    <FormsLayout>
      <FormCard header={t("eligibility.progress.header")}>
        <ProgressNav
          currentPageSection={1}
          completedSections={eligibilityRequirements.completedSections}
          labels={ELIGIBILITY_SECTIONS.map((label) => t(`eligibility.progress.sections.${label}`))}
          routes={ELIGIBILITY_SECTIONS.map((_label, i) => eligibilityRoute(i))}
        />
      </FormCard>
      <FormCard>
        <div className="form-card__lead pb-0 pt-8">
          <h2 className="form-card__title is-borderless">{t("eligibility.welcome.header")}</h2>
        </div>
        <div className="form-card__pager-row px-16">
          <p className="field-note py-2">{t("eligibility.welcome.description")}</p>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button styleType={AppearanceStyleType.primary}>{t("t.next")}</Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default EligibilityWelcome