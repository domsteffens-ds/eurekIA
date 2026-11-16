// Capture vers la veille : ouvre l'écran « Capturer » du site (/share) dans
// une petite fenêtre, prérempli avec l'adresse et le titre. La session du site
// fait foi : l'extension ne garde ni mot de passe ni jeton, et ne lit le
// contenu d'aucune page.
const DEFAULT_SITE = "https://eurekia-production.up.railway.app";
const MENU_ID = "capturer";

async function siteUrl() {
  const { site } = await chrome.storage.sync.get({ site: DEFAULT_SITE });
  return String(site || DEFAULT_SITE).replace(/\/+$/, "");
}

async function capture({ url, title, text }) {
  if (!/^https?:\/\//i.test(url || "")) return;
  const params = new URLSearchParams({ url });
  if (title) params.set("title", title.slice(0, 300));
  if (text) params.set("text", text.slice(0, 2000));
  await chrome.windows.create({ url: `${await siteUrl()}/share?${params}`, type: "popup", width: 460, height: 720 });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Envoyer vers ma veille",
    contexts: ["page", "link", "selection", "image", "video"],
  });
});

// Clic sur l'icône : la page en cours.
chrome.action.onClicked.addListener((tab) => capture({ url: tab.url, title: tab.title }));

// Clic droit : le lien visé s'il y en a un, sinon la page. Le texte
// sélectionné accompagne la capture.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  const onLink = Boolean(info.linkUrl);
  capture({
    url: info.linkUrl || info.pageUrl || tab?.url,
    title: onLink ? info.selectionText || "" : tab?.title || "",
    text: onLink ? "" : info.selectionText || "",
  });
});
