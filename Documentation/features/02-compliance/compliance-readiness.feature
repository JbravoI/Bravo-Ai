Feature: Compliance readiness tracking
  Compliance teams need to see how prepared the firm is against each regulation's deadline.

  Scenario: View compliance readiness table
    Given a user opens the Compliance page
    Then they see every tracked regulation with its regulator, status, deadline, readiness percentage and priority

  Scenario: Readiness is visually flagged by severity
    Given a regulation has a readiness percentage below 40%
    When the compliance table renders that row
    Then the readiness bar is shown in the danger color
    And a regulation at or above 70% readiness is shown in the success color

  Scenario: Open a regulation from the compliance table
    Given a user is viewing the compliance table
    When they select a row, by mouse or by keyboard (Enter or Space while focused)
    Then the same regulation detail view used by the alerts feed opens

  @not-yet-built
  Scenario: Readiness percentage is user-editable
    Given a compliance officer has reviewed a regulation's implementation status
    When they update its readiness percentage
    Then the change is persisted and reflected on the dashboard and compliance table
    And the change is recorded in the audit trail
