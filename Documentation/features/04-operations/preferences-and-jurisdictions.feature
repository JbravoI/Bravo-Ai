Feature: Preferences and jurisdictions
  Users need to scope the product to the jurisdictions and business areas they care about.

  Scenario: Choose one jurisdiction and save it
    Given a user is on the Preferences page
    When they select a jurisdiction pill such as "US"
    And they select "Save preferences"
    Then only "US" is active
    And the page refreshes with the saved preference

  Scenario: Select Nigeria as a jurisdiction
    Given a user is on the Preferences page
    When they select the "NG — Nigeria" jurisdiction pill
    And they select "Save preferences"
    Then it becomes the one saved jurisdiction for that user
    And the UI does not imply that Nigeria source scanning is enabled

  Scenario: Toggle an industry focus tag
    Given a user is on the Preferences page
    When they select an Industry Focus tab such as "Fintech"
    Then it becomes active independently of jurisdiction toggles and alert-threshold checkboxes

  Scenario: Preferences persist across sessions
    Given a signed-in user has saved one jurisdiction and specific industry focus tags
    When they sign out, sign back in, or reload the page
    Then their preferences are restored exactly as they left them

  Scenario: A second user does not see another user's preferences
    Given user A has saved specific jurisdiction and industry focus preferences
    When user B signs in for the first time
    Then user B sees the default preferences, not user A's saved values

  @not-yet-built
  Scenario: Preferences affect what alerts are shown
    Given a signed-in user has deactivated a jurisdiction
    When new regulations from that jurisdiction are ingested
    Then those regulations are excluded from their dashboard and alerts feed by default
