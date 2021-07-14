/*
Bedroom Count
Prompts the user for the number of bedrooms they need.
*/
import {
  AppearanceStyleType,
  Button,
  FormCard,
  t,
  Form,
  FieldGroup,
} from "@bloom-housing/ui-components"
import FormsLayout from "../../layouts/forms"
import { useForm } from "react-hook-form"
import { useFormConductor } from "../../lib/hooks"
import React from "react"

const EligibilityBedrooms = () => {
  const { conductor } = useFormConductor("bedrooms")

  /* Form Handler */
  const { handleSubmit, register, errors } = useForm()
  const onSubmit = () => {
    conductor.routeToNextOrReturnUrl()
  }

  const preferredUnitOptions = [
    { id: "studio", label: t("eligibility.bedrooms.studio"),},
    { id: "1", label: "1",},
    { id: "2", label: "2",},
    { id: "3", label: "3" },
    { id: "4+", label: "4+" },
  ]

  return (
    <FormsLayout>
      <FormCard>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-card__group is-borderless">
            <legend className="sr-only">
              {t("eligibility.bedrooms.srLabel")}
            </legend>
            <FieldGroup
              type="checkbox"
              name="preferredUnit"
              groupNote={t("eligibility.bedrooms.prompt")}
              fields={preferredUnitOptions}
              error={errors.preferredUnit}
              errorMessage={t("errors.selectAtLeastOne")}
              validation={{ required: true }}
              register={register}
            />
          </div>
          <div className="form-card__pager">
            <div className="form-card__pager-row primary">
              <Button
                styleType={AppearanceStyleType.primary}
                onClick={() => conductor.setNavigatedBack(false)}
              >
                {t("t.next")}
              </Button>
            </div>
          </div>
        </Form>
      </FormCard>
    </FormsLayout>
  )
}

export default EligibilityBedrooms