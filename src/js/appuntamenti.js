document.addEventListener('DOMContentLoaded', () => {
  const optionButtons = document.querySelectorAll('.option-btn');

  optionButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      sessionStorage.setItem('appointmentType', btn.textContent.trim());
      window.location.href = 'calendario.html';
    });
  });
});
