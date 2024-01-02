const host = Cypress.env('HOST_COPA');
const slug = 'es/vuelos-desde-colombia-a-panama-pa'
const url = `${host}/${slug}`
const pageTitle = 'Vuela de Colombia a Panamá'

// Test suit to validate component 1
describe('[001] Test component Header', () => {
  before(() => {
    cy.visit(url);
  });
  it('validate title, logo and lang', () => {
    cy.title().should('eq', pageTitle);
    cy.get('.image').should('exist')
    cy.get('button[type="button"].relative.p-1.block.flex.flex-no-wrap.items-center[aria-expanded="false"]')
      .should('exist').should('be.visible');
  });
});

// Test suit to validate component 2
describe('[002] Test component Booking', () => {
  beforeEach(() => {
    cy.visit(url);
  });
  it('validate that the booking has all the elements', () => {
    cy.get('#headlessui-listbox-button-1').should('exist'); // tipo de pago
    cy.get('#headlessui-listbox-button-3').should('exist'); // tipo de vuelo
    cy.get('#headlessui-popover-button-5').should('exist'); // pasajeros
    cy.get('#headlessui-popover-button-10').should('exist'); // PromoCode
    cy.get('#flights-booking-id-1-input').should('exist'); // origen
    cy.get('#flights-booking-id-2-input').should('exist'); // destination
    cy.get('[data-att="start-date-toggler"]').should('exist'); // fecha de salida
    cy.get('[data-att="end-date-toggler"]').should('exist'); // fecha de retorno
    cy.get('button[data-att="search"]').should('exist'); // Boton de buscar
  })
  it('validate that handling missing data', () => {
    // Validate source error message
    cy.get('button[data-att="search"]').click().then(() => {
      cy.get('span.mt-1.css-1pkncn7[id="flights-booking-id-1-error"]')
        .should('exist')
        .contains('Ingresa una ciudad de origen');
    })
    // validate destination error message
    cy.get('button[data-att="clear"]').click().then(() => {
      cy.get('#flights-booking-id-1-input').click();
      cy.get('#flights-booking-id-1-input').type('BOG').then(() => {
        cy.get('div[data-att="BOG"]').click()
      });
      cy.get('button[data-att="search"]').click().then(() => {
        cy.get('#flights-booking-id-2-error')
          .should('exist')
          .contains('Ingresa una ciudad de destino');
      });
    });
    // validate error message departure date
    cy.get('#flights-booking-id-2-input').click()
    cy.get('#flights-booking-id-2-input').type('PTY').then(() => {
      cy.get('div[data-att="PTY"]').click()
    });
    cy.get('[data-att="start-date-toggler"]').click().then(() => {
      cy.get('[aria-label="fc-booking-departure-date-input-aria-label"]').clear().then(() => {
        cy.get('button[data-att="done"]').click()
      });
      cy.get('button[data-att="search"]').click()
    });
  })
  it('validate that the user can book a Round_trip flight', () => {
    cy.get('#flights-booking-id-1-input').type('BOG').then(() => {
      cy.get('div[data-att="BOG"]').click()
    });
    cy.get('#headlessui-listbox-button-3').click().then(() => {
      cy.get('div[data-att="rt"]').click().then(() => {
        cy.get('#headlessui-listbox-button-3')
          .invoke('text')
          .should('not.be.empty')
          .then((text) => {
            expect(text).to.equal('Ida y vuelta')
          });
      })
    })
  })
  it('validate that the user can book a One_way flight', () => {
    cy.get('#flights-booking-id-1-input').type('BOG').then(() => {
      cy.get('div[data-att="BOG"]').click()
    });
    cy.get('#headlessui-listbox-button-3').click().then(() => {
      cy.get('div[data-att="ow"]').click().then(() => {
        cy.get('#headlessui-listbox-button-3')
          .invoke('text')
          .should('not.be.empty')
          .then((text) => {
            expect(text).to.equal('Sólo ida')
          });
      })
    })
  })
})

// Test suit to validate Currency shown in offers
describe('[003] Test currency', () => {
  before(() => {
    cy.visit(url);
  });
  it('validate that the page shows the currency USD', () => {
    let preciosArray;
    cy.get('[data-test="price"]')
      .should('exist')
      .then((elements) => {
        preciosArray = Array.from(elements);
        preciosArray.forEach((element) => {
          const texto = element.textContent.trim();
          expect(texto.startsWith('USD')).to.be.true;
        });
      });
  });
});

// Test suits to validate the component 4
describe('[004] Test component Offers flights to Panama from Colombia', () => {
  beforeEach(() => {
    cy.visit(url);
  });
  it('validate that the component has all the elements', () => {
    // get all offers
    cy.get('[data-test="card-container"]').each(($element) => {
      cy.wrap($element)
        .find('[data-test="origin-text"]')
        .should('exist');
      cy.wrap($element)
        .find('[data-test="destination-text"]')
        .should('exist');
      cy.wrap($element)
        .find('[data-test="price"]')
        .should('exist');
    });
  })
  it('validate that the destination of all offers is PTY', () => {
    cy.get('[data-test="card-container"]').each(($element) => {
      cy.wrap($element)
        .find('[data-test="destination-text"]')
        .should('exist')
        .invoke('text')
        .then((text) => {
          expect(text).to.equal('Panamá (PTY)')
        });
    });
  })
  it('Validate offers by filtering by origin and destination', () => {
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').type('BOG').then(() => {
      cy.get('li[data-att="BOG"]').click().then(() => {
        cy.wait(1000)
        // get all offers 
        cy.get('[data-test="card-container"]').each(($element, index) => {
          if (index < 19) {
            cy.wrap($element)
              .find('[data-test="origin-text"]')
              .should('exist')
              .invoke('text')
              .then((text) => {
                expect(text).to.equal('Bogotá (BOG)a')
              });
            cy.wrap($element)
              .find('[data-test="destination-text"]')
              .should('exist')
              .invoke('text')
              .then((text) => {
                expect(text).to.equal('Panamá (PTY)')
              });
          }
        });
      })
    });
  })
  it('Validate offers for the Budget', () => {
    const budget = 207
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').type('BOG').then(() => {
      cy.get('li[data-att="BOG"]').click()
    });
    cy.get('#sfm-budget-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-budget-61bb554e93be941629417c6c-input').type(budget).then(() => {
      cy.wait(1000)
      cy.get('[data-test="card-container"]').each(($element, index) => {
        if (index < 19) {
          cy.wrap($element)
            .find('[data-test="price"]')
            .should('exist')
            .invoke('text')
            .then((price) => {
              const paserPrice = parseFloat(price.replace(/[^\d.]/g, ''));
              expect(paserPrice).to.be.lessThan(budget);
            });
        }
      });
    })
  })
  it('check data persistence when selecting an offer', () => {
    cy.get('[data-test="origin-text"]').eq(0).should('exist').invoke('text').as('originText');
    cy.get('[data-test="destination-text"]').eq(0).should('exist').invoke('text').as('destinationText');
    cy.get('[data-test="departing-text"]').eq(0).should('exist').invoke('text').as('departinText');
    cy.get('[data-test="travel-class"]').eq(0).should('exist').invoke('text').as('travelClassText');
    cy.get('[data-test="flight-type"]').eq(0).should('exist').invoke('text').as('flightTypeText');
    cy.get('[data-test="book-now"]').eq(0).scrollIntoView().click().then(() => {
      // originText
      cy.wait(500)
      cy.get('@originText').then((originText) => {
        const matches = originText.match(/\(([^)]+)\)/);
        const codigoOrigin = matches && matches[1] ? matches[1].trim() : '';
        cy.log(codigoOrigin)
        cy.get('[data-att="f1_origin"]').eq(1).click().then(() => {
          cy.get('[data-att="f1_origin"]').eq(1).invoke('text')
            .then((text) => {
              expect(text).to.include(codigoOrigin)
            });
        }) 
      });
    });
    // departinText
    cy.get('@departinText').then((dateText) => {
      const departureDate = dateText.split('-')[0].trim();
      const returnDate = dateText.split('-')[1].trim();
      cy.log(`departure: ${departureDate}`);
      cy.log(`return: ${returnDate}`);
    });
    // travelClassText
    cy.get('@travelClassText').then((travelClassText) => {
      cy.log(`Travel: ${travelClassText}`);
    });
    // flightTypeText
    cy.get('@flightTypeText').then((flightTypeText) => {
      cy.log(`flight: ${flightTypeText}`);
    });
  });
})
