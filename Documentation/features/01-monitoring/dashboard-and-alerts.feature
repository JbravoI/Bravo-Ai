Feature: Dashboard and regulatory alerts
  Compliance officers need one place to see what regulatory updates exist and what needs attention.

  Scenario: View dashboard summary stats
    Given a user opens the dashboard
    Then they see counts for regulations tracked, high priority items, pending review items and a compliance score

  Scenario: Filter alerts by regulator source
    Given a user is viewing the alerts feed
    When they select the "FCA" filter tab
    Then only FCA-sourced regulations are shown
    And selecting "All" restores the full feed

  Scenario: Filtering alerts does not affect unrelated preferences
    Given a user has "Banking" and "Investment" active under Preferences > Industry Focus
    When they visit the Alerts page and change the source filter
    Then the Industry Focus selection remains unchanged when they return to Preferences

  Scenario: Open a regulation's detail view
    Given a user is viewing the alerts feed
    When they select a regulation card
    Then a detail view opens showing the AI summary, business impact and affected areas
    And the detail view can be closed with the Escape key or a close control
    And keyboard focus returns to a sensible location when the detail view closes

  Scenario: Alert cards are keyboard operable
    Given a user is navigating the alerts feed by keyboard only
    When they tab to a regulation card and press Enter
    Then the regulation's detail view opens

  Scenario: Reading an alert reduces the unread badge
    Given a signed-in user has unread regulations
    When they open an alert's detail view
    Then the Alerts navigation badge decreases by one
    And the regulation remains read after the user refreshes the page

  @not-yet-built
  Scenario: Dashboard stats reflect real tracked data
    Given the backend has ingested regulations from a real scan
    When a user opens the dashboard
    Then the stat counts are computed from stored regulations, not a fixed number
