Feature: Authentication
  The app must recognize a signed-in user across page loads and keep unauthenticated visitors out.

  Scenario: Sign up with a new account
    Given a visitor is on the signup page
    When they submit a profile name, a valid email and a password of at least 8 characters
    Then an account is created
    And they are signed in immediately afterward

  Scenario: Reject an invalid profile name
    Given a visitor is on the signup page
    When they submit a profile name shorter than 2 characters
    Then signup is rejected with a clear error message

  Scenario: Reject a duplicate signup
    Given an account already exists for an email address
    When someone tries to sign up again with that same email
    Then the signup is rejected with a clear error message

  Scenario: Sign in with correct credentials
    Given a visitor has an existing account
    When they submit the correct email and password on the login page
    Then they are signed in and redirected to the dashboard

  Scenario: Reject an incorrect password
    Given a visitor has an existing account
    When they submit the correct email but an incorrect password
    Then sign-in fails with an error message
    And no session is created

  Scenario: Unauthenticated visitors are redirected to login
    Given a visitor has no active session
    When they request any UI page other than /login or /signup
    Then they are redirected to /login

  Scenario: The public API surface stays public
    Given a visitor has no active session
    When they request a read-only API route such as /api/regulations
    Then the request succeeds, unlike UI pages

  Scenario: Sign out ends the session
    Given a user is signed in
    When they select Sign Out
    Then their session ends
    And they are redirected to the public landing page
    And subsequent requests for gated pages redirect to /login again

  Scenario: An inactive user is signed out
    Given a user is signed in
    When they do not interact with the product for five minutes
    Then their session ends
    And they are redirected to the public landing page
