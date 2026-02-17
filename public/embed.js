(function () {
  var SITE_URL = "https://plzandthx.github.io/swipe-spin-show/";

  // Find the script tag to determine where to inject
  var scripts = document.querySelectorAll('script[src*="embed.js"]');
  var scriptTag = scripts[scripts.length - 1];
  var container = scriptTag.parentElement;

  // Read optional attributes from a wrapper div
  var wrapper = container.querySelector("[data-swipe-spin-show]") || container;
  var height = wrapper.getAttribute("data-height") || "700px";
  var width = wrapper.getAttribute("data-width") || "100%";

  // Create iframe
  var iframe = document.createElement("iframe");
  iframe.src = SITE_URL;
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.style.borderRadius = "0";
  iframe.style.display = "block";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute(
    "allow",
    "accelerometer; gyroscope; touch-action"
  );
  iframe.title = "Impact by Design – Radial Slider";

  // If there's a placeholder div, replace it; otherwise append after the script
  var placeholder = container.querySelector("[data-swipe-spin-show]");
  if (placeholder) {
    placeholder.innerHTML = "";
    placeholder.appendChild(iframe);
  } else {
    scriptTag.insertAdjacentElement("afterend", iframe);
  }
})();
