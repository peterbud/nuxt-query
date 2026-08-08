<template>
  <div class="app-shell">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
:root {
  color-scheme: light dark;
  --nq-font-sans: Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --nq-bg: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  --nq-bg-solid: #f8fafc;
  --nq-text: #111827;
  --nq-text-muted: rgba(17, 24, 39, 0.72);
  --nq-text-strong: #0f172a;
  --nq-border: rgba(148, 163, 184, 0.32);
  --nq-border-strong: rgba(100, 116, 139, 0.48);
  --nq-surface: rgba(255, 255, 255, 0.72);
  --nq-surface-muted: rgba(255, 255, 255, 0.52);
  --nq-surface-hover: rgba(226, 232, 240, 0.72);
  --nq-accent: #00dc82;
  --nq-accent-contrast: #ffffff;
  --nq-accent-soft: rgba(0, 220, 130, 0.14);
}

@media (prefers-color-scheme: dark) {
  :root {
    --nq-bg: radial-gradient(circle at top, #1f2937 0%, #0f172a 55%, #020617 100%);
    --nq-bg-solid: #020617;
    --nq-text: rgba(255, 255, 255, 0.92);
    --nq-text-muted: rgba(255, 255, 255, 0.72);
    --nq-text-strong: rgba(255, 255, 255, 0.92);
    --nq-border: rgba(148, 163, 184, 0.24);
    --nq-border-strong: rgba(148, 163, 184, 0.4);
    --nq-surface: rgba(255, 255, 255, 0.04);
    --nq-surface-muted: rgba(255, 255, 255, 0.08);
    --nq-surface-hover: rgba(255, 255, 255, 0.1);
    --nq-accent: #00dc82;
    --nq-accent-contrast: #ffffff;
    --nq-accent-soft: rgba(0, 220, 130, 0.2);
  }
}

html,
body,
#__nuxt {
  min-height: 100%;
  background: var(--nq-bg-solid);
}

body {
  margin: 0;
  color: var(--nq-text);
  font-family: var(--nq-font-sans);
  background-image: var(--nq-bg);
  background-attachment: fixed;
}

.app-shell {
  min-height: 100vh;
  color: inherit;
}
</style>
