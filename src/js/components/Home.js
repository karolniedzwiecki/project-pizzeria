import {select, templates} from '../settings.js';
import {app} from '../app.js';

class Home {
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    //thisHome.initWidgets();
    thisHome.goToPage();

  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.homePage();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.order = thisHome.dom.wrapper.querySelector(select.home.orderButton);
    thisHome.dom.book = thisHome.dom.wrapper.querySelector(select.home.bookButton);


  }

  // initWidgets(){
  //
  //   const elem = document.querySelector('.main-carousel');
  //   let flkty = new Flickity(elem, {
  //     contain: true,
  //     autoPlay: true,
  //     prevNextButtons: false,
  //     wrapAround: true,
  //   });
  // }

  goToPage() {
    const thisHome = this;

    thisHome.dom.order.addEventListener('click', function(){
      app.activatePage('order');
    });

    thisHome.dom.book.addEventListener('click', function(){
      app.activatePage('booking');
    });

  }

}

export default Home;
