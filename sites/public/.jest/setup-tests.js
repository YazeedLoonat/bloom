import "@testing-library/jest-dom/extend-expect"

import { configure } from "enzyme"
import Adapter from "enzyme-adapter-react-16"
import general from "../../../ui-components/src/locales/general.json"
import Polyglot from "node-polyglot"

const translatorConfig = {}
global.Translator = translatorConfig

export const addTranslation = (translationPhrases, resetPolyglot = false) => {
  if (!translatorConfig.polyglot || resetPolyglot) {
    // Set up the initial Polyglot instance and phrases
    translatorConfig.polyglot = new Polyglot({
      phrases: translationPhrases,
    })
  } else {
    // Extend the Polyglot instance with new phrases
    translatorConfig.polyglot.extend(translationPhrases)
  }
}

configure({ adapter: new Adapter() })

// see: https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia = jest.fn().mockImplementation((query) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }
})

addTranslation(general)

jest.mock("next/router", () => ({
  useRouter() {
    return {}
  },
}))
