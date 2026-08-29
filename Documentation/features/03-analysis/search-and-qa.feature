Feature: Search and AI regulatory Q&A
  Compliance officers need to ask plain-English questions and get answers grounded in tracked regulations.

  Scenario: Ask a question from the dashboard Q&A panel
    Given a user is on the dashboard
    When they type a question and submit it
    Then their question appears in the conversation
    And a loading state is shown while a response is pending

  Scenario: Use a quick-question shortcut on the Search page
    Given a user is on the Search page
    When they select a quick-question shortcut such as "DORA"
    Then the search box and the Q&A input are pre-filled with that question
    And they can edit the pre-filled text before submitting

  Scenario: Q&A errors are shown, not swallowed
    Given the AI Q&A endpoint is unavailable or not yet implemented
    When a user submits a question
    Then an error message is shown in the conversation
    And the input becomes usable again so they can retry

  @not-yet-built
  Scenario: Answers are grounded and cited
    Given a real AI provider is wired up server-side
    When a user asks a question about a tracked regulation
    Then the answer cites the specific regulation(s) it draws from
    And no answer is generated from a client-supplied system prompt

  @not-yet-built
  Scenario: The AI provider key never reaches the browser
    Given the AI Q&A endpoint is implemented
    When a user submits a question and inspects the network request their browser sends
    Then no AI provider API key is present in any request the browser makes
