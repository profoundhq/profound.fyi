(function () {
  var key = "profound-consent";
  var stored;
  try {
    stored = localStorage.getItem(key);
  } catch (e) {
    stored = null;
  }
  if (stored === "granted" || stored === "denied") return;

  var banner = document.getElementById("consent-banner");
  if (!banner) return;
  banner.hidden = false;

  function record(choice) {
    var allow = choice === "granted";
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        ad_storage: allow ? "granted" : "denied",
        analytics_storage: allow ? "granted" : "denied",
        ad_user_data: allow ? "granted" : "denied",
        ad_personalization: allow ? "granted" : "denied",
        personalization_storage: allow ? "granted" : "denied",
      });
    }
    try {
      localStorage.setItem(key, choice);
    } catch (e) {}
    banner.hidden = true;
  }

  banner.querySelector('[data-consent="granted"]').addEventListener("click", function () {
    record("granted");
  });
  banner.querySelector('[data-consent="denied"]').addEventListener("click", function () {
    record("denied");
  });
})();
