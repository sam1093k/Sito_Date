# Sito_Date

Piccolo sito statico (HTML/CSS/JS puro, nessuna dipendenza o build) per chiedere di uscire in modo giocoso e guidare la scelta di appuntamento, giorno e orario. All'invio finale, la richiesta viene mandata su un gruppo Telegram privato tramite un bot.

## Struttura

```
index.html                   Pagina 1: la domanda, con il pulsante "NO" che scappa dal mouse
functions/
  api/
    send-appointment.js      Funzione serverless (Cloudflare Pages Functions): inoltra il messaggio al bot Telegram tenendo il token segreto
src/
  pages/
    appuntamenti.html        Pagina 2: scelta del tipo di appuntamento
    calendario.html          Pagina 3: scelta di giorno, orario e invio della richiesta
  style/
    style.css                Stili condivisi (riquadro principale, pulsanti, font)
    appuntamenti.css         Stili della pagina 2
    calendario.css           Stili della pagina 3
  js/
    script.js                Logica pagina 1 (pulsante "NO" che fugge/teletrasporta)
    appuntamenti.js          Navigazione dalla pagina 2 alla pagina 3 (salva il tipo scelto in sessionStorage)
    calendario.js            Calendario dinamico + selettore orario + invio della richiesta al bot
    animations.js            Animazioni d'ingresso (fade/scorrimento) condivise da tutte le pagine
img/                          Immagini usate nel sito
.dev.vars.example            Modello delle variabili d'ambiente per testare la funzione in locale con Wrangler
```

## Come usarlo

Nessuna build necessaria: basta aprire `index.html` in un browser, oppure servire la cartella con un qualsiasi server statico. Il pulsante "Invia 💌" nell'ultima pagina funziona però solo quando il sito è pubblicato su una piattaforma che esegue anche `functions/api/send-appointment.js` (vedi "Deploy gratuito 24/7" più sotto) — in locale, senza quella funzione attiva, mostrerà un messaggio di errore.

## Flusso

1. **index.html** — pone la domanda; il pulsante "SI" porta alla pagina appuntamenti.
2. **appuntamenti.html** — sei opzioni di appuntamento; cliccandone una si passa al calendario.
3. **calendario.html** — calendario del mese corrente (generato dinamicamente, sempre aggiornato) + selettore dell'orario + pulsante **"Invia 💌"** in basso, centrato, con lo stesso stile degli altri pulsanti. Al click manda tipo di appuntamento, data e ora al bot Telegram.

## Notifiche Telegram

Il pulsante "Invia" chiama `POST /api/send-appointment`, che gira lato server e a sua volta chiama l'API di Telegram con un bot token letto da variabile d'ambiente. Il token **non** è mai presente nel codice che arriva al browser: se fosse scritto direttamente nel JS, chiunque visitasse il sito potrebbe leggerlo dal sorgente e usarlo per mandare messaggi a nome del bot.

### 1. Crea il bot

1. Su Telegram cerca **@BotFather** e manda `/newbot`.
2. Scegli nome e username; BotFather risponde con un **token** tipo `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. Tienilo segreto.

### 2. Trova il chat_id del gruppo privato

1. Crea il gruppo privato su Telegram e aggiungi il bot come membro (se il gruppo è impostato in modo che solo gli admin possano scrivere, rendi il bot admin).
2. Apri nel browser `https://api.telegram.org/bot<TOKEN>/getUpdates` (sostituisci `<TOKEN>` col tuo) e cerca `"chat":{"id":-100...}` nella risposta: quel numero negativo è il `chat_id` del gruppo. Se la risposta è vuota, manda prima un messaggio qualsiasi nel gruppo e ricarica.
   - In alternativa, più veloce: aggiungi temporaneamente al gruppo un bot come *@RawDataBot*, che risponde subito con l'id della chat; poi rimuovilo.

### 3. Configura le variabili d'ambiente

Sulla piattaforma di hosting (es. Cloudflare Pages → Settings → Environment variables) imposta:

- `TELEGRAM_BOT_TOKEN` — il token di BotFather (da segnare come "secret"/criptata)
- `TELEGRAM_CHAT_ID` — il chat_id trovato al passo 2

Per provare in locale con Wrangler, copia `.dev.vars.example` in `.dev.vars` (già ignorato da git) e mettici i valori veri.

## Deploy gratuito 24/7

**Scelta consigliata: [Cloudflare Pages](https://pages.cloudflare.com/).** Gratis senza carta di credito, il sito statico non ha limiti di richieste/banda, e la funzione in `functions/api/` (che parla con Telegram) gira su Cloudflare Workers con 100.000 richieste/giorno gratuite — enormemente più del necessario per un sito personale come questo. A differenza di molti host "free" per backend (es. Render, che sospende il servizio dopo ~15 minuti di inattività e impiega circa un minuto a ripartire alla richiesta successiva), qui non c'è alcuno "spin down": il sito risponde sempre all'istante, il che conta per un sito pensato per essere aperto una volta da una persona sola.

Passi:

1. Carica il progetto su GitHub.
2. Su [pages.cloudflare.com](https://pages.cloudflare.com) collega la repo. Non serve alcun comando di build (sito statico): lascia vuoto "Build command" e imposta `/` come "Build output directory". Cloudflare rileva da solo la cartella `functions/`.
3. In **Settings → Environment variables** aggiungi `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` come al punto sopra.
4. Deploy: il sito è online su un dominio gratuito `*.pages.dev` (un dominio personalizzato si può collegare in seguito, sempre gratis).

Alternative valide, entrambe con funzioni serverless gratuite: **Netlify** (Netlify Functions; piccoli "cold start" di qualche centinaio di ms sulle funzioni, ma nessuno spin-down del sito) o **Vercel**. Da evitare per questo progetto: piattaforme che addormentano il servizio dopo un periodo di inattività (es. piano free di Render) o che non offrono più un piano gratuito continuativo (es. Railway, che dal 2023 dà solo credito di prova una tantum, o Heroku, che non ha più piano free dal 2022) — con queste il pulsante "Invia" rischierebbe di chiamare un backend addormentato o assente.
