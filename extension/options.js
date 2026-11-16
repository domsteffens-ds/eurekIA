const DEFAULT_SITE = "https://eurekia-production.up.railway.app";
const input = document.getElementById("site");
const etat = document.getElementById("etat");

chrome.storage.sync.get({ site: DEFAULT_SITE }).then(({ site }) => {
  input.value = site;
});

document.getElementById("save").addEventListener("click", async () => {
  const site = input.value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\/[^\s/]+/i.test(site)) {
    etat.textContent = "Adresse invalide : elle doit commencer par https://";
    return;
  }
  await chrome.storage.sync.set({ site });
  etat.textContent = "Adresse enregistrée.";
});
