# Plan d'implémentation T017 : Export PDF du diagnostic public

## Contexte
Nous devons générer un PDF contenant les résultats du scan (pour ChatGPT, Claude, Perplexity), avec le logo "Cited". Ce PDF sera accessible publiquement sans compte.

## Tâches (Tasks)

### Task 1: Installer `@react-pdf/renderer`
- Ajouter `@react-pdf/renderer` au projet `cited` (`npm install @react-pdf/renderer`).
- Vérifier que l'installation s'est bien passée.

### Task 2: Créer le moteur de rendu PDF (`cited/lib/reports/renderDiagnosticPdf.tsx`)
- Créer un composant React-PDF qui prend en entrée le `ScanReport` et les résultats multi-bots.
- Le document doit afficher le logo "Cited", le domaine analysé, la date du scan, et les 3 verdicts (avec cause et correctif).
- Exporter une fonction `generateDiagnosticPdfBuffer(report: ScanReport, results: ScanCoreResult[])` qui retourne le buffer du PDF généré en utilisant `renderToStream` ou `renderToBuffer`.

### Task 3: Créer la Server Action (`cited/app/actions/publicReport.ts`)
- Créer une action serveur `downloadPublicReport(report: ScanReport, results: ScanCoreResult[])` ou une route API (`/api/pdf/diagnostic`) qui prend le payload JSON et renvoie un PDF téléchargeable (headers `Content-Type: application/pdf`, `Content-Disposition: attachment`).
- L'approche API Route (`/api/pdf/diagnostic` en POST) est souvent plus simple pour télécharger un fichier binaire depuis le client dans Next.js.

### Task 4: Intégrer le bouton de téléchargement dans l'UI
- Modifier `cited/components/home/ScanForm.tsx` pour ajouter un bouton "Télécharger le rapport (PDF)".
- Ce bouton enverra le `result.report` et `result.results` à l'API/Action et déclenchera le téléchargement du fichier `diagnostic-[domaine].pdf`.
