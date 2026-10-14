(() => {
  "use strict";

  const AUTH_URL = "https://dummyjson.com/auth/login";
  const TEST_ACCOUNT = { username: "emilys", password: "emilyspass" };
  const SESSION_MINUTES = 30;
  const navigation = document.querySelector("#main-navigation .navbar-nav");
  if (!navigation) return;

  const controls = document.createElement("li");
  controls.className = "nav-item auth-controls";
  controls.innerHTML = `
    <button class="auth-button" type="button" data-sign-in>Sign in</button>
    <span class="auth-user" title="Signed in with a demo account" hidden></span>
    <button class="auth-button" type="button" data-sign-out hidden>Log out</button>
  `;
  navigation.append(controls);
  navigation.classList.add("auth-navigation");

  const dialog = document.createElement("dialog");
  dialog.id = "auth-dialog";
  dialog.className = "auth-dialog";
  dialog.setAttribute("aria-labelledby", "auth-title");
  dialog.setAttribute("aria-describedby", "auth-note");
  dialog.innerHTML = `
    <button class="auth-close" type="button" aria-label="Close sign-in">×</button>
    <p class="auth-eyebrow">Golden Coffee</p>
    <h2 id="auth-title">Sign in</h2>
    <p id="auth-note" class="auth-note">Try a demo account on this student site.</p>
    <form class="auth-form">
      <label for="auth-username">Login</label>
      <input id="auth-username" name="username" type="text" autocomplete="username"
        autocapitalize="none" spellcheck="false" required maxlength="80" autofocus>
      <label for="auth-password">Password</label>
      <input id="auth-password" name="password" type="password" autocomplete="current-password"
        required maxlength="128">
      <p class="auth-error" role="alert" hidden></p>
      <button class="auth-submit" type="submit">Sign in</button>
      <button class="auth-eds-button" type="button">Sign with ECP</button>
    </form>
    <div class="auth-demo">
      <p>Test account: <code data-test-login></code> / <code data-test-password></code></p>
      <button class="auth-demo-fill" type="button">Use test account</button>
    </div>
  `;
  document.body.append(dialog);

  const signIn = controls.querySelector("[data-sign-in]");
  const signOut = controls.querySelector("[data-sign-out]");
  const userLabel = controls.querySelector(".auth-user");
  const form = dialog.querySelector("form");
  const username = form.elements.username;
  const password = form.elements.password;
  const submit = form.querySelector('[type="submit"]');
  const error = form.querySelector(".auth-error");
  const fillAccount = dialog.querySelector(".auth-demo-fill");
  const edsButton = dialog.querySelector(".auth-eds-button");
  let pendingRequest = null;

  dialog.querySelector("[data-test-login]").textContent = TEST_ACCOUNT.username;
  dialog.querySelector("[data-test-password]").textContent =
    TEST_ACCOUNT.password;

  function clearSession() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authUser");
  }

  function readSession() {
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("authUser"));
    if (
      token &&
      typeof user?.username === "string" &&
      user.username.trim() &&
      Number.isFinite(user.expiresAt) &&
      user.expiresAt > Date.now()
    ) {
      return user;
    }
    clearSession();
    return null;
  }

  function renderSession() {
    const user = readSession();
    signIn.hidden = Boolean(user);
    signOut.hidden = !user;
    userLabel.hidden = !user;
    userLabel.textContent = user ? user.username : "";
    const accountLabel =
      user?.method === "ncalayer" ? "EDS demo account" : "demo account";
    userLabel.title = user ? `Signed in with a ${accountLabel}` : "";
    userLabel.setAttribute(
      "aria-label",
      user ? `Signed in as ${user.username} (${accountLabel})` : "",
    );
    document.body.dataset.authenticated = String(Boolean(user));
  }

  function saveSession(token, accountName, method) {
    try {
      sessionStorage.setItem(
        "authUser",
        JSON.stringify({
          username: accountName,
          method,
          expiresAt: Date.now() + SESSION_MINUTES * 60 * 1000,
        }),
      );
      sessionStorage.setItem("token", token);
    } catch {
      clearSession();
      throw new Error(
        "Your browser could not save the session. Allow site storage and try again.",
      );
    }
    renderSession();
    dialog.close();
  }

  function setBusy(busy, method = "password") {
    username.disabled = busy;
    password.disabled = busy;
    submit.disabled = busy;
    fillAccount.disabled = busy;
    edsButton.disabled = busy;
    submit.textContent =
      busy && method === "password" ? "Signing in…" : "Sign in";
    edsButton.textContent =
      busy && method === "ncalayer" ? "Connecting…" : "Sign with ECP";
    form.setAttribute("aria-busy", String(busy));
  }

  signIn.addEventListener("click", () => dialog.showModal());
  signOut.addEventListener("click", () => {
    clearSession();
    renderSession();
    signIn.focus();
  });

  dialog
    .querySelector(".auth-close")
    .addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      dialog.close();
  });

  dialog.addEventListener("close", () => {
    pendingRequest?.abort();
    pendingRequest = null;
    setBusy(false);
    form.reset();
    error.hidden = true;
    error.textContent = "";
    (signIn.hidden ? signOut : signIn).focus();
  });
  fillAccount.addEventListener("click", () => {
    username.value = TEST_ACCOUNT.username;
    password.value = TEST_ACCOUNT.password;
    error.hidden = true;
    submit.focus();
  });

  edsButton.addEventListener("click", async () => {
    if (pendingRequest) return;
    const controller = new AbortController();
    pendingRequest = controller;
    error.hidden = true;
    setBusy(true, "ncalayer");
    try {
      const account = await window.signInWithNCALayer(controller.signal, () => {
        edsButton.textContent = "Signing…";
      });
      if (pendingRequest !== controller || !dialog.open) return;
      saveSession(account.token, account.username, account.method);
    } catch (failure) {
      if (pendingRequest !== controller || !dialog.open) return;
      error.textContent = failure.message;
      error.hidden = false;
    } finally {
      if (pendingRequest === controller) {
        pendingRequest = null;
        setBusy(false);
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pendingRequest || !form.reportValidity()) return;

    const controller = new AbortController();
    pendingRequest = controller;
    const timeout = setTimeout(() => controller.abort(), 10000);
    const credentials = {
      username: username.value.trim(),
      password: password.value,
    };
    error.hidden = true;
    setBusy(true);

    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({
          ...credentials,
          expiresInMins: SESSION_MINUTES,
        }),
        signal: controller.signal,
      });
      if (response.status === 400 || response.status === 401) {
        throw new Error(
          "Login or password is incorrect. Try the test account below.",
        );
      }
      if (response.status === 429) {
        throw new Error(
          "Too many sign-in attempts. Wait a moment and try again.",
        );
      }
      if (!response.ok)
        throw new Error("Sign-in is unavailable right now. Please try again.");

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Sign-in could not be completed. Please try again.");
      }
      if (
        typeof data?.accessToken !== "string" ||
        !data.accessToken.trim() ||
        typeof data.username !== "string" ||
        !data.username.trim()
      ) {
        throw new Error("Sign-in could not be completed. Please try again.");
      }

      if (pendingRequest !== controller || !dialog.open) return;
      saveSession(data.accessToken, data.username, "password");
    } catch (failure) {
      if (pendingRequest !== controller || !dialog.open) return;
      error.textContent = controller.signal.aborted
        ? "Sign-in took too long. Please try again."
        : failure instanceof TypeError
          ? "Could not connect. Check your internet connection and try again."
          : failure.message;
      error.hidden = false;
    } finally {
      clearTimeout(timeout);
      if (pendingRequest === controller) {
        pendingRequest = null;
        setBusy(false);
      }
    }
  });

  window.addEventListener("pageshow", renderSession);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) renderSession();
  });
  renderSession();
})();
