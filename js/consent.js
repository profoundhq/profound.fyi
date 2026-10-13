// Consent for Google Analytics. Nothing from Google loads until a visitor
// accepts, and a Global Privacy Control signal counts as rejecting. The footer
// "Cookie settings" button reopens the banner so a choice can be changed.
(function () {
  var key = "profound-consent";
  var gaId = document.currentScript.dataset.gaId;
  var banner = document.getElementById("consent-banner");

  function read() {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", gaId);
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    document.head.appendChild(script);
  }

  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax; domain=." + location.hostname;
    });
  }

  function record(choice) {
    var previous = read();
    try {
      localStorage.setItem(key, choice);
      localStorage.setItem(key + "-at", new Date().toISOString());
    } catch (e) {}
    banner.hidden = true;
    if (choice === "granted" && previous !== "granted") loadAnalytics();
    if (choice === "denied" && previous === "granted") {
      clearAnalyticsCookies();
      location.reload();
    }
  }

  banner.querySelector('[data-consent="granted"]').addEventListener("click", function () {
    record("granted");
  });
  banner.querySelector('[data-consent="denied"]').addEventListener("click", function () {
    record("denied");
  });

  var settings = document.querySelector("[data-consent-open]");
  if (settings) {
    settings.hidden = false;
    settings.addEventListener("click", function () {
      banner.hidden = false;
      banner.querySelector('[data-consent="denied"]').focus();
    });
  }

  var stored = read();
  if (navigator.globalPrivacyControl) {
    if (stored === "granted") record("denied");
  } else if (stored === "granted") {
    loadAnalytics();
  } else if (stored !== "denied") {
    banner.hidden = false;
  }
})();
