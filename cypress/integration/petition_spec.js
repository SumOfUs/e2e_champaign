
const host = `https://${Cypress.env('AK_USERNAME')}:${Cypress.env('AK_PASSWORD')}@act.sumofus.org/rest/v1`;
const axios = require('axios');
let email;

const getUserFromActionKit = () => {
  return new Cypress.Promise((resolve, reject) => {
    return axios
      .get(`${host}/user/?email=${encodeURIComponent(email)}`)
      .then( resp => resolve(resp) )
      .catch( err => {
        console.log("ActionKit Request Error", err);
        return reject(err);
      })
  });
}

describe("Petition Action", () => {
  before( () => {
    const timestamp = +(new Date());
    email = `omar+live-test-${timestamp}@sumofus.org`;
  })

  it("is successfully submitted and action is successfully written to actionkit", () => {
    let reqCount = 0;

    const req = () => {
      cy.wrap(null).then(() => {
        return getUserFromActionKit()
          .then( resp => {
            if (resp.status === 200 && resp.data.objects.length > 0) {
              expect(resp.data.objects[0].first_name).to.eq('Omar');
            } else {
              if(reqCount > 7) new Error("Too many requests!");
              reqCount += 1;
              req();
            }
          })
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
