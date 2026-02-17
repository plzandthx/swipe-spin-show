(function () {
  var SITE_URL = "https://plzandthx.github.io/swipe-spin-show/";

  // Find the script tag to determine where to inject
  var scripts = document.querySelectorAll('script[src*="embed.js"]');
  var scriptTag = scripts[scripts.length - 1];
  var container = scriptTag.parentElement;

  // Read optional attributes from a wrapper div
  var wrapper = container.querySelector("[data-swipe-spin-show]") || container;
  var width = wrapper.getAttribute("data-width") || "100%";

  // Create iframe — starts at 0 height, auto-sizes from content
  var iframe = document.createElement("iframe");
  iframe.src = SITE_URL;
  iframe.style.width = width;
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.display = "block";
  iframe.style.background = "transparent";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("allowtransparency", "true");
  iframe.setAttribute(
    "allow",
    "accelerometer; gyroscope"
  );
  iframe.title = "Impact by Design – Radial Slider";

  // Listen for height messages from the component
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "swipe-spin-show:resize" && typeof e.data.height === "number") {
      iframe.style.height = e.data.height + "px";
    }
  });

  // If there's a placeholder div, replace it; otherwise append after the script
  var placeholder = container.querySelector("[data-swipe-spin-show]");
  if (placeholder) {
    placeholder.innerHTML = "";
    placeholder.appendChild(iframe);
  } else {
    scriptTag.insertAdjacentElement("afterend", iframe);
  }
})();
