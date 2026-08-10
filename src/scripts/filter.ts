// Work page filter chips: client-side toggle, no URL state.
// Single "domain" group; click a chip to filter, click "all" or the active
// chip again to clear.

const groups = document.querySelectorAll<HTMLButtonElement>("[data-filter-group='domain']");
const cards = document.querySelectorAll<HTMLElement>(".project-card[data-domain]");

function setActive(active: HTMLButtonElement | null) {
  groups.forEach((b) => b.setAttribute("aria-pressed", "false"));
  if (active) active.setAttribute("aria-pressed", "true");
}

function apply(value: string | null) {
  cards.forEach((card) => {
    const matches = value === null || value === "all" || card.dataset.domain === value;
    if (matches) card.removeAttribute("data-hidden");
    else card.setAttribute("data-hidden", "true");
  });
}

groups.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.dataset.filterValue ?? null;
    const isAlready = btn.getAttribute("aria-pressed") === "true";
    setActive(isAlready ? null : btn);
    apply(isAlready ? null : value);
  });
});
