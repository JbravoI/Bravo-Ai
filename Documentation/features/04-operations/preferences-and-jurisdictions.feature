Feature: Preferences and jurisdictions
  Users need to scope the product to the jurisdictions and business areas they care about.

  Scenario: Toggle a jurisdiction
    Given a user is on the Preferences page
    When they select a jurisdiction pill such as "US"
    Then it becomes active
    And selecting it again deactivates it

  Scenario: Toggle an industry focus tag
    Given a user is on the Preferences page
    When they select an Industry Focus tab such as "Fintech"
    Then it becomes active independently of jurisdiction toggles and alert-threshold checkboxes

  Scenario: Preferences persist across sessions
    Given a signed-in user has toggled specific jurisdictions and industry focus tags
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
