const PARAM_NAME = "state_type";
const PARAM_VALUE = "steady_state__v";
const BUTTON_ID = "copy-steady-state-link-extension-button";

function buildCleanSteadyStateUrl(originalUrl) {
  const url = new URL(originalUrl);
  const hash = url.hash;

  const match = hash.match(/#doc_info\/(\d+)/);

  if (!match) {
    throw new Error("Could not find Veeva document ID in URL.");
  }

  const documentId = match[1];

  return `${url.origin}/ui/#doc_info/${documentId}?${PARAM_NAME}=${PARAM_VALUE}`;
}

async function copySteadyStateLink() {
  const steadyUrl = buildCleanSteadyStateUrl(window.location.href);
  await navigator.clipboard.writeText(steadyUrl);

  showToast("Copied steady state link!");
}

function showToast(message) {
  const existing = document.getElementById("steady-state-copy-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "steady-state-copy-toast";
  toast.textContent = message;

  Object.assign(toast.style, {
    position: "fixed",
    top: "80px",
    right: "24px",
    zIndex: "999999",
    background: "#2e7d32",
    color: "white",
    padding: "10px 14px",
    borderRadius: "4px",
    fontSize: "13px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.25)"
  });

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

function createMenuButton() {
  const button = document.createElement("div");
  button.id = BUTTON_ID;

  button.innerHTML = `
  <span style="display:inline-flex; width:18px; align-items:center; justify-content:center; margin-right:4px;">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  </span>
  <span>Copy Steady State Link</span>
`;

  Object.assign(button.style, {
  cursor: "pointer",
  padding: "3px 10px 3px 9px",
  fontSize: "12px",
  fontFamily: "inherit",
  fontWeight: "400",
  color: "inherit",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  lineHeight: "20px",
  minHeight: "24px",
  boxSizing: "border-box"
});

  button.addEventListener("mouseenter", () => {
    button.style.background = "#f5f5f5";
  });

  button.addEventListener("mouseleave", () => {
    button.style.background = "transparent";
  });

  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await copySteadyStateLink();
    } catch (error) {
      showToast("Could not copy steady state link.");
      console.error(error);
    }
  });

  return button;
}

function injectIntoVeevaMenu() {
  if (document.getElementById(BUTTON_ID)) {
    return;
  }

  const elements = Array.from(document.querySelectorAll("*"));

  const copyLinkRow = elements.find((el) => {
    const text = el.textContent?.trim();
    const hasExactText = text === "Copy Link";

    const parentText = el.parentElement?.textContent?.trim();
    const parentLooksLikeRow = parentText === "Copy Link";

    return hasExactText && parentLooksLikeRow;
  })?.parentElement;

  if (!copyLinkRow) {
    return;
  }

  const button = createMenuButton();

  copyLinkRow.insertAdjacentElement("afterend", button);
}

const observer = new MutationObserver(() => {
  injectIntoVeevaMenu();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});