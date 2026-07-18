# Sito_Date

Piccolo sito statico (HTML/CSS/JS puro, nessuna dipendenza o build) per chiedere di uscire in modo giocoso e guidare la scelta di appuntamento, giorno e orario.

## Struttura

```
index.html                   Pagina 1: la domanda, con il pulsante "NO" che scappa dal mouse
src/
  pages/
    appuntamenti.html        Pagina 2: scelta del tipo di appuntamento
    calendario.html          Pagina 3: scelta di giorno e orario
  style/
    style.css                Stili condivisi (riquadro principale, pulsanti, font)
    appuntamenti.css         Stili della pagina 2
    calendario.css           Stili della pagina 3
  js/
    script.js                Logica pagina 1 (pulsante "NO" che fugge/teletrasporta)
    appuntamenti.js          Navigazione dalla pagina 2 alla pagina 3
    calendario.js            Calendario dinamico + selettore orario
    animations.js            Animazioni d'ingresso (fade/scorrimento) condivise da tutte le pagine
img/                          Immagini usate nel sito
```

## Come usarlo

Nessuna build necessaria: basta aprire `index.html` in un browser, oppure servire la cartella con un qualsiasi server statico.

## Flusso

1. **index.html** — pone la domanda; il pulsante "SI" porta alla pagina appuntamenti.
2. **appuntamenti.html** — sei opzioni di appuntamento; cliccandone una si passa al calendario.
3. **calendario.html** — calendario del mese corrente (generato dinamicamente, sempre aggiornato) + selettore dell'orario.
