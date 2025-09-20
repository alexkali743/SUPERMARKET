# 🛒 Supermarket E-Shop

Η παρούσα πτυχιακή εργασία υλοποιεί ένα ηλεκτρονικό κατάστημα (e-shop supermarket) με **React** στο frontend και **Python/GraphDB** στο backend.  
Ο στόχος είναι η διαχείριση προϊόντων, κατηγοριών, παραγγελιών και χρηστών με χρήση σημασιολογικών τεχνολογιών.

---

## Χαρακτηριστικά
- Εγγραφή / Είσοδος χρηστών (user / admin).
- Προσθήκη προϊόντων στο καλάθι και ολοκλήρωση παραγγελίας.
- Ιστορικό παραγγελιών για κάθε χρήστη.
- Διαχείριση προϊόντων (προσθήκη, επεξεργασία, διαγραφή) από admin.
- Σύνδεση με **GraphDB** για αποθήκευση και ερώτηση RDF δεδομένων.

---

## Εγκατάσταση & Εκτέλεση

Ακολουθούν τα βήματα για να τρέξει η εφαρμογή σε τοπικό περιβάλλον.

### 1. Κλωνοποίηση του repository
```bash
git clone https://github.com/alexkali743/SUPERMARKET
cd supermarket
```

### 2. Εκκίνηση Backend (Python + FastAPI)

Ανοίγεις ένα **terminal** και πηγαίνεις στον φάκελο `supermarket`:

```bash
cd supermarket
```

Ενεργοποιείς το virtual environment (προαιρετικό) και εγκαθιστάς τις εξαρτήσεις:

```bash
pip install -r requirements.txt
```

Έπειτα εκτελείς τον server:

```bash
uvicorn app.main:app --reload
```

Ο backend server θα τρέχει στο:  
`http://localhost:8000`

---

### 3. Εκκίνηση Frontend (React)

Σε **νέο terminal**, πηγαίνεις στον φάκελο `frontend`:

```bash
cd supermarket/frontend
```

Εγκαθιστάς τα πακέτα:

```bash
npm install
```

Και τρέχεις την εφαρμογή:

```bash
npm start
```

Το frontend θα ανοίξει αυτόματα στον browser στη διεύθυνση:  
`http://localhost:3000`

---

## Δομή φακέλων
```
supermarket/
│
├── app/           # Backend (Python FastAPI)
├── frontend/      # Frontend (React)
├── static/        # Στατικά αρχεία (εικόνες προϊόντων)
├── templates/     # Templates (αν χρησιμοποιούνται)
└── README.md      # Το παρόν αρχείο
```

---

## Τεχνολογίες
- **Frontend:** React, CSS
- **Backend:** Python (FastAPI), RDFLib
- **Database:** GraphDB (RDF Triple Store)

---

## Αλέξανδρος Καλύβας
Η εφαρμογή αναπτύχθηκε στο πλαίσιο πτυχιακής εργασίας.  

