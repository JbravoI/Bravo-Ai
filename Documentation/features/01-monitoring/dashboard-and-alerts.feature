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

  Scenario: Sort and refine dashboard alerts
    Given a user is viewing the dashboard alerts feed
    When they choose a publication-date sort or filter by risk, status, deadline or industry
    Then only alerts matching every selected filter are shown in the chosen order
    And choosing "Clear filters" restores the full active-jurisdiction feed

  Scenario: Page through alert results
    Given more than 10 alerts match the current feed filters
    When a user selects 20 items per page or moves to the next page
    Then the feed shows that selected page size or page
    And the selected jurisdiction remains unchanged

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

  Scenario: Opening Alerts acknowledges the selected jurisdiction
    Given a signed-in user has unread alerts in their selected jurisdiction
    And the user has unread alerts in another jurisdiction
    When they open the Alerts page
    Then every alert in the selected jurisdiction is marked viewed
    And the Alerts badge becomes zero
    And alerts from the other jurisdiction are not marked viewed
    And one audit entry records the bulk acknowledgement

  @not-yet-built
  Scenario: Dashboard stats reflect real tracked data
    Given the backend has ingested regulations from a real scan
    When a user opens the dashboard
    Then the stat counts are computed from stored regulations, not a fixed number
