const host = Cypress.env('HOST_COPA');
const slug = 'es/vuelos-desde-colombia-a-panama-pa'
const url = `${host}/${slug}`
const pageTitle = 'Vuela de Colombia a Panamá'

// Test suit para validar componente 1
describe('[001] Test componente Header', () => {
  before(() => {
    cy.visit(url);
  });
  it('validar titulo, logo y lang', () => {
    cy.title().should('eq', pageTitle);
    cy.get('.image').should('exist')
    cy.get('button[type="button"].relative.p-1.block.flex.flex-no-wrap.items-center[aria-expanded="false"]')
      .should('exist').should('be.visible');  
  });
});

// Test suits para validar el componente 2
describe('[002] Test componente Booking', () => {
  beforeEach(() => {
    cy.visit(url);
  });
  it('validar que el booking  tiene todos los elementos', () => {
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
  it('validar que el manejo de datos faltantes', () => {
    // Validar mensaje de error origen
    cy.get('button[data-att="search"]').click().then(() => {
      cy.get('span.mt-1.css-1pkncn7[id="flights-booking-id-1-error"]')
      .should('exist') 
      .contains('Ingresa una ciudad de origen');   
    })
    // validar mensaje de error destino
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
    // validar mensaje de error fecha de salida
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
  it('validar que el usuario puede reservar un vuelo Round_trip', () => {
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
  it('validar que el usuario puede reservar un vuelo One_way', () => {
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

// Test suit para validar Currency mostrado en las ofertas
describe('[003] Test currency', () => {
  before(() => {
    cy.visit(url);
  });
  it('validar que la pagina muestra el currency USD', () => {
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

// Test suits para validar el componente 4
describe('[004] Test componente Ofertas vuelos a Panamá de Colombia', () => {
  beforeEach(() => {
    cy.visit(url);
  });
  it('validar que el componente tiene todos los elementos', () => {
    // obtener todos las ofertas 
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
  it('validar que el destino de todas las ofertas sea PTY', () => {
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
  it('Validar ofertas al filtrar por origin y destination', () => {
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').type('BOG').then(() => {
      cy.get('li[data-att="BOG"]').click().then(()=>{
        cy.wait(1000)
        // obtener todos las ofertas 
        cy.get('[data-test="card-container"]').each(($element, index) => {
          if(index < 19){
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
  it('Validar ofertas por el Budget', () => {
    const budget = 207
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-origin-61bb554e93be941629417c6c-input').type('BOG').then(() => {
      cy.get('li[data-att="BOG"]').click()
    });
    cy.get('#sfm-budget-61bb554e93be941629417c6c-input').click()
    cy.get('#sfm-budget-61bb554e93be941629417c6c-input').type(budget).then(() => {
      cy.wait(1000)
      cy.get('[data-test="card-container"]').each(($element, index) => {
        if(index < 19){
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
  it('verificar que el usuario puede seleccionar una oferta disponible', () => {
    cy.get('[data-test="origin-text"]').should('exist').should('include.text', 'Bogotá (BOG)a');
    cy.get('[data-test="destination-text"]').should('exist').should('include.text', 'Panamá (PTY)');  
    cy.get('[data-test="departing-text"]').first().should('exist').should('include.text', 'feb 23, 2024 - mar 24, 2024');    
    cy.contains('button[data-test="book-now"]', 'Reserva ahora').should('exist').click();
    cy.get('.justify-start.css-0 > .justify-start').should('exist');   
    cy.get('input#flights-booking-popup-id-15-input[aria-label="fc-booking-origin-aria-label"]').should('exist');
    cy.get('.justify-between > .justify-end > .flex-wrap > .block')
    .should('exist')  // Verifica que el elemento exista
    .click();  
    cy.get('.justify-between > .justify-end > .flex-wrap > .block').click(); 
  });
})