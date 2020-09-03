/// <reference types="cypress" />

context('Custom path - we can create pages at a custom foo bar path', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('check header text', () => {
    cy.get('header').contains('Gatsby Default Starter');
  });

  it('check home page text', () => {
    cy.get('#homepage h1').contains('my homepage');
  });

  it('check first post', () => {
    cy.visit('/Published%20blogpost/published');
    cy.get('main').contains('Published blogpost');
  });

  it('check second post', () => {
    cy.visit('/published2/published2');
    cy.get('main').contains('published2');
  });
});
