function Strudel() {
  /* Basic helper methods which define important functionality. */
  /* The developer is encouraged to modify these as needed. */
  
  this.makeFocusable = function (element) {
    element.setAttribute('tabIndex', 0);
  }
  this.makeNotFocusable = function (element) {
    element.setAttribute('tabIndex', -1);
  }
  this.makeAria = function (element) {
    element.removeAttribute('aria-hidden');
  }
  this.makeNotAria = function (element) {
    element.setAttribute('aria-hidden', 'true');
  }

  this.query = function (conditionFunction) {
    let strudelQuery = new StrudelQuery(conditionFunction);
    return strudelQuery;
  }
  
  this.attrCheck = function(selector, attribute, value) {
    let element = document.querySelectorAll(selector)[0];
    return element.getAttribute(attribute) == value;
  }
  
  this.hasClass = function(selector, className) {
    let element = document.querySelectorAll(selector)[0];
    return element.classList.contains(className);
  }
  
  this.styleCheck = function(selector, style, value) {
    let element = document.querySelectorAll(selector)[0];
    return getComputedStyle(element)[style] == value;
  }
}

function StrudelRouter() {
  this.processBehavior = function(behaviorString) {
    if (behaviorString == 'focusable') {
      return strudel.makeFocusable;
    } else if (behaviorString == 'unfocusable') {
      return strudel.makeNotFocusable;
    } else if (behaviorString == 'ariahidden') {
      return strudel.makeNotAria;
    } else if (behaviorString == 'ariavisible') {
      return strudel.makeAria;
    } else {
      console.log('Please make sure to use a valid behavior name!');
      return;
    }
  }

  this.oppositeBehavior = function(behaviorString) {
    if (behaviorString == 'focusable') {
      return strudel.makeNotFocusable;
    } else if (behaviorString == 'unfocusable') {
      return strudel.makeFocusable;
    } else if (behaviorString == 'ariahidden') {
      return strudel.makeAria;
    } else if (behaviorString == 'ariavisible') {
      return strudel.makeNotAria;
    } else {
      console.log('Please make sure to use a valid behavior name!');
      return;
    }
  }
}

const strudel = new Strudel();
const router = new StrudelRouter();

function StrudelQuery(condition) {
  this.condition = condition;
  this.checkElseCondition = false;
  this.observers = new Array();
  this.reactors = new Array();
  const self = this;

  this.else = function () {
    this.checkElseCondition = true;
    return this;
  }
  
  this.allReact = function () {
    let conditionSatisfied = this.condition();
    for (let i = 0; i < this.reactors.length; i++) {
      let reactor = this.reactors[i];
      if (conditionSatisfied) {
        reactor.act();
      } else if (this.checkElseCondition) {
        reactor.actNot();
      }
    }
  }
  
  this.watch = function (actor, attributeName) {
    let callback = function (mutations, observer) {
      for (let i = 0; i < mutations.length; i++) {
        let mutation = mutations[i];
        if (mutation.type === 'attributes' &&
          mutation.attributeName == attributeName) {
          self.allReact();
          break;
        }
      }
    }
    let observer = new MutationObserver(callback);
    let target = document.querySelectorAll(actor)[0];
    let options = {
      attributes: true,
      attributeFilter: [attributeName],
    }

    observer.observe(target, options);
    this.observers.push(observer);

    return this;
  }
  

  
  this.reaction = function(reactor, behavior) {
    let behaviorFunction = router.processBehavior(behavior);
    let oppositeFunction = router.oppositeBehavior(behavior);
    let rxn = new StrudelReaction(reactor, behaviorFunction, oppositeFunction);
    this.reactors.push(rxn);
    return this;
  }
  
}

function StrudelReaction(reactor, behaviorFunction, oppositeFunction) {
  this.behaviorFunction = behaviorFunction;
  this.reactors = document.querySelectorAll(reactor);
  this.oppositeFunction = oppositeFunction;
  
  this.act = function () {
    for (let i = 0; i < this.reactors.length; i++) {
      let element = this.reactors[i];
      this.behaviorFunction(element);
    }
  }

  this.actNot = function () {
    for (let i = 0; i < this.reactors.length; i++) {
      let element = this.reactors[i];
      this.oppositeFunction(element);
    }
  }
}
