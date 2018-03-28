const braintree = require("braintree");

const {
  MERCHANT_ID,
  PUBLIC_KEY,
  PRVIATE_KEY,
  CC_NUM,
  CC_CVV,
  CC_EXP,
  EMAIL,
} = process.env;

const gateway = braintree.connect({
  environment: braintree.Environment.Production,
  merchantId: MERCHANT_ID,
  publicKey: PUBLIC_KEY,
  privateKey: PRVIATE_KEY
});


const getTransactions = () => {
  const MS_PER_MINUTE = 60000;
  const fiveMinutesAgo = new Date((new Date()) - 1 * MS_PER_MINUTE)
    .toISOString();

  return new Cypress.Promise((resolve, reject) => {

    gateway.transaction.search(function (search) {
      search.customerEmail().is(EMAIL);
      search.amount().is('2.00');
      search.createdAt().min(fiveMinutesAgo)
    }, function (err, response) {
      console.log("RESPONSE");
      response.each( (err, transaction) => {
        console.log("see", transaction);
      });

      resolve(response);
    });
  })
};


describe("first test", () => {
  it("does stuff", () => {
    cy.visit("https://actions.sumofus.org/a/donate");
    cy.get('a.AmountSelection__currency-toggle').click();
    cy.get('select.AmountSelection__currency-selector')
      .select('GBP')

    cy.contains("£2").click();

    cy.get("input[name='name']")
      .type("Glen Berman")
      .should('have.value', 'Glen Berman');

    cy.get("input[name='email']")
      .type(EMAIL)
      .should('have.value', EMAIL);

    cy.get(".SweetSelect.sweet-placeholder")
      .click()
      .get(".SweetSelect.sweet-placeholder input")
      .type("United States {enter}")

    cy.contains("Proceed to payment").click();

    cy.get(".Button-root.DonateButton")

    cy.contains("Securely store my payment information").click()

    cy.get('iframe#braintree-hosted-field-number')
      .then( iframe => {
        const doc = iframe.contents().find("body");

        cy.wrap(doc).find('input#credit-card-number')
            .type(CC_NUM)
    });

    cy.get('iframe#braintree-hosted-field-cvv')
      .then( iframe => {
        const doc = iframe.contents().find("body");

        cy.wrap(doc).find("input[name='cvv']")
            .type(CC_CVV, {force: true});
    });

    cy.get('iframe#braintree-hosted-field-expirationDate')
      .then( iframe => {
        const doc = iframe.contents().find("body");

        cy.wrap(doc).find("input[name='expiration']")
          .type(CC_EXP, {force: true});
    });

    cy.get(".Button-root.DonateButton").click();

    cy.contains("You're awesome");
  })

  it('has recorded the transaction', () => {
    cy.wrap(null).then(() => {
      return getTransactions().then((response) => {
        assert.isAbove(response.ids.length, 0, "no braintree transactions returned");
        response.each(function (err, transaction) {
          console.log(transaction.status);
          expect(transaction.status).to.eq('submitted_for_settlement')
        });
      });
    });
  });
})
