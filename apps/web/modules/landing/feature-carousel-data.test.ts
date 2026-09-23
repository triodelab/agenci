import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  featureCards,
  featureImageLoader,
  normalizeFeaturePosition,
  wrapFeatureIndex,
} from "./feature-carousel-data.ts";

test("navigation wraps correctly in both directions", () => {
  assert.equal(
    wrapFeatureIndex(-1, featureCards.length),
    featureCards.length - 1,
  );
  assert.equal(wrapFeatureIndex(featureCards.length, featureCards.length), 0);
  assert.equal(
    wrapFeatureIndex(featureCards.length * 3 + 1, featureCards.length),
    1,
  );
});

test("native scroll clones normalize to the same real feature", () => {
  assert.equal(
    normalizeFeaturePosition(0, featureCards.length),
    featureCards.length,
  );
  assert.equal(
    normalizeFeaturePosition(featureCards.length + 1, featureCards.length),
    1,
  );
  assert.equal(normalizeFeaturePosition(4.25, 8), 4.25);
  for (let position = 0; position <= featureCards.length + 1; position++)
    assert.equal(
      wrapFeatureIndex(
        normalizeFeaturePosition(position, featureCards.length) - 1,
        featureCards.length,
      ),
      wrapFeatureIndex(position - 1, featureCards.length),
    );
});

test("all selected photos have at least 4K source dimensions", () => {
  for (const card of featureCards) {
    assert.ok(card.sourceSize.width >= 4000);
    assert.ok(card.sourceSize.height >= 2160);
  }
});

test("local carousel photos exist in public and use the native Next image loader", () => {
  for (const card of featureCards.filter((item) =>
    item.image.startsWith("/"),
  )) {
    const path = fileURLToPath(
      new URL(`../../public${card.image}`, import.meta.url),
    );
    assert.ok(existsSync(path), `${card.id} photo should exist at ${path}`);
    assert.equal(
      featureImageLoader({ src: card.image, width: 640 }),
      card.image,
    );
  }
});

test("feature cards have unique ids, photos, and source credits", () => {
  assert.equal(featureCards.length, 10);
  assert.equal(new Set(featureCards.map((card) => card.id)).size, 10);
  assert.equal(new Set(featureCards.map((card) => card.image)).size, 10);
  for (const card of featureCards) {
    assert.ok(
      card.caption && card.alt && card.credit.photographer && card.credit.url,
    );
  }
});

test("the audio photo stays beside the hotel photo for comparison", () => {
  const knowledgeIndex = featureCards.findIndex(
    (card) => card.id === "knowledge",
  );
  assert.equal(featureCards[knowledgeIndex + 1]?.id, "mobile-audio-trial");
  assert.equal(
    featureCards[knowledgeIndex + 1]?.image,
    "/images/carusel/active/pexels-roberto-hund-5358101.jpg",
  );
  assert.equal(
    featureCards.find((card) => card.id === "insights")?.image,
    "/images/carusel/active/brooke-cagle-g1Kr4Ozfoac-unsplash.jpg",
  );
});
