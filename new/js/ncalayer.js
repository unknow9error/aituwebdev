(() => {
  "use strict";

  // KNCA Basics: https://github.com/pkigovkz/sdkinfo/wiki/KNCA-Basics-Module
  // Signs a demo login challenge; server-side identity verification is absent.
  window.signInWithNCALayer = (signal, onSigning) =>
    new Promise((resolve, reject) => {
      const nonce = Array.from(
        crypto.getRandomValues(new Uint8Array(16)),
        (byte) => byte.toString(16).padStart(2, "0"),
      ).join("");
      const challenge = JSON.stringify({
        purpose: "Golden Coffee demo sign-in only; no transaction or agreement",
        origin: location.origin,
        nonce,
        issuedAt: new Date().toISOString(),
      });
      let socket;
      let timer;
      let settled = false;
      let signing = false;

      function finish(failure, result) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
        if (socket) {
          socket.onmessage = socket.onerror = socket.onclose = null;
          socket.close();
        }
        if (failure) reject(failure);
        else resolve(result);
      }

      function cancel() {
        finish(new DOMException("Sign-in cancelled", "AbortError"));
      }

      if (signal?.aborted) return cancel();
      signal?.addEventListener("abort", cancel, { once: true });
      const unavailable =
        "Could not connect to NCALayer. Start NCALayer, allow local network access if prompted, and try again.";
      timer = setTimeout(() => finish(new Error(unavailable)), 8000);

      try {
        socket = new WebSocket("wss://127.0.0.1:13579");
      } catch {
        finish(new Error(unavailable));
        return;
      }

      socket.onerror = () => finish(new Error(unavailable));
      socket.onclose = () =>
        finish(
          new Error("NCALayer disconnected. Start it again and retry sign-in."),
        );
      socket.onmessage = (event) => {
        if (settled) return;

        let response;
        try {
          response = JSON.parse(event.data);
        } catch {
          finish(
            new Error(
              "Could not read the NCALayer response. Restart NCALayer and try again.",
            ),
          );
          return;
        }

        console.log(response);

        if (!signing) {
          // NCALayer announces its version before accepting a signing request.
          if (!response?.result?.version) {
            finish(
              new Error(
                "Could not connect to NCALayer. Update it and try again.",
              ),
            );
            return;
          }
          signing = true;
          clearTimeout(timer);
          timer = setTimeout(
            () =>
              finish(new Error("EDS sign-in took too long. Please try again.")),
            120000,
          );
          onSigning?.();
          try {
            socket.send(
              JSON.stringify({
                module: "kz.gov.pki.knca.basics",
                method: "sign",
                args: {
                  format: "cms",
                  data: challenge,
                  signingParams: {
                    decode: false,
                    encapsulate: true,
                    digested: false,
                  },
                  signerParams: { extKeyUsageOids: ["1.3.6.1.5.5.7.3.2"] },
                  locale: "ru",
                },
              }),
            );
          } catch {
            finish(
              new Error(
                "Could not send the sign-in request to NCALayer. Please try again.",
              ),
            );
          }
          return;
        }

        if (response?.status !== true) {
          finish(
            new Error(
              "NCALayer could not sign the request. Check your key and password in NCALayer, then try again.",
            ),
          );
          return;
        }

        if (
          !response.body ||
          !Object.prototype.hasOwnProperty.call(response.body, "result")
        ) {
          finish(new Error("EDS sign-in was cancelled. You can try again."));
          return;
        }
        const result = response.body.result;
        const signature =
          Array.isArray(result) && result.length === 1 ? result[0] : result;
        if (typeof signature !== "string" || !signature.trim()) {
          finish(
            new Error("NCALayer returned no signature. Please try again."),
          );
          return;
        }

        // Do not upload or persist the signature or certificate. Production needs
        // a server challenge, CMS verification, and a server-issued session token.
        finish(null, {
          token: `eds-demo-${nonce}`,
          username: "EDS demo",
          method: "ncalayer",
        });
      };
    });
})();
