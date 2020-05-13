# strudel.js

A simple way to handle DOM element focus and aria rules :heart:

Having complex interactive elements on a web page can make it difficult to manually update `tabindex` and `aria-hidden`. But updating these attributes is super important for making any website accessible to people using keyboard or voice controls! strudel.js lets you define rules for tabindex and aria visibility *once* instead of dealing with a web of event listeners. 

## Quick example

```javascript
strudel.query(function() { return strudel.hasClass('.menu', 'opened'); })
    .else()
    .watch('.menu', 'class')
    .reaction('.burger', 'focusable');
```
This code block will automatically change all DOM elements with class 'burger' to be focusable when the `.menu` element has the class `opened`. The call to `.else()` tells strudel to apply the opposite condition (i.e. change burger elements to be unfocusable) in the case of the condition *not* being met.


## Model

strudel's syntax is based off of the syntax of a typical CSS media query: 

```css
@media screen and (max-width: 48em) {
  .burger {
    display: block;
  }
}
```
That is, you define:
1. a part of the web page to monitor for change\
e.g. `.watch('.menu', 'class')` in strudel, `screen` in css
\
2. a specific condition to satisfy\
e.g. the anonymous function passed into the `query()` call in strudel,  `max-width: 48em` in css
\
3. and a functionality which is applied only if the condition is satisfied.\
e.g. `.reaction('.burger', 'focusable')` in strudel, `.burger` styling in css
\
  
## Reference

`strudel.query(conditionFunction)`\
Set a new focus/aria rule and pass in a condition function.
\
\
`.else()`\
Add anywhere to a `query()` call chain to specify that the opposite behavior should be applied if the condition is not met.
\
\
`.watch(selector, attributeName)`\
Creates a MutationObserver object which waits until the `attributeName` attribute in the selected element changes. Note! If you specify a selector with multiple valid elements (e.g. using class name selector), then strudel will only listen for changes in the first qualifying element.
\
\
`.reaction(selector, behavior)`\
There are currently four behaviors to choose from: 
  - `focusable`, which sets an element's `tabindex=0`
  - `unfocusable`, which sets an element's `tabindex=-1`
  - `ariavisible`, which removes an element's `aria-hidden=true` attribute
  - `ariahidden`, which adds an `aria-hidden=true` attribute
\
\
  
You can make chains to your heart's desire! For instance, you might chain multiple `.watch()` calls to define multiple different relevant elements to be monitored. You could also add multiple `.reaction` calls to have many kinds of elements react to a single condition in different ways.

## Discussion

This tool operates under the assumption that assigning `tabindex` and `aria-hidden` values is a device and browser-compatible method for engaging with the Accessibility API. This may change over time, and it may change depending on the kind of technology that your audience uses. The reader is referred to libraries like [ally.js](https://allyjs.io/), which more thoroughly handle device compatibility concerns related to `tabindex` and `aria-hidden`.