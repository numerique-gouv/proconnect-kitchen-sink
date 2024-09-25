//

import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

//

Given("la page de démarrage", () => {
  cy.visit("/");
});

When("je clique sur {string}", function (text: string) {
  cy.contains(text).click();
});

When("je remplis le formulaire de connexion", function (string: string) {
  return "pending";
});

Then("je vois {string}", function (text: string) {
  cy.contains(text).should("be.visible");
});
