document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.card');
  const noBtn = document.getElementById('noBtn');
  const siBtn = document.getElementById('siBtn');
  const question = document.querySelector('.question');
  const imageBox = document.getElementById('image-placeholder');
  const puffText = document.getElementById('puffText');

  const DODGE_RADIUS = 130;
  const MARGIN = 10;
  const FORBID_BUFFER = 14;

  let lastPointerType = 'mouse';
  let puffTimeoutId = null;

  siBtn.addEventListener('click', () => {
    window.location.href = 'src/pages/appuntamenti.html';
  });

  function getBounds() {
    const cardRect = card.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    return {
      maxLeft: cardRect.width - btnRect.width - MARGIN,
      maxTop: cardRect.height - btnRect.height - MARGIN,
      width: btnRect.width,
      height: btnRect.height
    };
  }

  function getCurrentPos() {
    return {
      left: noBtn.offsetLeft,
      top: noBtn.offsetTop
    };
  }

  function rectRelativeToCard(el, buffer) {
    const cardRect = card.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      left: elRect.left - cardRect.left - buffer,
      top: elRect.top - cardRect.top - buffer,
      right: elRect.right - cardRect.left + buffer,
      bottom: elRect.bottom - cardRect.top + buffer
    };
  }

  function getForbiddenRects() {
    return [question, imageBox, siBtn].map((el) => rectRelativeToCard(el, FORBID_BUFFER));
  }

  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function overlapsForbidden(left, top, width, height, forbiddenRects) {
    const candidate = { left, top, right: left + width, bottom: top + height };
    return forbiddenRects.some((r) => rectsOverlap(candidate, r));
  }

  function setPos(left, top) {
    const { maxLeft, maxTop } = getBounds();
    const clampedLeft = Math.min(Math.max(left, MARGIN), Math.max(maxLeft, MARGIN));
    const clampedTop = Math.min(Math.max(top, MARGIN), Math.max(maxTop, MARGIN));
    noBtn.style.left = clampedLeft + 'px';
    noBtn.style.top = clampedTop + 'px';
  }

  function isValidPos(left, top) {
    const { maxLeft, maxTop, width, height } = getBounds();
    const usableMaxLeft = Math.max(maxLeft, MARGIN);
    const usableMaxTop = Math.max(maxTop, MARGIN);
    if (left < MARGIN || top < MARGIN || left > usableMaxLeft || top > usableMaxTop) {
      return false;
    }
    return !overlapsForbidden(left, top, width, height, getForbiddenRects());
  }

  function findValidPos(avoid) {
    const { maxLeft, maxTop, width, height } = getBounds();
    const forbidden = getForbiddenRects();
    const usableMaxLeft = Math.max(maxLeft, MARGIN);
    const usableMaxTop = Math.max(maxTop, MARGIN);

    for (let attempts = 0; attempts < 150; attempts++) {
      const left = MARGIN + Math.random() * (usableMaxLeft - MARGIN);
      const top = MARGIN + Math.random() * (usableMaxTop - MARGIN);
      if (avoid && Math.hypot(left - avoid.left, top - avoid.top) < DODGE_RADIUS) continue;
      if (overlapsForbidden(left, top, width, height, forbidden)) continue;
      return { left, top };
    }

    const step = 20;
    for (let top = MARGIN; top <= usableMaxTop; top += step) {
      for (let left = MARGIN; left <= usableMaxLeft; left += step) {
        if (!overlapsForbidden(left, top, width, height, forbidden)) {
          return { left, top };
        }
      }
    }

    return {
      left: Math.min(Math.max(avoid ? avoid.left : MARGIN, MARGIN), usableMaxLeft),
      top: Math.min(Math.max(avoid ? avoid.top : MARGIN, MARGIN), usableMaxTop)
    };
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== '') return;

    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const dist = Math.hypot(btnCenterX - e.clientX, btnCenterY - e.clientY);

    if (dist < DODGE_RADIUS) {
      const current = getCurrentPos();
      const next = findValidPos(current);
      setPos(next.left, next.top);
    }
  });

  document.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
  });

  noBtn.addEventListener('click', (e) => {
    if (lastPointerType !== 'touch') {
      const current = getCurrentPos();
      const next = findValidPos(current);
      setPos(next.left, next.top);
      return;
    }

    const prevPos = getCurrentPos();

    clearTimeout(puffTimeoutId);
    puffText.style.left = prevPos.left + 'px';
    puffText.style.top = prevPos.top + 'px';
    puffText.style.display = 'block';
    puffTimeoutId = setTimeout(() => {
      puffText.style.display = 'none';
    }, 1500);

    const next = findValidPos(prevPos);
    setPos(next.left, next.top);
  });

  window.addEventListener('resize', () => {
    const current = getCurrentPos();
    const next = findValidPos(current);
    setPos(next.left, next.top);
  });

  const initialPos = getCurrentPos();
  const startPos = isValidPos(initialPos.left, initialPos.top)
    ? initialPos
    : findValidPos(initialPos);
  setPos(startPos.left, startPos.top);
});
