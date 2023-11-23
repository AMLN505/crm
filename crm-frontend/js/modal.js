export default class Modal {
    constructor(options) {
      let defaultOptions = {
        isOpen: () => {},
        isClose: () => {},
      }
      this.options = Object.assign(defaultOptions, options);
      this.modal = document.querySelector('.main__modal');
      this.speed = false;
      this.animation = false;
      this.isOpen = false;
      this.modalContainer = false;
      this.previousActiveElement = false;
      this.fixBlocks = document.querySelectorAll('.fix-block');
      this.focusElements = [
        'a[href]',
        'input',
        'button',
        'select',
        'textarea',
        '[tabindex]'
      ]
      this.events();
    }
  
    events() {
      if (this.modal) {
        
        document.addEventListener('click', function (e) {
          const clickedElement = e.target.closest('[data-modal]');
          if (clickedElement) {
            let target = clickedElement.dataset.modal;
            let animation = clickedElement.dataset.animation;
            let speed = clickedElement.dataset.speed;
            this.animation = animation ? animation : 'fade';
            this.speed = speed ? parseInt(speed) : 100;
            this.modalContainer = document.querySelector(`[data-target="${target}"]`);
            this.open();
            return;
          }
  
          if (e.target.closest('.modal__exit-button') || e.target.closest('.modal__cancel-button')) {
            this.close();
            return
          }
        }.bind(this));
  
        window.addEventListener('keydown', function (e) {
          if (e.keyCode == 27) {
            if (this.isOpen) {
              this.close();
            }
          }
  
          if (e.keyCode == 9 && this.isOpen) {
            this.focusCatch(e);
            return;
          }
        }.bind(this));
  
        this.modal.addEventListener('click', function (e) {
          if (!e.target.classList.contains('modal__container') && !e.target.closest('.modal__container') && this.isOpen && !e.target.closest('.modal__contact-delete')) {
            this.close();
          }
        }.bind(this));        
      }
    }
  
    open() {
      this.previousActiveElement = document.activeElement;
  
      this.modal.style.setProperty('--transition-time', `${this.speed / 1000}s`);
      this.modal.classList.add('is-open');
      this.disableScroll();
  
      this.modalContainer.classList.add('modal-open');
      this.modalContainer.classList.add(this.animation);
  
      setTimeout(() => {
        this.options.isOpen(this);
        this.modalContainer.classList.add('animate-open');
        this.isOpen = true;
        this.focusTrap();
      }, this.speed);
    }
  
    close() {
      if (this.modalContainer) {
        this.modalContainer.classList.remove('animate-open');
        this.modalContainer.classList.remove(this.animation);
        this.modal.classList.remove('is-open');
        this.modalContainer.classList.remove('modal-open');
  
        this.enableScroll();
        this.options.isClose(this);
        this.isOpen = false;
        this.focusTrap();
        }
    }
  
    focusCatch(e) {
      const focusable = this.modalContainer.querySelectorAll(this.focusElements);
      const focusArray = Array.prototype.slice.call(focusable);
      const focusedIndex = focusArray.indexOf(document.activeElement);
  
      if (e.shiftKey && focusedIndex === 0) {
        focusArray[focusArray.length - 1].focus();
        e.preventDefault();
      }
  
      if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
        focusArray[0].focus();
        e.preventDefault();
      }
    }
  
    focusTrap() {
      const focusable = this.modalContainer.querySelectorAll(this.focusElements);
      if (this.isOpen) {
        focusable[0].focus();
      } else {
        this.previousActiveElement.focus();
      }
    }
  
    disableScroll() {
      let pagePositionY = window.scrollY;
      let pagePositionX = window.scrollX;
      this.lockPadding();

      document.body.dataset.positionY = pagePositionY;
      document.body.dataset.positionX = pagePositionX;
      document.body.style.top = -pagePositionY + 'px';
      document.body.style.left = -pagePositionX + 'px';
      document.body.classList.add('disable-scroll');
    }
  
    enableScroll() {
      let pagePositionY = parseInt(document.body.dataset.positionY, 10);
      let pagePositionX = parseInt(document.body.dataset.positionX, 10);
      this.unclockPadding();
      document.body.style.top = 'auto';
      document.body.style.left = 'auto';
      document.body.classList.remove('disable-scroll');
      window.addEventListener('hashchange', function () {
        window.scroll({ top: pagePositionY, left: pagePositionX });
        document.body.removeAttribute('data-positionY', 'data-positionX');
      })
      window.scroll({ top: pagePositionY, left: pagePositionX });
      document.body.removeAttribute('data-positionY', 'data-positionX');
    }
  
    lockPadding() {
      let paddingBodyOffset = window.innerWidth - document.body.offsetWidth + 'px';
      let paddingModalOffset = document.documentElement.clientWidth - document.body.offsetWidth + 'px';
      this.fixBlocks.forEach((el) => {
        el.style.paddingRight = paddingModalOffset;
      });
      document.body.style.paddingRight = paddingBodyOffset;
    }
  
    unclockPadding() {
      this.fixBlocks.forEach((el) => {
        el.style.paddingRight = '0px';
      });
      document.body.style.paddingRight = '0px';
    }
  };