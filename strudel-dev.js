function Strudel() {
  this.query = function (conditionFunction) {
    return new StrudelQuery(conditionFunction);
  }
}

const strudel = new Strudel();

function StrudelQuery(conditionFunction) {
  const self = this;
  this.conditionFunction = conditionFunction;
  this.observers = new Array();
  this.reactions = new Array();

  this.getLastReaction = function () {
    return this.reactions[this.reactions.length - 1];
  }

  /* The following methods are, for the most part,
  the only ones that will be used as part of the 
  client api */

  this.else = function () {
    let lastReaction = this.getLastReaction();
    lastReaction.doNegative = true;
    return this;
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

  this.reaction = function (selector) {
    let rxn = new StrudelReaction(selector);
    this.reactions.push(rxn);

    return this;
  }

  this.set = function (attribute, value) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction('set', attribute, value);
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {      
      lastReaction.addNeg(action);
    }

    return this;
  }

  this.add = function (attribute) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction('add', attribute, 'none');
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {      
      lastReaction.addNeg(action);
    }

    return this;
  }


  this.remove = function (attribute) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction('remove', attribute, 'none');
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {      
      lastReaction.addNeg(action);
    }

    return this;
  }


  /* Here ends the main client api methods */

  this.allReact = function () {
    let cond = this.conditionFunction();
    for (let i = 0; i < this.reactions.length; i++) {
      let reaction = this.reactions[i];
      if (cond()) {
        reaction.doPositiveActions();
      } else if (reaction.doNegative) {
        reaction.doNegativeActions();
      }
    }
  }

}

function StrudelReaction(selector) {
  this.selector = selector;
  this.elements = document.querySelectorAll(selector);
  this.positiveActions = new Array();
  this.negativeActions = new Array();
  this.doNegative = false;

  this.addPos = function (strudelAction) {
    this.positiveActions.push(strudelAction);
  }

  this.addNeg = function (strudelAction) {
    this.positiveActions.push(strudelAction);
  }

  this.doPositiveActions = function () {
    this.doActions(this.positiveActions);
  }

  this.doNegativeActions = function () {
    this.doActions(this.negativeActions);
  }

  this.doActions = function (array) {
    for (let i = 0; i < this.array.length; i++) {
      let action = this.array[i];
      for (let j = 0; j < this.elements.length; i++) {
        let element = this.elements[j];
        if (action.type == 'add') {
          element.createAttribute(action.attribute);
        } else if (action.type == 'set') {
          element.setAttribute(action.attribute, action.value);
        } else if (action.type == 'remove') {
          element.removeAttribute(action.attribute);
        } else {
          console.log("Strudel: Unrecognized action type of " + action.type);
        }
      }
    }
  }


}

function StrudelAction(type, attribute, value) {
  this.type = type;
  this.attribute = attribute;
  this.value = value;
}
