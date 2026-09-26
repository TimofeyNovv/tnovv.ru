(() => {
  "use strict";
  const translations = {
    ru: {
      title: "TimofeyNovv — разработчик",
      description: "TimofeyNovv — backend-разработчик. Java, Spring, C++. Изучаю ML и Data Analytics. Призёр НТО.",
      skip: "Перейти к содержимому", home: "TimofeyNovv — в начало", language: "Язык сайта",
      profiles: "Мои профили",
      achievements: "Достижения", award: "Призёр НТО",
      awardProfile: "Разработка мобильных приложений", awardName: "Национальная технологическая олимпиада",
      fog: "Туман", pause: "Приостановить туман", play: "Включить анимацию тумана",
    },
    en: {
      title: "TimofeyNovv — developer",
      description: "TimofeyNovv — backend developer. Java, Spring, C++. Learning ML & Data Analytics. National Technology Olympiad prizewinner.",
      skip: "Skip to content", home: "TimofeyNovv — back to top", language: "Website language",
      profiles: "My profiles",
      achievements: "Achievements", award: "NTO prizewinner",
      awardProfile: "Mobile App Development", awardName: "National Technology Olympiad",
      fog: "Mist", pause: "Pause the mist", play: "Play the mist animation",
    },
  };
  const root = document.documentElement;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } },
  };
  // Russian is the default on every new page load, regardless of browser language.
  let language = "ru";
  let paused = motionPreference.matches || storage.get("portfolio-paused") === "true";
  const pauseButton = document.querySelector(".motion-toggle");
  const languageButtons = document.querySelectorAll(".language-option");
  function updateMotion() {
    root.dataset.paused = String(paused || document.hidden || motionPreference.matches);
    const isPaused = paused || motionPreference.matches;
    const label = translations[language][isPaused ? "play" : "pause"];
    pauseButton.setAttribute("aria-pressed", String(isPaused));
    pauseButton.setAttribute("aria-label", label);
    pauseButton.title = label;
    pauseButton.querySelector("use").setAttribute("href", isPaused ? "#icon-play" : "#icon-pause");
    // CSS stops animation with system reduced motion; do not show an inert control.
    pauseButton.hidden = motionPreference.matches;
  }
  function setLanguage(nextLanguage) {
    if (!Object.hasOwn(translations, nextLanguage)) return;
    language = nextLanguage;
    const copy = translations[language];
    root.lang = language;
    document.title = copy.title;
    document.querySelector('meta[name="description"]').content = copy.description;
    document.querySelector('meta[property="og:title"]').content = copy.title;
    document.querySelector('meta[property="og:description"]').content = copy.description;
    document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = copy[element.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", copy[element.dataset.i18nAria]); });
    languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
    updateMotion();
  }
  document.querySelector(".language-switch").hidden = false;
  languageButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language)));
  pauseButton.addEventListener("click", () => {
    paused = !paused;
    storage.set("portfolio-paused", String(paused));
    updateMotion();
  });
  motionPreference.addEventListener("change", () => {
    paused = storage.get("portfolio-paused") === "true";
    updateMotion();
  });
  document.addEventListener("visibilitychange", updateMotion);
  document.querySelector("#year").textContent = new Date().getFullYear();
  setLanguage("ru");
})();
