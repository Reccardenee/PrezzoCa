# Diesel Price Tracker - Piano di Progetto

## Obiettivo

Realizzare una dashboard web completamente statica che monitori giornalmente i prezzi dei carburanti nella città di Sciacca utilizzando l'API ufficiale dell'Osservatorio Prezzi Carburanti del Ministero.

L'obiettivo principale è:

* costruire uno storico dei prezzi;
* individuare il momento migliore per fare rifornimento;
* visualizzare statistiche e grafici interattivi;
* inviare notifiche Discord quando si verificano eventi interessanti.

Il progetto dovrà avere costi pari a zero ed essere ospitato interamente su GitHub.

---

# Architettura

```
GitHub Actions (cron)
        │
        ▼
Python collector
        │
        ▼
API Osservatorio Carburanti
        │
        ▼
JSON storico
        │
        ▼
Commit automatico
        │
        ▼
GitHub Pages
        │
        ▼
Dashboard React/Vite
```

Non è previsto alcun backend permanente.

Non sono previsti database.

L'intero storico sarà costituito da file JSON versionati tramite Git.

---

# API individuata

Endpoint:

```
POST
https://carburanti.mise.gov.it/ospzApi/search/zone
```

Payload esempio:

```json
{
  "points": [
    {
      "lat": 37.50867530000001,
      "lng": 13.0782746
    }
  ],
  "fuelType": "2-x",
  "priceOrder": "asc",
  "radius": 5
}
```

Risposta:

```json
{
  "success": true,
  "center": {...},
  "results": [...]
}
```

Ogni distributore contiene:

* id
* nome
* brand
* coordinate
* insertDate
* distance
* elenco carburanti

Ogni carburante contiene:

* id
* fuelId
* nome
* prezzo
* self/servito

Esempio:

```json
{
    "fuelId":2,
    "price":1.989,
    "name":"Gasolio",
    "isSelf":true
}
```

Non è necessario fare scraping HTML.

L'API restituisce direttamente JSON.

---

# Google Maps

Le chiamate a Google Maps servono solamente per convertire la città in coordinate.

Nel progetto NON verranno utilizzate.

Le coordinate della città saranno salvate direttamente nella configurazione.

Esempio:

```json
{
    "city":"Sciacca",
    "lat":37.5086753,
    "lng":13.0782746,
    "radius":5
}
```

---

# Tecnologie

Backend

* Python 3.12
* requests oppure httpx

Frontend

* React
* Vite
* TypeScript
* TailwindCSS
* Recharts oppure Apache ECharts

Hosting

* GitHub Pages

Automazione

* GitHub Actions

Notifiche

* Discord Webhook

---

# Repository

```
/
│
├── collector/
│   ├── collect.py
│   ├── config.json
│   └── requirements.txt
│
├── data/
│   ├── history.json
│   ├── stations.json
│   └── metadata.json
│
├── web/
│   ├── src/
│   └── public/
│
├── .github/
│   └── workflows/
│       collect.yml
│
└── README.md
```

---

# Raccolta dati

La GitHub Action verrà eseguita una volta al giorno.

Esempio:

```
08:00 UTC
```

Flusso:

1. chiama l'API
2. riceve il JSON
3. salva snapshot
4. aggiorna file storico
5. commit automatico

---

# Modello dati

Per semplicità si utilizzeranno snapshot completi.

Ogni esecuzione salva tutti i distributori.

Formato:

```json
{
    "timestamp":"2026-07-28T08:00:00Z",
    "city":"Sciacca",
    "radius":5,
    "stations":[
        ...
    ]
}
```

Ogni snapshot è indipendente.

Questo rende semplicissima la lettura lato frontend.

---

# File dati

Possibili strategie.

## Opzione A

Un unico file

```
history.json
```

Pro

semplice

Contro

diventa grande nel tempo

---

## Opzione B (preferita)

Un file per anno.

```
2026.json
2027.json
2028.json
```

Molto più scalabile.

---

# Dashboard

Single Page Application.

Nessun routing.

La dashboard deve essere completamente interattiva.

Ogni filtro aggiorna tutti i grafici.

---

# Filtri

* carburante
* self/servito
* distributore
* marchio
* intervallo temporale
* ricerca testuale

---

# KPI iniziali

Mostrare in alto:

* ultimo aggiornamento
* distributore più economico
* prezzo minimo
* prezzo massimo
* prezzo medio
* numero distributori monitorati

---

# Grafici

## 1

Andamento prezzo minimo nel tempo

Linea.

---

## 2

Andamento prezzo medio della città

Linea.

---

## 3

Prezzo dei singoli distributori

Multi-line chart.

---

## 4

Classifica distributori

Bar chart.

---

## 5

Distribuzione dei prezzi

Istogramma.

Serve a capire quanto un distributore sia stabile.

---

## 6

Box plot

Distribuzione prezzi per distributore.

---

## 7

Heatmap

Distribuzione geografica.

Colore in funzione del prezzo.

---

## 8

Timeline distributore

Quando viene selezionato un distributore:

```
28 Lug
2.009

26 Lug
2.019

24 Lug
2.049
```

---

## 9

Numero variazioni

Grafico con il numero di cambi prezzo nel tempo.

---

## 10

Differenza rispetto alla media cittadina

Per ogni distributore.

---

# Tabelle

Tabella ordinabile.

Colonne:

* distributore
* brand
* diesel self
* diesel servito
* benzina
* GPL
* ultimo aggiornamento

---

# Metriche interessanti

Per ogni distributore calcolare:

* prezzo minimo storico
* prezzo massimo storico
* prezzo medio
* deviazione standard
* numero variazioni
* giorni dall'ultima variazione
* prezzo attuale
* differenza dalla media cittadina

---

# Notifiche Discord

Webhook.

Eventi iniziali:

* nuovo minimo storico
* prezzo sotto soglia configurabile
* distributore cambia prezzo
* media cittadina scende oltre X centesimi
* migliore distributore cambia

Messaggio esempio:

```
⛽ Nuovo minimo

Distributore:
9830 SCIACCA

Gasolio Self

1.969 €/L

-4 centesimi rispetto a ieri
```

---

# Configurazione

File config.json

```json
{
  "city":"Sciacca",
  "lat":37.5086753,
  "lng":13.0782746,
  "radius":5,
  "fuel":"diesel-self",
  "discordWebhook":"..."
}
```

---

# Possibili estensioni future

* monitoraggio più città
* confronto città
* monitoraggio province
* esportazione CSV
* API REST personale
* Progressive Web App
* modalità mobile ottimizzata
* dark mode
* confronto tra marchi
* previsione andamento tramite regressione
* media mobile
* Bollinger Bands
* previsione del momento ottimale per il rifornimento
* confronto con il prezzo nazionale
* importazione dati storici ministeriali se disponibili

---

# Obiettivo finale

Una dashboard completamente statica, gratuita, facilmente distribuibile tramite GitHub Pages, con raccolta automatica dei dati tramite GitHub Actions e visualizzazioni interattive che permettano di analizzare l'evoluzione dei prezzi del carburante nel tempo e ricevere notifiche automatiche quando si presentano opportunità di risparmio.
