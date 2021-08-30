import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';


class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();


    //console.log('new Product:', thisProduct);
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log(this.initOrderForm);

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.dom.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    //console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);
        const optionImage = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // check if the option is not default
          if(!option.default) {
            // add option price to price variable
            price = price + option.price;
          }
          if(optionImage) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          // check if the option is default
          if(option.default) {
            // reduce price variable
            price = price - option.price;
          }
          if(optionImage) {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    /* multipy price by amount */
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  renderInMenu(){
    const thisProduct = this;

    //generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //create element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    //find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    //add element to menu
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.dom = {};

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion() {
    const thisProduct = this;

    //find the clickable trigger
    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log(clickableTrigger);

    //START: add event listener to clickable trigger on event click
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      // prevent default action
      event.preventDefault();
      // find active product (the one that has active class)
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //if there is active product and it's not thisProduct.element, remove active class
      if (activeProduct!=null && activeProduct!=thisProduct.element) {
        activeProduct.classList.remove('active');
      }
      //toggle active class on thiProduct.element
      thisProduct.element.classList.toggle('active');
    });

  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }
  addToCart(){
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.amountWidget.value * thisProduct.priceSingle,
      params: thisProduct.prepareCartProductParams(),
    };
    return  productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};
    //console.log(params);

    // for very category (param)
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {},
      };
      // for every option in this category
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected) {
          // option is selected!
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;
