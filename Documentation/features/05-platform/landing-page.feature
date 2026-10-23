Feature: Public landing page
  Prospective users need an accurate explanation of Bravo Ai before creating an account.

  Scenario: Understand what Bravo Ai does before sign-in
    Given a visitor opens the public landing page
    Then they see an explanation of monitoring regulatory publications, prioritising updates, assessing impact and retaining an audit trail
    And they can navigate to sign in or create an account

  Scenario: Understand the signed-in workflow
    Given a visitor is reading the "What to expect inside" article
    Then they learn that they choose a jurisdiction, review updates, and use impact, readiness and audit information
    And they are told that official regulator publications remain authoritative

  Scenario: Landing page does not expose API documentation
    Given a visitor opens the public landing page
    Then there is no API documentation link in the landing-page navigation or calls to action
