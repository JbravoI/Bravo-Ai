Feature: Audit trail
  Compliance teams need a reliable record of what the system did and when.

  Scenario: View the audit trail
    Given a user opens the Audit Trail page
    Then they see a chronological list of entries with a timestamp, a short label and a detail line

  Scenario: A completed scan writes a real audit entry
    Given the ingestion pipeline completes a real scan of regulator sources
    When the scan finishes
    Then a new audit entry is recorded with the real completion timestamp and a count of new or changed regulations
    And the entry appears on the Audit Trail page without requiring a page reload

  @not-yet-built
  Scenario: A preference change is recorded
    Given a signed-in user changes their jurisdiction or alert-threshold preferences
    When the change is saved
    Then an audit entry records what changed and by whom

  @not-yet-built
  Scenario: A Q&A exchange is recorded
    Given a signed-in user asks the AI a question and receives an answer
    When the exchange completes
    Then it is logged with the question, the answer, and any cited regulations
