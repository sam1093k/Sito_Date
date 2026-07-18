document.addEventListener('DOMContentLoaded', () => {
  const optionButtons = document.querySelectorAll('.option-btn');

  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      window.location.href = 'calendario.html';
    });
  });
});
