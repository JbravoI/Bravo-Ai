Feature: Admin dashboard navigation
  Administrators need to find and manage platform accounts safely as the user base grows.

  Scenario: Filter and sort user access
    Given an administrator opens the Admin dashboard
    When they search by email or filter by role or account status
    Then only matching users are displayed
    And they can sort the list by join date, sign-in date or email
    And clear filters restores the full user list

  Scenario: Page through users
    Given more than 10 platform users exist
    When an administrator selects 20 users per page or moves to the next page
    Then the User access list displays the requested page

  Scenario: Filter password reset requests
    Given an administrator opens the password reset requests list
    When they filter by pending or issued state
    Then only matching reset requests are displayed
    And they can paginate the filtered list

  Scenario: Actions remain bound to the selected record
    Given an administrator has filtered or paginated the User access list
    When they change a role or unlock an account
    Then the action applies to that user's actual account
    And administrator-only permission checks still apply
