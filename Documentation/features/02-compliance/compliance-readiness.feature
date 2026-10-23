Feature: Compliance readiness tracking
  Compliance teams need to see how prepared the firm is against each regulation's deadline.

  Scenario: View compliance readiness table
    Given a user opens the Compliance page
    Then they see every tracked regulation with its regulator, status, deadline, readiness percentage and priority

  Scenario: Page through compliance records
    Given more than 10 regulations are tracked in the selected jurisdiction
    When a user chooses 20 rows per page or moves to the next page
    Then the Compliance table shows the requested page of records

  Scenario: Readiness is visually flagged by severity
    Given a regulation has a readiness percentage below 40%
    When the compliance table renders that row
    Then the readiness bar is shown in the danger color
    And a regulation at or above 70% readiness is shown in the success color

  Scenario: Open a regulation from the compliance table
    Given a user is viewing the compliance table
    When they select a row, by mouse or by keyboard (Enter or Space while focused)
    Then the same regulation detail view used by the alerts feed opens

  Scenario: Record a readiness assessment
    Given an analyst or administrator has reviewed a regulation's implementation status
    When they record its owner, assessment status, readiness percentage, rationale and optional evidence or review date
    Then an append-only assessment is persisted
    And the latest assessment is reflected on the dashboard and compliance table
    And the change is recorded in the audit trail

  Scenario: Viewers cannot record an assessment
    Given a viewer opens a regulation detail view
    Then they can see the latest assessment
    But they cannot submit a compliance assessment

  Scenario: Compliance score excludes unassessed regulations
    Given the selected jurisdiction has assessed and unassessed regulations
    When the dashboard renders the Compliance Score
    Then it is the rounded average of latest assessment readiness values only
    And it displays the assessed regulation count over the total
