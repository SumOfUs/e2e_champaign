
const {
  AK_USER,
  ak_password
} = process.env;

const host = `https://${AK_USER}:${AK_PASSWORD}@act.sumofus.org/rest/v1`;
const axios = require('axios');

let email;

describe("Petition Action", () => {
  before( () => {
    const timestamp = +(new Date());
    email = `omar+live-test-${timestamp}@sumofus.org`;
  })

  it("is successfully submitted and action is successfully written to actionkit", () => {
    let reqCount = 9;
    const req = () => {
      cy
      .request(`${host}/user/?email=${encodeURIComponent(email)}`)
      .then((resp) => {
        if (resp.status === 200 && resp.body.objects.length > 0) {
          expect(resp.body.objects[0].first_name).to.eq('Omar');
        } else {
          if(reqCount > 10) new Error("Too many requests!");
          reqCount += 1;
          req();
        }
      });
    };

    cy.visit("https://actions.sumofus.org/a/stop-credit-card-giants-from-funding-facist-hatred-and-violence")

    cy.get('.petition-bar__main form').within(($form) => {
      cy.get("input[type='email']")
        .type(email)
        .should('have.value', email);

      cy.get("input[name='name']")
        .type("Omar Sahyoun")
        .should('have.value', 'Omar Sahyoun');

      cy.get(".selectize-input")
        .click()
        .get(".selectize-input input")
        .type("United Kingdom {enter}")

      cy.contains("I'm a Mastercard customer").click();

      cy.get("button").click().then(req);
    });

    cy.contains("Will you make a donation?");
  });
});
