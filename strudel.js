/**
 * Strudel object
 */
function Strudel() {
  this.query = function(conditionFunction) {
    return new StrudelQuery(conditionFunction);
  };

  this.isAttr = function(selector, attribute, value) {
    const element = document.querySelectorAll(selector)[0];
    return element.getAttribute(attribute) == value;
  };

  this.hasAttr = function(selector, attribute) {
    const element = document.querySelectorAll(selector)[0];
    return element.hasAttribute(attribute);
  };

  this.hasClass = function(selector, className) {
    const element = document.querySelectorAll(selector)[0];
    return element.classList.contains(className);
  };

  this.isStyle = function(selector, style, value) {
    const element = document.querySelectorAll(selector)[0];
    return getComputedStyle(element)[style] == value;
  };

  this.clickPress = function(selector, callback) {
    const theFunction = function(selector, callback) {
      const elements = document.querySelectorAll(selector);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.addEventListener('click', callback);
        element.addEventListener('keydown', function(event) {
          if (event.key == ' ' || event.key == 'Spacebar') {
            event.preventDefault();
            callback(event);
          }
          if (event.key == 'Enter') {
            callback(event);
          }
        });
      }
    };
    window.addEventListener('DOMContentLoaded', function(event) {
      theFunction(selector, callback);
    });
  };
}

/**
 * Class def for obj created by a strudel.query call
 * @param {function} conditionFunction a boolean function
 *   representing the case that must be satisfied to activate
 *   a certain behavior
 */
function StrudelQuery(conditionFunction) {
  const self = this;
  this.conditionFunction = conditionFunction;
  this.observers = [];
  this.reactions = [];

  this.getLastReaction = function() {
    return this.reactions[this.reactions.length - 1];
  };

  /* The following methods are, for the most part,
  the only ones that will be used as part of the
  client api */

  this.else = function() {
    const lastReaction = this.getLastReaction();
    lastReaction.doNegative = true;
    return this;
  };

  this.watch = function(actor, attributeName) {
    const callback = function(mutations, observer) {
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        if (mutation.type === 'attributes' &&
          mutation.attributeName == attributeName) {
          self.allReact();
          break;
        }
      }
    };
    const observer = new MutationObserver(callback);
    const target = document.querySelectorAll(actor)[0];
    const options = {
      attributes: true,
      attributeFilter: [attributeName],
    };

    observer.observe(target, options);
    this.observers.push(observer);

    return this;
  };

  this.reaction = function(selector) {
    const rxn = new StrudelReaction(selector);
    this.reactions.push(rxn);

    return this;
  };

  this.set = function(attribute, value) {
    const lastReaction = this.getLastReaction();
    const action = new StrudelAction('set', attribute, value);
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };

  this.add = function(attribute) {
    const lastReaction = this.getLastReaction();
    const action = new StrudelAction('add', attribute, 'none');
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };


  this.remove = function(attribute) {
    const lastReaction = this.getLastReaction();
    const action = new StrudelAction('remove', attribute, 'none');
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };


  /* Here ends the main client api methods */

  this.allReact = function() {
    const cond = this.conditionFunction();
    for (let i = 0; i < this.reactions.length; i++) {
      const reaction = this.reactions[i];
      if (cond) {
        reaction.doPositiveActions();
      } else if (reaction.doNegative) {
        reaction.doNegativeActions();
      }
    }
  };
}

/**
 * Class def representing a group of actions
 *   that strudel can apply to the DOM.
 * @param {string} selector string representing elements
 *   which are to be acted upon
 */
function StrudelReaction(selector) {
  this.selector = selector;
  this.positiveActions = [];
  this.negativeActions = [];
  this.doNegative = false;

  this.addPos = function(strudelAction) {
    this.positiveActions.push(strudelAction);
  };

  this.addNeg = function(strudelAction) {
    this.negativeActions.push(strudelAction);
  };

  this.doPositiveActions = function() {
    this.doActions(this.positiveActions);
  };

  this.doNegativeActions = function() {
    this.doActions(this.negativeActions);
  };

  this.doActions = function(actions) {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < actions.length; i++) {
      const doAction = actions[i];
      for (let j = 0; j < elements.length; j++) {
        const element = elements[j];
        if (doAction.type == 'add') {
          element.setAttribute(doAction.attribute, true);
        } else if (doAction.type == 'set') {
          element.setAttribute(doAction.attribute, doAction.value);
        } else if (doAction.type == 'remove') {
          element.removeAttribute(doAction.attribute);
        } else {
          console.log('Strudel: Unrecognized action type of ' + doAction.type);
        }
      }
    }
  };
}

/**
 * Wrapper for a strudel action.
 * @param {string} type      add, set, or remove
 * @param {string} attribute string compatible with setAttribute js function
 * @param {*}      value     new value
 */
function StrudelAction(type, attribute, value) {
  this.type = type;
  this.attribute = attribute;
  this.value = value;
}

const strudel = new Strudel();
window.strudel = strudel;
