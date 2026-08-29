Feature: Regulatory impact map
  Firms need to route each regulation to the business areas it actually affects.

  Scenario: View impact by business area
    Given a user opens the Impact Map page
    Then they see each tracked regulation with an impact level for Banking, Investment, Insurance, Compliance and Operations

  Scenario: Impact levels are visually distinct
    Given a regulation has "High" impact on Banking
    When the impact table renders that cell
    Then it is visually distinguished (color) from "Medium", "Low" and "None" impact cells

  @not-yet-built
  Scenario: Impact rows link back to the regulation
    Given a user is viewing the impact map
    When they select a regulation's row
    Then the same regulation detail view used elsewhere in the app opens
