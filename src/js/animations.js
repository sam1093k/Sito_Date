document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.card');
  if (!card) return;

  const DURATION = 3000;
  const EASING = 'ease-out';

  function releaseWhenDone(anim) {
    anim.onfinish = () => anim.cancel();
  }

  function fadeIn(el) {
    const anim = el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: DURATION, easing: EASING, fill: 'both' }
    );
    releaseWhenDone(anim);
  }

  function slideIn(el, cardCenterX) {
    const rect = el.getBoundingClientRect();
    const elCenterX = rect.left + rect.width / 2;
    const fromX = elCenterX < cardCenterX ? '-130%' : '130%';

    const anim = el.animate(
      [
        { transform: `translateX(${fromX})`, opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      { duration: DURATION, easing: EASING, fill: 'both' }
    );
    releaseWhenDone(anim);
  }

  const cardRect = card.getBoundingClientRect();
  const cardCenterX = cardRect.left + cardRect.width / 2;

  card.querySelectorAll('img, .page-title').forEach(fadeIn);

  const slideTargets = card.querySelectorAll(
    '.question, .btn-si, .btn-no, .column-left, .column-right'
  );
  slideTargets.forEach((el) => slideIn(el, cardCenterX));
});
