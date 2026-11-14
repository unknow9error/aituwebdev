'use strict';

// PLAIN JAVASCRIPT. Visitor accounts: create an account, sign in, sign out.
// There is no server, so accounts are kept in this browser's localStorage; the password is stored only as a SHA-256 hash.
// A signed-in visitor gets their name, email and phone filled in on the feedback and visit forms.

const ACCOUNTS_KEY = 'golden-coffee-accounts';
const SESSION_KEY = 'golden-coffee-session';
const MIN_PASSWORD = 8;

function loadAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function findAccount(email) {
  return loadAccounts().find((account) => account.email === email);
}

function getSignedInAccount() {
  try {
    const email = sessionStorage.getItem(SESSION_KEY);
    return email === null ? null : findAccount(email) || null;
  } catch (error) {
    return null;
  }
}

async function hashPassword(password, salt) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validatePassword(password, confirmation) {
  const errors = {};
  if (password.length < MIN_PASSWORD) {
    errors.password = 'Use at least ' + MIN_PASSWORD + ' characters.';
  } else if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    errors.password = 'Use at least one letter and one digit.';
  }
  if (confirmation !== password) {
    errors.confirm = 'The passwords do not match.';
  }
  return errors;
}

// The page part is wrapped in a function so its variable names cannot clash with the other scripts.
(() => {
  const navigation = document.querySelector('#main-navigation .navbar-nav');

  const controls = document.createElement('li');
  controls.className = 'nav-item auth-controls';
  controls.innerHTML = `
    <button class="auth-button" type="button" data-sign-in>Sign in</button>
    <span class="auth-user" hidden></span>
    <button class="auth-button" type="button" data-sign-out hidden>Log out</button>
  `;
  navigation.append(controls);
  navigation.classList.add('auth-navigation');

  const dialog = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-title');
  dialog.setAttribute('aria-describedby', 'auth-note');
  dialog.innerHTML = `
    <button class="auth-close" type="button" aria-label="Close">×</button>
    <p class="auth-eyebrow">Golden Coffee</p>
    <h2 id="auth-title">Sign in</h2>
    <p id="auth-note" class="auth-note"></p>
    <form class="auth-form" data-view="sign-in" novalidate>
      <label for="sign-in-email">Email</label>
      <input id="sign-in-email" name="email" type="email" autocomplete="email" required maxlength="120">
      <label for="sign-in-password">Password</label>
      <input id="sign-in-password" name="password" type="password" autocomplete="current-password" required maxlength="128">
      <p class="auth-error" role="alert" hidden></p>
      <button class="auth-submit" type="submit">Sign in</button>
      <button class="auth-secondary" type="button" data-show="register">Create an account</button>
    </form>
    <form class="auth-form" data-view="register" novalidate hidden>
      <label for="register-name">Your name</label>
      <input id="register-name" name="name" type="text" autocomplete="name" required maxlength="80" aria-describedby="register-name-error">
      <p id="register-name-error" class="auth-error" hidden></p>
      <label for="register-email">Email</label>
      <input id="register-email" name="email" type="email" autocomplete="email" required maxlength="120" aria-describedby="register-email-error">
      <p id="register-email-error" class="auth-error" hidden></p>
      <label for="register-phone">Phone</label>
      <input id="register-phone" name="phone" type="tel" autocomplete="tel" required maxlength="30" placeholder="+7 701 000 00 00" aria-describedby="register-phone-error">
      <p id="register-phone-error" class="auth-error" hidden></p>
      <label for="register-password">Password</label>
      <input id="register-password" name="password" type="password" autocomplete="new-password" required maxlength="128" aria-describedby="register-password-error">
      <p id="register-password-error" class="auth-error" hidden></p>
      <label for="register-confirm">Repeat the password</label>
      <input id="register-confirm" name="confirm" type="password" autocomplete="new-password" required maxlength="128" aria-describedby="register-confirm-error">
      <p id="register-confirm-error" class="auth-error" hidden></p>
      <button class="auth-submit" type="submit">Create account</button>
      <button class="auth-secondary" type="button" data-show="sign-in">I already have an account</button>
    </form>
    <div class="auth-demo">
      <p>Your account is saved only in this browser. Nothing is sent to Golden Coffee, so do not reuse a password from another site.</p>
    </div>
  `;
  document.body.append(dialog);

  const signInButton = controls.querySelector('[data-sign-in]');
  const signOutButton = controls.querySelector('[data-sign-out]');
  const userLabel = controls.querySelector('.auth-user');
  const title = dialog.querySelector('#auth-title');
  const note = dialog.querySelector('#auth-note');
  const signInForm = dialog.querySelector('[data-view="sign-in"]');
  const registerForm = dialog.querySelector('[data-view="register"]');
  const signInError = signInForm.querySelector('.auth-error');
  const registerFields = ['name', 'email', 'phone', 'password', 'confirm'];

  const views = {
    'sign-in': { form: signInForm, title: 'Sign in', note: 'Sign in to have your name, email and phone filled in on our forms.' },
    register: { form: registerForm, title: 'Create an account', note: 'It takes a minute. Your details will then be filled in for you on the feedback and visit forms.' }
  };

  function showView(name) {
    Object.keys(views).forEach((key) => {
      views[key].form.hidden = key !== name;
    });
    title.textContent = views[name].title;
    note.textContent = views[name].note;
    views[name].form.elements[0].focus();
  }

  function renderSession() {
    const account = getSignedInAccount();
    signInButton.hidden = account !== null;
    signOutButton.hidden = account === null;
    userLabel.hidden = account === null;
    userLabel.textContent = account !== null ? account.name : '';
    userLabel.title = account !== null ? 'Signed in as ' + account.email : '';
  }

  function signIn(account) {
    try {
      sessionStorage.setItem(SESSION_KEY, account.email);
    } catch (error) {
      // Storage is blocked: the visitor stays signed out.
    }
    renderSession();
    dialog.close();
    document.dispatchEvent(new Event('accountchange'));
  }

  function readRegistration() {
    return {
      name: registerForm.elements.name.value.trim(),
      email: registerForm.elements.email.value.trim().toLowerCase(),
      phone: registerForm.elements.phone.value.trim(),
      password: registerForm.elements.password.value,
      confirm: registerForm.elements.confirm.value
    };
  }

  function validateRegistration(values) {
    const errors = Object.assign(validateContact(values.name, values.email, values.phone), validatePassword(values.password, values.confirm));
    if (errors.email === undefined && findAccount(values.email) !== undefined) {
      errors.email = 'An account with this email already exists. Sign in instead.';
    }
    return errors;
  }

  function showFieldError(name, message) {
    const field = registerForm.elements[name];
    const error = document.getElementById('register-' + name + '-error');
    field.setAttribute('aria-invalid', String(message !== undefined));
    error.textContent = message || '';
    error.hidden = message === undefined;
  }

  signInButton.addEventListener('click', () => {
    dialog.showModal();
    showView('sign-in');
  });

  signOutButton.addEventListener('click', () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      // Nothing to remove.
    }
    renderSession();
    document.dispatchEvent(new Event('accountchange'));
    signInButton.focus();
  });

  // One listener for "Create an account", "I already have an account", the close button and the backdrop.
  dialog.addEventListener('click', (event) => {
    const switchButton = event.target.closest('[data-show]');
    if (switchButton !== null) {
      showView(switchButton.dataset.show);
    } else if (event.target.closest('.auth-close') !== null || event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    signInForm.reset();
    registerForm.reset();
    signInError.hidden = true;
    registerFields.forEach((name) => showFieldError(name, undefined));
    (signInButton.hidden ? signOutButton : signInButton).focus();
  });

  // An error disappears as soon as the field is correct.
  registerForm.addEventListener('input', (event) => {
    const name = event.target.name;
    if (event.target.getAttribute('aria-invalid') === 'true') {
      showFieldError(name, validateRegistration(readRegistration())[name]);
    }
  });

  registerForm.addEventListener('submit', async (event) => {
    // Without this the browser would reload the page and the dialog would close.
    event.preventDefault();
    const values = readRegistration();
    const errors = validateRegistration(values);
    registerFields.forEach((name) => showFieldError(name, errors[name]));
    const firstInvalid = registerFields.find((name) => errors[name] !== undefined);
    if (firstInvalid !== undefined) {
      registerForm.elements[firstInvalid].focus();
      return;
    }

    const salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
    const account = { name: values.name, email: values.email, phone: values.phone, salt: salt, passwordHash: await hashPassword(values.password, salt) };
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(loadAccounts().concat(account)));
    } catch (error) {
      showFieldError('confirm', 'Your browser blocks site storage, so the account cannot be saved.');
      return;
    }
    signIn(account);
  });

  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = signInForm.elements.email.value.trim().toLowerCase();
    const password = signInForm.elements.password.value;
    const account = findAccount(email);
    let message = '';

    if (email === '' || password === '') {
      message = 'Enter your email and password.';
    } else if (account === undefined) {
      message = 'There is no account with this email yet. Press "Create an account" below.';
    } else if (await hashPassword(password, account.salt) !== account.passwordHash) {
      message = 'The password is incorrect. Try again.';
    }

    if (message !== '') {
      signInError.textContent = message;
      signInError.hidden = false;
      return;
    }
    signIn(account);
  });

  signInForm.addEventListener('input', () => {
    signInError.hidden = true;
  });

  renderSession();
})();
