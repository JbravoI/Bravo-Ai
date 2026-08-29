Feature: API and Swagger documentation
  The product needs a real, documented, independently testable API surface.

  Scenario: List regulations via the API
    Given the API is running
    When a client requests GET /api/regulations
    Then it receives a 200 response with a JSON array of regulations

  Scenario: Filter regulations by source
    Given the API is running
    When a client requests GET /api/regulations?source=fca
    Then only FCA-sourced regulations are returned
    And requesting an invalid source returns a 400 with an error message

  Scenario: Request a single regulation
    Given the API is running
    When a client requests GET /api/regulations/{id} for an id that does not exist
    Then it receives a 404 response with an error message

  Scenario: Trigger a scan
    Given the API is running
    When a client sends POST /api/scan
    Then it receives a 200 response whose body explicitly states the scan was simulated

  Scenario: Ask a question before AI Q&A is implemented
    Given the API is running and AI Q&A is not yet implemented
    When a client sends POST /api/query with a valid question
    Then it receives a 501 response, not a fabricated answer

  Scenario: Browse the API documentation
    Given a user opens /api-docs
    Then they see an interactive Swagger UI describing every route
    And each route's description states whether it is backed by seed data, simulated, or not yet implemented
