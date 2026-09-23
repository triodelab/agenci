export const HERO_STORY_FPS = 30;
/** Illustrative conversations, not connected to customer or commerce systems. */
export const heroStories = [
  {
    id: "city",
    label: "På farten",
    // 13.95-second Pexels source, rounded to the nearest frame at 30 fps.
    durationInFrames: 418,
    person: "Nora",
    channel: "Chat",
    videoSrc:
      "https://videos.pexels.com/video-files/7100944/7100944-hd_1280_720_30fps.mp4",
    posterSrc:
      "https://images.pexels.com/videos/7100944/pictures/preview-7.jpg",
    position: "62% center",
    question: "Jeg rekker ikke hjem til leveringen. Kan jeg hente pakken?",
    response:
      "Klart det. Hentepunktet på hjørnet har åpent til 22. Passer det?",
    reply: "Ja, det passer perfekt.",
    resolution: "Da sender vi den dit. Du får hentekoden på SMS.",
    outcome: "Leveringen er endret",
    detail: "Hentepunkt · Åpent til 22",
  },
  {
    id: "call",
    label: "På telefonen",
    // This film is 16.54 seconds long. Its conversation follows the on-screen
    // pauses and laugh instead of looping the footage beneath a 20-second story.
    durationInFrames: 496,
    person: "Arne",
    channel: "Telefon",
    videoSrc:
      "https://videos.pexels.com/video-files/9058053/9058053-hd_1280_720_50fps.mp4",
    posterSrc:
      "https://images.pexels.com/videos/9058053/pictures/preview-7.jpeg",
    position: "58% center",
    question:
      "Hei, det er Arne. Jeg må flytte timen i morgen. Har dere noe ledig på fredag?",
    response: "Hei Arne. Jeg kan tilby fredag klokken 10.30 eller 13.00.",
    reply: "Haha, flott. Da tar jeg 10.30, takk.",
    resolution:
      "Supert. Da flytter jeg timen og sender deg en bekreftelse på SMS.",
    outcome: "Vi sees på fredag",
    detail: "Ny time · Kl. 10.30",
  },
  {
    id: "laptop",
    label: "Hjemme",
    // 10.56-second Pexels source, rounded to the nearest frame at 30 fps.
    durationInFrames: 317,
    person: "Jonas",
    channel: "Nettbutikk",
    videoSrc:
      "https://videos.pexels.com/video-files/9057681/9057681-hd_1280_720_25fps.mp4",
    posterSrc:
      "https://images.pexels.com/videos/9057681/pictures/preview-5.jpeg",
    position: "center center",
    question: "Jeg liker denne linskjorten. Er den normal i størrelsen?",
    response: "Den er litt romslig. Jeg ville valgt din vanlige størrelse.",
    reply: "Fint. Har dere M i sand?",
    resolution: "Ja, den er på lager i M. Her er den du ser etter.",
    outcome: "Linskjorte i sand",
    detail: "Medium · På lager",
  },
] as const;

export type HeroStory = (typeof heroStories)[number];
export type HeroStoryId = HeroStory["id"];

export const HERO_PRODUCT_IMAGE = "/hero/linen-overshirt.webp";
