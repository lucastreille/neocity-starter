# NeonCity -- Projet MFE en equipe

Vous allez construire une ville cyberpunk en Micro-Frontends.
Chaque groupe possede 1-2 MFEs. Un seul Event Bus fait tout communiquer.

## Architecture

  shell        (port 3000) -- l'orchestrateur, charge les 11 MFEs
  mfe-hacker   (port 3001) -- terminal de commandes, declenche les evenements
  mfe-weather  (port 3002) -- station meteo, reagit aux commandes
  mfe-powergrid(port 3003) -- reseau electrique, cascades de pannes
  mfe-billboard(port 3004) -- panneaux publicitaires, messages dynamiques
  mfe-drones   (port 3005) -- essaim de drones, formations visuelles
  mfe-radio    (port 3006) -- radio underground, messages d'urgence
  mfe-citizens (port 3007) -- feed social, panique citoyenne
  mfe-cctv     (port 3008) -- cameras de surveillance, detection d'intrusion
  mfe-traffic  (port 3009) -- controle du trafic, feux tricolores
  mfe-hospital (port 3010) -- hopital, gestion de crise
  mfe-oracle   (port 3011) -- IA de la ville, analyses et predictions

## Contrats d'evenements

  hacker:command   -> emis par HackerTerminal (commandes: storm, blackout, riot, drones, love, reset)
  weather:change   -> emis par WeatherTower (condition, intensity, temperature, toxicity)
  power:outage     -> emis par PowerGrid (zones, severity, cityPower)
  crowd:panic      -> emis par CitizenFeed (level, trending)
  drone:formation  -> emis par DroneSwarm (formation)
  hospital:alert   -> emis par NeoHospital (status, beds, generator)
  radio:broadcast  -> emis par UndergroundRadio (message, frequency, isEmergency)
  oracle:prediction-> emis par AIOracle (threat, recommendation)

## Ce qui est fourni

  - Tout le JSX (structure HTML + CSS) de chaque composant
  - Le Shell avec tous les remotes configures
  - shared/eventBus.js (meme que PixelArena)

## Ce que chaque groupe doit ecrire

  - Les emit() et on() dans son composant
  - Le cleanup dans les useEffect
  - La logique metier (comment reagir aux evenements recus)

## Lancer

  Dans chaque dossier MFE :
    npm install
    npm start

  Le Shell :
    cd shell && npm install && npm start
    Ouvrir http://localhost:3000
