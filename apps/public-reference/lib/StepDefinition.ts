import ApplicationConductor from "./ApplicationConductor"

export default class StepDefinition {
  conductor: ApplicationConductor
  application: Record<string, any> = {}
  step: Record<string, any>
  url: string

  constructor(conductor, step, url) {
    this.step = step
    this.conductor = conductor
    this.application = conductor.application
    this.url = url
  }

  get name() {
    return this.step.name
  }

  save(formData) {
    // Pull in all the form values that match application fields
    for (const [key, value] of Object.entries(formData)) {
      if (typeof this.application[key] != "undefined") {
        this.application[key] = value
      }
    }
    this.conductor.sync()
  }

  // Override in subclasses
  skipStep() {
    return false
  }
}
