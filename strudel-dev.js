function Strudel() {
  this.query = function (conditionFunction) {
    return new StrudelQuery(conditionFunction);
  };
  
  this.isAttr = function(selector, attribute, value) {
    let element = document.querySelectorAll(selector)[0];
    return element.getAttribute(attribute) == value;
  }
  
  this.hasAttr = function(selector, attribute) {
    let element = document.querySelectorAll(selector)[0];
    return element.hasAttribute(attribute);
  }
  
  this.hasClass = function(selector, className) {
    let element = document.querySelectorAll(selector)[0];
    return element.classList.contains(className);
  }
  
  this.isStyle = function(selector, style, value) {
    let element = document.querySelectorAll(selector)[0];
    return getComputedStyle(element)[style] == value;
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
  };

  /* The following methods are, for the most part,
  the only ones that will be used as part of the
  client api */

  this.else = function () {
    let lastReaction = this.getLastReaction();
    lastReaction.doNegative = true;
    return this;
  };

  this.watch = function (actor, attributeName) {
    let callback = function (mutations, observer) {
      for (let i = 0; i < mutations.length; i++) {
        let mutation = mutations[i];
        if (mutation.type === "attributes" &&
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
  };

  this.reaction = function (selector) {
    let rxn = new StrudelReaction(selector);
    this.reactions.push(rxn);

    return this;
  };

  this.set = function (attribute, value) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction("set", attribute, value);
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };

  this.add = function (attribute) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction("add", attribute, "none");
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };


  this.remove = function (attribute) {
    let lastReaction = this.getLastReaction();
    let action = new StrudelAction("remove", attribute, "none");
    if (!lastReaction.doNegative) {
      lastReaction.addPos(action);
    } else {
      lastReaction.addNeg(action);
    }

    return this;
  };


  /* Here ends the main client api methods */

  this.allReact = function () {
    let cond = this.conditionFunction();
    for (let i = 0; i < this.reactions.length; i++) {
      let reaction = this.reactions[i];
      if (cond) {
        reaction.doPositiveActions();
      } else if (reaction.doNegative) {
        reaction.doNegativeActions();
      }
    }
  };

}

function StrudelReaction(selector) {
  this.selector = selector;
  this.positiveActions = new Array();
  this.negativeActions = new Array();
  this.doNegative = false;

  this.addPos = function (strudelAction) {
    this.positiveActions.push(strudelAction);
  };

  this.addNeg = function (strudelAction) {
    this.negativeActions.push(strudelAction);
  };

  this.doPositiveActions = function () {
    this.doActions(this.positiveActions);
  };

  this.doNegativeActions = function () {
    this.doActions(this.negativeActions);
  };

  this.doActions = function (actions) {
    let elements = document.querySelectorAll(selector);
    for (let i = 0; i < actions.length; i++) {
      let doAction = actions[i];
      for (let j = 0; j < elements.length; j++) {
        let element = elements[j];
        if (doAction.type == "add") {
          element.setAttribute(doAction.attribute, true);
        } else if (doAction.type == "set") {
          element.setAttribute(doAction.attribute, doAction.value);
        } else if (doAction.type == "remove") {
          element.removeAttribute(doAction.attribute);
        } else {
          console.log("Strudel: Unrecognized action type of " + doAction.type);
        }
      }
    }
  };


}

function StrudelAction(type, attribute, value) {
  this.type = type;
  this.attribute = attribute;
  this.value = value;
}
