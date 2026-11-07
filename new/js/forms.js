'use strict';

// PLAIN JAVASCRIPT. Helpers shared by the feedback and visit forms.

const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(\+7|8)\d{10}$/;

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Date as "YYYY-MM-DD" in local time, the same format as <input type="date">.
function toDateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + month + '-' + day;
}

function addDays(days) {
  const today = new Date();
  return toDateValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() + days));
}

function formatDate(value) {
  return new Date(value + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

// Name, email and phone rules shared by both forms. Returns an object: field key → error message.
function validateContact(name, email, phone) {
  const errors = {};
  if (name.length < 2) {
    errors.name = 'Enter your name, at least 2 letters.';
  } else if (!NAME_PATTERN.test(name)) {
    errors.name = 'Use letters, spaces, hyphens or apostrophes only.';
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter an email address like name@example.kz.';
  }
  if (!PHONE_PATTERN.test(phone.replace(/[\s()-]/g, ''))) {
    errors.phone = 'Enter a Kazakhstan number: +7 or 8 followed by 10 digits.';
  }
  return errors;
}

// The midterm forms had a disabled submit button; the checks in code now replace the browser's.
// The required attributes stay in the HTML as the first line of defence: without JavaScript the browser still enforces them.
// No browser check replaces a check on the server: the visitor controls the browser and can switch it off or send the request directly.
function enableForm(form) {
  const submitButton = form.querySelector('button[type="submit"]');
  form.noValidate = true;
  submitButton.disabled = false;
  submitButton.classList.replace('btn-secondary', 'btn-primary');
}

// Adds an error message under each listed field and returns the function that reports errors.
// getErrors reads the form again, so an error disappears only once the field is really fixed.
function setUpFieldErrors(form, names, getErrors) {
  const errorElements = {};

  function controlsOf(name) {
    const control = form.elements[name];
    return control instanceof RadioNodeList ? Array.from(control) : [control];
  }

  function showError(name, message) {
    controlsOf(name).forEach((control) => {
      control.classList.add('is-invalid');
      control.setAttribute('aria-invalid', 'true');
    });
    errorElements[name].textContent = message;
    errorElements[name].classList.add('d-block');
  }

  function clearError(name) {
    controlsOf(name).forEach((control) => {
      control.classList.remove('is-invalid');
      control.removeAttribute('aria-invalid');
    });
    errorElements[name].textContent = '';
    errorElements[name].classList.remove('d-block');
  }

  // For radio buttons the message goes under the last option.
  names.forEach((name) => {
    const controls = controlsOf(name);
    const last = controls[controls.length - 1];
    const error = createElement('span', 'invalid-feedback');
    error.id = name + '-error';
    (last.type === 'radio' ? last.parentElement : last).after(error);
    controls.forEach((control) => control.setAttribute('aria-describedby', error.id));
    errorElements[name] = error;
  });

  // One listener on the form catches every field, including fields created in code; event.target is the field that changed.
  ['input', 'change'].forEach((type) => {
    form.addEventListener(type, (event) => {
      const name = event.target.name;
      if (errorElements[name] === undefined || !event.target.classList.contains('is-invalid')) {
        return;
      }
      const message = getErrors()[name];
      if (message === undefined) {
        clearError(name);
      } else {
        showError(name, message);
      }
    });
  });
  form.addEventListener('reset', () => names.forEach(clearError));

  // Shows the errors in page order, focuses the first invalid field and returns true when there are none.
  return function report(errors) {
    names.forEach(clearError);
    const invalid = names.filter((name) => errors[name] !== undefined);
    invalid.forEach((name) => showError(name, errors[name]));
    if (invalid.length > 0) {
      controlsOf(invalid[0])[0].focus();
    }
    return invalid.length === 0;
  };
}

function createSummaryBox(form) {
  const summary = createElement('div', 'form-note p-3 p-md-4 mt-4 d-none');
  summary.tabIndex = -1;
  summary.setAttribute('role', 'status');
  form.after(summary);
  form.addEventListener('reset', () => summary.classList.add('d-none'));
  return summary;
}

function showSummary(summary, title, rows, notes) {
  const list = createElement('dl', 'row mb-3');
  rows.forEach((row) => {
    list.append(createElement('dt', 'col-sm-4 fw-semibold', row[0]), createElement('dd', 'col-sm-8 mb-2', row[1]));
  });
  summary.replaceChildren(createElement('h3', 'subheading', title), list);
  notes.forEach((note) => summary.append(createElement('p', '', note)));
  summary.lastElementChild.classList.add('mb-0');
  summary.classList.remove('d-none');
  summary.focus();
}
