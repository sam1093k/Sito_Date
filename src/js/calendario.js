document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('calendarTitle');
  const daysEl = document.getElementById('calendarDays');
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');

  const MONTHS = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedCell = null;

  function render() {
    titleEl.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    daysEl.innerHTML = '';
    selectedCell = null;

    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'day-cell empty';
      daysEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'day-cell';
      cell.textContent = day;

      const isToday =
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      if (isToday) cell.classList.add('today');

      cell.addEventListener('click', () => {
        if (selectedCell) selectedCell.classList.remove('selected');
        cell.classList.add('selected');
        selectedCell = cell;
      });

      daysEl.appendChild(cell);
    }

    const totalCells = startOffset + daysInMonth;
    const trailingCells = 42 - totalCells;
    for (let i = 0; i < trailingCells; i++) {
      const empty = document.createElement('span');
      empty.className = 'day-cell empty';
      daysEl.appendChild(empty);
    }
  }

  const hourValueEl = document.getElementById('hourValue');
  const minuteValueEl = document.getElementById('minuteValue');
  const timeArrows = document.querySelectorAll('.time-arrow');

  let hour = 19;
  let minute = 0;

  function bump(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  timeArrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      const unit = arrow.dataset.unit;
      const dir = Number(arrow.dataset.dir);

      if (unit === 'hour') {
        hour = (hour + dir + 24) % 24;
        hourValueEl.textContent = String(hour).padStart(2, '0');
        bump(hourValueEl);
      } else {
        minute = (minute + dir * 5 + 60) % 60;
        minuteValueEl.textContent = String(minute).padStart(2, '0');
        bump(minuteValueEl);
      }
    });
  });

  prevBtn.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    render();
  });

  nextBtn.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    render();
  });

  const submitBtn = document.getElementById('submitBtn');
  const submitStatus = document.getElementById('submitStatus');
  const SEND_ENDPOINT = '/api/send-appointment';

  submitBtn.addEventListener('click', async () => {
    if (!selectedCell) {
      submitStatus.textContent = 'Scegli prima un giorno dal calendario 📅';
      return;
    }

    const appointmentType = sessionStorage.getItem('appointmentType') || 'Non specificato';
    const date = `${String(selectedCell.textContent).padStart(2, '0')} ${MONTHS[viewMonth]} ${viewYear}`;
    const time = `${hourValueEl.textContent}:${minuteValueEl.textContent}`;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Invio in corso...';
    submitStatus.textContent = '';

    try {
      const response = await fetch(SEND_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentType, date, time })
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => '');
        const detail = bodyText && !bodyText.trimStart().startsWith('<')
          ? bodyText.slice(0, 120)
          : `errore ${response.status}`;
        throw new Error(detail);
      }

      submitBtn.textContent = 'Inviato ✔';
      submitStatus.textContent = 'Fatto! Ti risponderò presto 💌';
      sessionStorage.removeItem('appointmentType');
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Invia 💌';
      const reason = err instanceof TypeError ? 'connessione assente' : err.message;
      submitStatus.textContent = `Invio non riuscito (${reason}), riprova.`;
    }
  });

  render();
});
